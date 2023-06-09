const { readdirSync, existsSync } = require("fs");
const path = require("path");
const KoaRouter = require("../middleware/koa@router");

const rootRouter = new KoaRouter("/myspace");
/**
 * 在根路由中间件中添加一个指定工作空间的路由信息
 *
 * @param {string} workspace 指定工作空间
 * @param {object} route 路由信息
 */
function addRouteToRootRouter(workspace, { method, url, code }) {
  rootRouter.addRoute(method, `/${workspace}${url}`, code);
}
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
  addRoute: addRouteToRootRouter,
};

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
    routes.forEach((route) => {
      addRouteToRootRouter(workspaceName, route);
    });
  } else {
    console.error(`没有找到${package}.`);
  }
});

// 由于app.listen 调用后 不能再添加新的中间件 所以不能把第三方自定义路由注册为中间件
// 只能弄一个根路由的中间件 ，在中间件内再添加路由信息
// path.resolve(__dirname)
