const fse = require("fs-extra");
const KoaRouter = require("../middleware/Router");
const {
  readPackageJSON,
  validatePackageJson,
  getWorkspace,
} = require("../utils/workspace");
const Result = require("../utils/result");
const vm = require("node:vm");

const rootRouter = new KoaRouter({
  prefix: "/workspace",
});

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
  // 先把ctx.body替换成私有的$$body
  code = code.replace(/ctx\.body/g, "ctx._body_");
  return `'use strict';
  (async function(ctx) {
    try {
      ${code}
    } catch(err) {
      ctx._body_ = {
        _catch_: err.stack,  
      }
    }
  })(ctx);
    `;
}

/**
 * 在根路由中间件中添加一个指定工作空间的路由信息
 *
 * @param {string} workspace 指定工作空间
 * @param {object} route 路由信息
 */
function addRoute(workspace, route) {
  // route.workspace = workspace;
  // rootRouter.addRoute(route);

  let { method, url, code } = route;

  method = method.toLowerCase();
  if (rootRouter[method]) {
    rootRouter[method](`/${workspace}${url}`, async function handler(ctx) {
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
          return result.setMessage("API执行失败").toJSON();
        }
      }

      console.log("-----------开始执行自定义API--------------");
      ctx.$$body = null;
      const context = {
        ctx,
      };

      try {
        await handler.script.runInNewContext(context, {
          timeout: 2000,
        });

        if (ctx._body_ && ctx._body_._catch_) {
          // 用户代码有异常
          result.setData(ctx._body_._catch_).setMessage("API执行失败");
        } else {
          result.setSuccess(true).setData(ctx._body_);
        }
      } catch (err) {
        result.setData(err).setMessage("API执行失败");
      }
      console.log("-----------自定义API执行完毕--------------");
      console.log(result);
      return result.toJSON();
    });
  }

  // console.log(rootRouter.stack);
}

// function replaceRoute(workspace, oldRoute, newRoute) {
//   oldRoute.workspace = workspace;
//   newRoute.workspace = workspace;
//   rootRouter.replaceRoute(oldRoute, newRoute);
// }

// function removeRoute(workspace, route) {
//   rootRouter.delete(`/${workspace}/`);
// }

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
  addRoute,
  // replaceRoute,
  // removeRoute,
};

async function loadWorkspace() {
  const workspaceHome = getWorkspace();

  if (!(await fse.pathExists(workspaceHome))) {
    await fse.mkdir(workspaceHome);
    return;
  }

  const workspaceNameList = await fse.readdir(getWorkspace(), {
    withFileTypes: true,
  });

  console.log(workspaceNameList);
  workspaceNameList.forEach(async (dirent) => {
    console.log("dirent, ", dirent);
    const { name: workspace } = dirent;
    if (await validatePackageJson(workspace)) {
      let { routes } = await readPackageJSON(workspace);
      routes.forEach((route) => {
        addRoute(workspace, route);
      });
    } else {
      console.error(`没有找到${packageJson}.`);
    }
  });
}

loadWorkspace();

const routers = [
  require("./user"),
  require("./file"),
  require("./api"),
  require("./workspace"),
  rootRouter.routes(),
];

// 由于app.listen 调用后 不能再添加新的中间件 所以不能把第三方自定义路由注册为中间件
// 只能弄一个根路由的中间件 ，在中间件内再添加路由信息
// path.resolve(__dirname)
