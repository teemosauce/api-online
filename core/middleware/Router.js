// 扩充KoaRouter的功能
const KoaRouter = require("@koa/router");
const Layer = require("@koa/router/lib/layer");

class Router extends KoaRouter {
  register(path, methods, middleware, opts = {}) {
    const { stack: layers } = this;
    if (Array.isArray(path)) {
      return super.register(path, methods, middleware, opts);
    }

    if (opts.sensitive || this.opts.sensitive) {
        return super.register(path, methods, middleware, opts);
    }
    
    const route = new Layer(path, methods, middleware, {
      end: opts.end === false ? opts.end : true,
      name: opts.name,
      sensitive: opts.sensitive || this.opts.sensitive || false,
      strict: opts.strict || this.opts.strict || false,
      prefix: opts.prefix || this.opts.prefix || "",
      ignoreCaptures: opts.ignoreCaptures,
    });

    if (this.opts.prefix) {
      route.setPrefix(this.opts.prefix);
    }

    methods.forEach((method) => {
      method = method.toUpperCase();
      let matched = this.match(route.path, method);

      if (!matched.route) {
        matched.path = [];
        matched.pathAndMethod = [];

        for (let i = 0, len = layers.length; i < len; i++) {
          let layer = layers[i];

          if (route.match(layer.path)) {
            matched.path.push(layer);
            if (layer.methods.length === 0 || ~layer.methods.indexOf(method)) {
              matched.pathAndMethod.push(layer);
              if (layer.methods.length > 0) matched.route = true;
            }
          }
        }
      }

      if (matched.route) {
        // 把冲突的路由全部删除
        while (matched.pathAndMethod.length) {
          let layer = matched.pathAndMethod.shift();

          let index = layers.findIndex((item) => item == layer);

          console.log("有冲突的路由， 把之前注册的删除掉");
          // 删除
          layers.splice(index, 1);
        }
      }
    });

    // 如果注册的路由有冲突 则采用后面的覆盖前面的方式
    super.register(path, methods, middleware, opts);
  }
}

module.exports = Router;
