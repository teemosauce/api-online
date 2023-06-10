const fse = require("fs-extra");
const KoaRouter = require("../middleware/koa@router");

const Result = require("../utils/result");

const router = new KoaRouter("/:workspace/apis");
const path = require("path");
const RouterManager = require("./index");
const { nanoid } = require("nanoid");

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

  if (!fse.existsSync(package)) {
    // 存在的话编辑文件 采用读取文件的方式或者require
    return result.setMessage("创建api失败，工作空间异常！").toJSON();
  }

  // 存在的话编辑文件 采用读取文件的方式或者require
  const content = await fse.readJSON(package, {
    encoding: "utf-8",
  });
  const routes = content.routes;

  // 添加最新的路由信息
  const newRoute = {
    id: nanoid(16).toLowerCase(),
    method,
    url,
    code,
  };
  routes.push(newRoute);

  const packageJson = {
    workspace: workspaceName,
    routes,
  };
  await fse.writeJson(package, packageJson, {
    encoding: "utf-8",
  });

  RouterManager.addRoute(workspaceName, newRoute); // 创建完之后直接加入到根路由中间件中

  result.setSuccess(true).setMessage("添加api成功");
  result.setData(newRoute);
  return result.toJSON();
});

router.put("/:id", async (ctx) => {
  const { workspaceDir, body } = ctx.request;
  let { workspace: workspaceName, id } = ctx.params;
  const { method, url, code } = body;

  const workspaceNameDir = path.resolve(workspaceDir, workspaceName);
  const result = new Result();

  if (!fse.existsSync(workspaceDir)) {
    return result.setMessage("编辑api失败，工作空间不存在！").toJSON();
  }

  const package = path.resolve(workspaceNameDir, "package.json");
  if (!fse.existsSync(package)) {
    // 文件不存在的话
    return result.setMessage("编辑api失败，工作空间异常！").toJSON();
  }
  const content = await fse.readJSON(package, {
    encoding: "utf-8",
  });
  let routes = content.routes;

  const index = routes.findIndex((route) => {
    return route.id == id;
  });

  if (index < 0) {
    return result.setMessage("编辑api失败，要编辑的api不存在！").toJSON();
  }

  const oldRoute = routes[index];
  const newRoute = {
    id: id,
    method,
    url,
    code,
  };
  routes.splice(index, 1, newRoute);

  const packageJson = {
    workspace: workspaceName,
    routes,
  };
  await fse.writeJson(package, packageJson, {
    encoding: "utf-8",
  });

  RouterManager.replaceRoute(workspaceName, oldRoute, newRoute); // 创建完之后直接加入到根路由中间件中
  result.setSuccess(true).setMessage("编辑api成功");
  result.setData(newRoute);
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
    routes = content.routes.map((route) => {
      route.workspace = workspaceName;
      return route;
    });
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
    route.workspace = workspaceName;
    result.setSuccess(true).setData(route);
    result.setMessage("获取API成功");
  } else {
    result.setMessage("API不存在");
  }
  return result.toJSON();
});

router.delete("/:id", async (ctx) => {
  const { workspaceDir } = ctx.request;
  const { workspace: workspaceName, id } = ctx.params;
  const workspaceNameDir = path.resolve(workspaceDir, workspaceName);

  const package = path.resolve(workspaceNameDir, "package.json");

  const result = new Result()
  if (!fse.existsSync(package)) {
    // 文件不存在的话
    return result.setMessage("删除api失败，工作空间异常！").toJSON();
  }
  const content = await fse.readJSON(package, {
    encoding: "utf-8",
  });
  let routes = content.routes;

  let index = routes.findIndex((route) => {
    return route.id == id;
  });

  if (index < 0) {
    return result.setMessage("删除api失败，要删除的api不存在！").toJSON();
  }

  const route = routes[index];
  routes.splice(index, 1);

  const packageJson = {
    workspace: workspaceName,
    routes,
  };
  await fse.writeJson(package, packageJson, {
    encoding: "utf-8",
  });
  RouterManager.removeRoute(workspaceName, route); // 创建完之后直接加入到根路由中间件中
  result.setSuccess(true).setMessage("删除api成功");
  result.setData(route);
  return result.toJSON();
});

module.exports = router.router();
