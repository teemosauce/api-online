// 扩充KoaRouter的功能
const KoaRouter = require("@koa/router");
const crypto = require("crypto");
const Result = require("../utils/result");
const vm = require("node:vm");
const { wrapCode } = require("../utils");

function md5(str) {
  return crypto.createHash("md5").update(str).digest("hex");
}

class Router extends KoaRouter {
  constructor(opts = {}) {
    super(opts);
    this.uniqueStack = new Map();
  }

  addCodeRoute(route) {
    let { method, url, code } = route;
    method = method.toLowerCase();
    this[method](url, async function handler(ctx) {
      const result = new Result();

      if (!handler.script) {
        // 把用户的代码包装一下
        console.log("*********code start************");
        console.log("=============== source code ===============");
        console.log(code);
        let scriptCode = wrapCode(code);
        console.log("=============== wrap code ===============");
        console.log(scriptCode);
        console.log("*********code end************");

        try {
          handler.script = new vm.Script(scriptCode);
        } catch (err) {
          result.setData(err.stack.replace(/ctx\._body_/g, "ctx.body"));
          return result.setMessage("执行失败");
        }
      }

      console.log("-----------开始执行自定义API--------------");
      const SYMBOL_ERROR_KEY = Symbol("Symbol.error");
      const context = {
        ctx,
        SYMBOL_ERROR: SYMBOL_ERROR_KEY,
      };

      try {
        await handler.script.runInNewContext(context, {
          timeout: 2000,
        });

        // if (ctx._body_ && ctx._body_._catch_) {
        //   // 用户代码有异常
        //   result.setData(ctx._body_._catch_).setMessage("API执行失败");
        // } else {
        //   result.setSuccess(true).setData(ctx._body_);
        // }

        if (ctx[SYMBOL_ERROR_KEY]) {
          // 用户代码有异常
          result.setData(ctx[SYMBOL_ERROR_KEY].stack).setMessage("执行失败");
        } else {
          result.setSuccess(true).setData(ctx.body);
        }
      } catch (err) {
        result.setData(err).setMessage("执行失败");
      }
      console.log("-----------自定义API执行完毕--------------");
      result.setMessage("执行成功");
      return result;
    });
  }

  removeCodeRoute(route) {
    const { stack, uniqueStack } = this;
    let { method, url } = route;
    method = method.toLowerCase();
    let uniqueKey = md5(method + url);
    if (uniqueStack.has(uniqueKey)) {
      let layer = uniqueStack.get(uniqueKey);

      let index = this.stack.findIndex((l) => l == layer);

      if (index >= 0) {
        stack.splice(index, 1);
        uniqueStack.delete(uniqueKey)
      }
    }
  }

  register(path, methods, middleware, opts = {}) {
    const { stack, uniqueStack } = this;
    super.register(path, methods, middleware, opts);

    // if (opts.sensitive || this.opts.sensitive) {
    //   return super.register(path, methods, middleware, opts);
    // }

    let uniqueKey = md5(methods[0] + path);
    // 如果注册的路由有冲突 则采用后面的覆盖前面的方式
    let lastLayer = stack[stack.length - 1];
    uniqueStack.set(uniqueKey, lastLayer);
  }
}

module.exports = Router;
