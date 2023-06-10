const { pathToRegexp, match } = require("path-to-regexp");
const vm = require("node:vm");
/**
 * 简单实现一个路由中间件
 */

const METHODS = ["GET", "POST", "PUT", "DELETE"]; // 这里就简单定义一个get和post

const matchFunctionCached = new Map();

/**
 * 包装代码
 * @param {string} code 用户编写的代码
 * @returns 包装后的代码
 *
 * 示例:
 * 源码:
 *  ctx.body = "Hello World"
 * 包装后:
   'use strict';
   (async function(ctx) {
    try {
       ctx.$body = "Hello World"
     } catch (err) {
       ctx.$body = {
         $catch: 1, 
         message: err.stack,
        }
    }
  })(ctx)
 */

function wrapCode(code) {
  // 先把ctx.body替换成私有的$body
  code = code.replace(/ctx\.body/g, "ctx.$body");
  return `'use strict';
(async function(ctx) {
  try {
    ${code}
  } catch(err) {
    ctx.$body = {
      $catch: 1,  
      message: err.stack,
    }
  }
})(ctx);
  `;
}

class KoaRouter {
  routesHandler = new Map();

  /**
   *
   * @param {String} prefix 路由公共前缀
   */
  constructor(prefix) {
    this.prefix = prefix || ""; // 路由前缀
    // this.initPrototypeMethods();
  }

  /**
   * 实例化所有的方法(例如 GET/POST/....)
   *
   */
  initPrototypeMethods() {
    METHODS.forEach((method) => {
      this[method.toLowerCase()] = (url, callback) => {
        return this.request(method, url, callback);
      };
    });
  }

  /**
   * 把所以得路由信息缓存起来 等中间件真正执行的时候再处理
   * @param {String} method 请求方法
   * @param {String} url 请求地址
   * @param {Function} handler 请求处理的函数
   */
  request(method = "GET", url = "", handler) {
    // 把所有的注册先缓存起来

    method = method.toUpperCase();
    let routeHandler = this.routesHandler.get(method);
    if (!routeHandler) {
      routeHandler = new Map(); // 定义不同方法类型的map
      this.routesHandler.set(method, routeHandler);
    }

    url = this.prefix + url;
    // const regexp = pathToRegexp(url); // 转换成正则表达式

    if (!matchFunctionCached.has(url)) {
      const fn = match(url, {
        decode: decodeURIComponent,
      });
      matchFunctionCached.set(url, fn);
    }
    routeHandler.set(url, handler); // 将请求路径和处理方法进行缓存
  }

  /**
   * 添加路由
   * @param {object} route 路由对象信息
   */
  addRoute(route) {
    let { workspace, method = "GET", url, code: handler } = route;
    url = `/${workspace}${url}`;
    this.request(method, url, handler);
  }
  /**
   * 移除指定路由
   * @param {object} route 路由信息
   * @returns
   */
  removeRoute(route) {
    let { workspace, method = "GET", url } = route;
    url = `/${workspace}${url}`;
    method = method.toUpperCase();
    let routeHandler = this.routesHandler.get(method);
    if (!routeHandler) {
      return;
    }
    url = this.prefix + url;
    if (matchFunctionCached.has(url)) {
      matchFunctionCached.delete(url);
    }
    routeHandler.delete(url);
  }

  /**
   * 先简单实现
   * @param {object} oldRoute  旧路由信息
   * @param {object} newRoute 新路由信息
   */
  replaceRoute(oldRoute, newRoute) {
    // if (oldRoute.workspace !== newRoute.workspace) {
    this.removeRoute(oldRoute);
    this.addRoute(newRoute);
    // }
  }
  /**
   * 返回真实的路由中间件
   *
   * @returns
   */
  router() {
    // 返回真实的中间件
    console.log(this.prefix, this.routesHandler);
    return async (ctx, next) => {
      if (ctx.body) {
        // 如果有路由已经完成 直接终止后续的路由
        return await next();
      }

      const { path, method } = ctx.request; // 获取传递过来的请求路径及方法

      if (!this.routesHandler.has(method)) {
        return await next();
      }

      const routeHandler = this.routesHandler.get(method); // 获取某方法类型下的所有路由

      // 这里简单的只是做了全路由的匹配，实际上是需要支持路由的形式 后续再支持/:k/user/:id的问题 /near/user/1

      for (let [regexp, handler] of routeHandler) {
        const matchFunction = matchFunctionCached.get(regexp);
        let matched = matchFunction(path);

        if (matched) {
          // 匹配到的话 取出参数放到ctx上面 并终止循环
          // console.log("matched", matched);
          ctx.params = matched.params;
          let result;
          if (typeof handler == "string" || typeof handler == "object") {
            // 自定义的处理函数 要在安全沙箱中运行，以避免出现超时等安全问题
            let script;
            if (typeof handler == "string") {
              // 把用户的代码包装一下
              console.log("*********code start************");
              console.log("=============== source code ===============");
              console.log(handler);
              const code = wrapCode(handler);
              console.log("=============== wrap code ===============");
              console.log(code);
              console.log("*********code end************");

              try {
                script = new vm.Script(code);
              } catch (err) {
                ctx.body = {
                  success: true,
                  message: "自定义API执行完成",
                  data: err.stack.replace(/ctx\.\$body/g, "ctx.body"),
                };
                return;
              }
              if (script) {
                routeHandler.set(regexp, script);
              }
            } else {
              script = handler;
            }
            ctx.$body = null;
            const context = {
              ctx,
            };
            console.log(script.cachedData);
            try {
              await script.runInNewContext(context, {
                timeout: 2000,
              });
            } catch (err) {
              ctx.body = {
                success: true,
                message: "自定义API执行完成",
                data: err,
              };
              return;
            }
            if (ctx.$body && ctx.$body.$catch) {
              // 用户代码有异常
              ctx.body = {
                success: true,
                message: "自定义API执行完成",
                data: ctx.$body.message,
              };
            } else {
              ctx.body = {
                success: true,
                message: "自定义API执行完成",
                data: ctx.$body,
              };
            }
            return;
          } else {
            try {
              result = await handler(ctx);
              ctx.body = result;
              return;
            } catch (err) {
              ctx.status = 500;
              ctx.body = err;
              console.error(err);
            }
          }
        }
      }

      // ctx.body = `${method}:${path}接口未定义`;
      return await next();
    };
  }
}
// 给原型上增加所有的方法(例如 GET/POST/....)
METHODS.forEach((method) => {
  KoaRouter.prototype[method.toLowerCase()] = function (url, callback) {
    if (typeof url == "function") {
      callback = url;
      url = "";
    }
    return this.request(method, url, callback);
  };
});

module.exports = KoaRouter;
