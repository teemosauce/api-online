const { readdirSync, existsSync } = require("fs");
const path = require("path");
const KoaRouter = require("../middleware/koa@router");

const rootRouter = new KoaRouter("/myspace");
const routers = [
  rootRouter.router(),
  require("./user"),
  require("./file"),
  require("./api"),
  require("./workspace"),
];

const WORKSPACE_DIR = path.resolve(__dirname, "workspace");
const workspaceNameList = readdirSync(WORKSPACE_DIR, {
  withFileTypes: true,
});

workspaceNameList.forEach((dirent) => {
  const { name: workspaceName } = dirent;
  const package = path.resolve(WORKSPACE_DIR, workspaceName, "package.json");
  if (existsSync(package)) {
    const pkg = require(package);
    const { routes } = pkg;
    routes.forEach(({ method, url, handler }) => {
      // const code = `(${func})`;
      // const handler = safeEval(
      //   code,
      //   {},
      //   {
      //     timeout: 500,
      //   }
      // );
      rootRouter.addRoute(method, `/${workspaceName}${url}`, handler);
    });
  } else {
    console.error(`没有找到${package}.`);
  }
});

// 由于app.listen 调用后 不能再添加新的中间件 所以不能把第三方自定义路由注册为中间件
// 智能弄一个根路由的中间件 ，在中间件内再添加路由信息
// path.resolve(__dirname)

// 这里需要动态引入workspace下面的所有文件
// 用的时候再 有个问题 后续的中间件顺序会有问题
// require("./workspace/xyoFHPWSLqboVSw_Quyzi")a

module.exports = {
  /**
   * 把所有的路由挂载到app实例上
   * @param {*} app
   */
  mount(app) {
    routers.forEach((router) => {
      app.use(router);
    });
  },
  addRoute: rootRouter.addRoute,
};
