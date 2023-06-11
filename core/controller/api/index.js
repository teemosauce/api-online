const fse = require("fs-extra");
const { match } = require("path-to-regexp");
const Result = require("../../utils/result");
const RouterManager = require("../../router/index");
const { nanoid } = require("nanoid");
const utils = require("../../utils");

function validateWorkspace(name) {
  const workspace = utils.getWorkspaceByName(name);
  return fse.existsSync(workspace);
}

function validatePackageJson(name) {
  const packageJSON = utils.getWorkspacePackageJSON(name);
  return fse.existsSync(packageJSON);
}

async function readPackageJSON(name) {
  const packageJSON = utils.getWorkspacePackageJSON(name);

  const content = await fse.readJSON(packageJSON, {
    encoding: "utf-8",
  });
  return content.routes;
}

async function writePackageJSON(name, content) {
  const packageJSON = utils.getWorkspacePackageJSON(name);

  if (Array.isArray(content)) {
    content = {
      workspace: name,
      routes: content,
    };
  }
  return await fse.writeJson(packageJSON, content, {
    encoding: "utf-8",
  });
}

/**
 * 判断url是否冲突
 * @param {*} workspace
 * @param {*} method
 * @param {*} url
 */
async function exist(name, id, method, url) {
  const routes = await readPackageJSON(name);
  const route = routes.find((route) => {
    if (id == route.id) {
      return false;
    }

    if (route.method != method) {
      return false;
    }

    if (route.url == url) {
      return true;
    }
    return match(route.url)(url) || match(url)(route.url);
  });
  console.log(route, {
    name,
    id,
    method,
    url,
  });
  return !!route;
}

module.exports = {
  async create(ctx) {
    const { workspace } = ctx.params;
    const { method, url, code } = ctx.request.body;
    const result = new Result();

    if (!validateWorkspace(workspace)) {
      return result.setMessage("创建api失败，工作空间不存在！").toJSON();
    }

    if (!validatePackageJson(workspace)) {
      return result.setMessage("创建api失败，工作空间异常！").toJSON();
    }

    if (await exist(workspace, "", method, url)) {
      return result.setMessage("创建api失败，url冲突！").toJSON();
    }

    const routes = await readPackageJSON(workspace);

    // 添加最新的路由信息
    const newRoute = {
      id: nanoid(16).toLowerCase(),
      method,
      url,
      code,
    };
    routes.push(newRoute);

    await writePackageJSON(workspace, routes);

    RouterManager.addRoute(workspace, newRoute); // 创建完之后直接加入到根路由中间件中

    result.setSuccess(true).setData(newRoute);
    return result.setMessage("添加api成功").toJSON();
  },

  async update(ctx) {
    let { workspace, id } = ctx.params;
    const { method, url, code } = ctx.request.body;
    const result = new Result();

    if (!validateWorkspace(workspace)) {
      return result.setMessage("编辑api失败，工作空间不存在！").toJSON();
    }

    if (!validatePackageJson(workspace)) {
      return result.setMessage("编辑api失败，工作空间异常！").toJSON();
    }

    if (await exist(workspace, id, method, url)) {
      return result.setMessage("编辑api失败，url冲突！").toJSON();
    }

    const routes = await readPackageJSON(workspace);

    const index = routes.findIndex((route) => {
      return route.id == id;
    });

    if (index < 0) {
      return result.setMessage("编辑api失败，api不存在！").toJSON();
    }

    const oldRoute = routes[index];
    const newRoute = {
      id: id,
      method,
      url,
      code,
    };
    // 移除旧的 并添加新的
    routes.splice(index, 1, newRoute);

    await writePackageJSON(workspace, routes);

    RouterManager.replaceRoute(workspace, oldRoute, newRoute); // 创建完之后直接加入到根路由中间件中

    result.setSuccess(true).setData(newRoute);
    return result.setMessage("编辑api成功").toJSON();
  },

  async getById(ctx) {
    const { workspace, id } = ctx.params;
    const result = new Result();

    if (!validateWorkspace(workspace)) {
      return result.setMessage("查询api失败，工作空间不存在！").toJSON();
    }

    if (!validatePackageJson(workspace)) {
      return result.setMessage("查询api失败，工作空间异常！").toJSON();
    }

    const routes = await readPackageJSON(workspace);

    const route = routes.find((route) => route.id == id);

    if (!route) {
      return result.setMessage("API不存在").toJSON();
    }
    route.workspace = workspace;

    result.setSuccess(true).setData(route);
    return result.setMessage("获取API成功").toJSON();
  },

  async list(ctx) {
    const { workspace } = ctx.params;
    let result = new Result();

    if (!validateWorkspace(workspace)) {
      return result.setMessage("查询api失败，工作空间不存在！").toJSON();
    }

    if (!validatePackageJson(workspace)) {
      return result.setMessage("查询api失败，工作空间异常！").toJSON();
    }

    const routes = await readPackageJSON(workspace);
    routes.forEach((route) => {
      route.workspace = workspace;
    });

    result.setSuccess(true).setData(routes);
    return result.setMessage("获取全部API成功").toJSON();
  },

  async remove(ctx) {
    const { workspace, id } = ctx.params;
    const result = new Result();

    if (!validateWorkspace(workspace)) {
      return result.setMessage("删除api失败，工作空间不存在！").toJSON();
    }

    if (!validatePackageJson(workspace)) {
      return result.setMessage("删除api失败，工作空间异常！").toJSON();
    }

    const routes = await readPackageJSON(workspace);

    const index = routes.findIndex((route) => route.id == id);

    if (index < 0) {
      return result.setMessage("删除api失败，api不存在！").toJSON();
    }

    const route = routes[index];
    routes.splice(index, 1);

    await writePackageJSON(workspace, routes);

    RouterManager.removeRoute(workspace, route); // 创建完之后直接加入到根路由中间件中

    result.setSuccess(true).setData(route);
    return result.setMessage("删除api成功").toJSON();
  },
};
