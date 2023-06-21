const KoaRouter = require("../middleware/Router");
const rootRouter = new KoaRouter({
  prefix: "/space",
  exclusive: true, // 如果路由一致，则只匹配最后一次添加进去的路由
});

// 提前导出 防止递归依赖问题
module.exports = {
  /**
   * 把所有的路由挂载到app实例上
   * @param {Application} app koa应用实例
   */
  mount(app) {
    routers.forEach((router) => {
      app.use(router);
    });
  },
  addRoute(route) {
    rootRouter.addCodeRoute(route);
  },
  removeRoute(route) {
    rootRouter.removeCodeRoute(route);

    console.log(rootRouter.stack.length)
    console.log(rootRouter.uniqueStack.size)
  },
};

const routers = [
  require("./test"),
  require("./workspace"),
  require("./api"),
  require("./workspace-api"),
  rootRouter.routes(),
];

// 由于app.listen 调用后 不能再添加新的中间件 所以不能把第三方自定义路由注册为中间件
// 只能弄一个根路由的中间件 ，在中间件内再添加路由信息
// path.resolve(__dirname)
