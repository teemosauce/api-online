const { pathToRegexp, match } = require("path-to-regexp");
const vm = require("node:vm");
/**
 * 简单实现一个路由中间件
 */

const METHODS = ["GET", "POST", "PUT", "DELETE"]; // 这里就简单定义一个get和post

const MATCH_FUNCTION_CACHE = Object.create(null);

/**
 * 包装代码
 * @param {string} code 用户编写的代码
 * @returns 包装后的代码
 *
 * 示例:
 * 源码:
 *  ctx.body = "Hello World"
 * 包装后:
 * 'use strict';
 * (async function(ctx, callback){
 *    try {
 *        ctx.body = "Hello World"
 *        callback(ctx.body)
 *    } catch (err) {
 *        callback(err.message)
 *    }
 *
 * })(ctx, callback)
 */

function wrapCode(code) {
  return `
  'use strict';
  (async function(ctx) {
    try {
      ${code}
    } catch(err) {
      ctx.body = {
        message: err,
        success: false,
      }
    }
  })(ctx)
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

    MATCH_FUNCTION_CACHE[url] =
      MATCH_FUNCTION_CACHE[url] ||
      match(url, {
        decode: decodeURIComponent,
      });
    routeHandler.set(url, handler); // 将请求路径和处理方法进行缓存
  }

  addRoute(method = "GET", url = "", handler) {
    this.request(method, url, handler);
  }

  /**
   * 返回真实的路由中间件
   *
   * @returns
   */
  router() {
    // 返回真实的中间件
    return async (ctx, next) => {
      console.log(this.routesHandler);
      if (ctx.body) {
        // 如果有路由已经完成 直接终止后续的路由
        return await next();
      }

      const { path, method } = ctx.request; // 获取传递过来的请求路径及方法
      console.log(this.prefix, path, method);

      if (!this.routesHandler.has(method)) {
        return await next();
      }

      const routeHandler = this.routesHandler.get(method); // 获取某方法类型下的所有路由

      // 这里简单的只是做了全路由的匹配，实际上是需要支持路由的形式 后续再支持/:k/user/:id的问题 /near/user/1

      for (let [regexp, handler] of routeHandler) {
        const matchFunction = MATCH_FUNCTION_CACHE[regexp];
        let matched = matchFunction(path);

        if (matched) {
          // 匹配到的话 取出参数放到ctx上面 并终止循环
          // console.log("matched", matched);
          ctx.params = matched.params;
          console.log(matched, handler);
          let result;
          if (typeof handler == "string" || typeof handler == "object") {
            // 自定义的处理函数 要在安全沙箱中运行，以避免出现超时等安全问题
            let script;
            if (typeof handler == "string") {
              // 把用户的代码包装一下
              const code = wrapCode(handler);
              script = new vm.Script(code);
              routeHandler.set(regexp, script);
            } else {
              script = handler;
            }

            const context = {
              ctx,
            };
            try {
              await script.runInNewContext(context, {
                timeout: 2000,
              });
              ctx.body = {
                success: true,
                message: "自定义API调用成功",
                data: ctx.body,
              };
            } catch (err) {
              ctx.body = {
                message: err,
                success: false,
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
