const fse = require("fs-extra");
const KoaRouter = require("../middleware/koa@router");

const Result = require("../utils/result");

const router = new KoaRouter("/:workspace/apis");
const path = require("path");
const RouterManager = require("./index");

router.post("/create", async (ctx) => {
  const { workspaceDir, body } = ctx.request;
  const { workspace: workspaceName } = ctx.params;
  const { method, url, code } = body;

  const workspaceNameDir = path.resolve(workspaceDir, workspaceName);
  const result = new Result();

  if (!fse.existsSync(workspaceDir)) {
    return result.setMessage("创建api失败，工作空间不存在！").toJSON();
  }
  const package = path.resolve(workspaceNameDir, "package.json");

  let routes = [];
  if (fse.existsSync(package)) {
    // 存在的话编辑文件 采用读取文件的方式或者require
    const content = await fse.readJSON(package, {
      encoding: "utf-8",
    });
    routes = content.routes;
  }

  // 添加最新的路由信息
  routes.push({
    method,
    url,
    code,
  });

  const packageJson = {
    workspace: workspaceName,
    routes,
  };
  await fse.writeJson(package, packageJson, {
    encoding: "utf-8",
  });

  RouterManager.addRoute(workspaceName, {
    method,
    url,
    code,
  }); // 创建完之后直接加入到根路由中间件中

  result.setSuccess(true).setMessage("添加api成功");
  result.setData({ method, url, code });
  return result.toJSON();
});

router.get("/list", async (ctx) => {
  const { workspaceDir } = ctx.request;
  const { workspace: workspaceName } = ctx.params;
  const workspaceNameDir = path.resolve(workspaceDir, workspaceName);
  const package = path.resolve(workspaceNameDir, "package.json");
  let routes = [];
  if (fse.existsSync(package)) {
    // 存在的话编辑文件 采用读取文件的方式或者require
    const content = await fse.readJSON(package, {
      encoding: "utf-8",
    });
    routes = content.routes;
  }

  let result = new Result();
  result.setSuccess(true).setData(routes);
  result.setMessage("获取全部API成功");

  return result.toJSON();
});

router.get("/:id/info", async (ctx) => {
  const { workspaceDir } = ctx.request;
  const { workspace: workspaceName, id } = ctx.params;
  const workspaceNameDir = path.resolve(workspaceDir, workspaceName);
  const package = path.resolve(workspaceNameDir, "package.json");
  let routes = [];
  if (fse.existsSync(package)) {
    // 存在的话编辑文件 采用读取文件的方式或者require

    console.log(package);
    const content = await fse.readJSON(package, {
      encoding: "utf-8",
    });
    routes = content.routes;
  }
  let route = routes[id];
  let result = new Result();
  if (route) {
    route.url = `/${workspaceName}${route.url}`;
    result.setSuccess(true).setData(route);
    result.setMessage("获取API成功");
  } else {
    result.setMessage("API不存在");
  }
  return result.toJSON();
});

module.exports = router.router();
