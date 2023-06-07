const fs = require("fs");
const KoaRouter = require("../middleware/koa@router");

const Result = require("../utils/result");

const router = new KoaRouter("/api");
const path = require("path");

router.post("/create", async (ctx) => {
  const { workspaceDir, body } = ctx.request;
  const { workspace: workspaceName, method, url, handler } = body;

  const workspaceNameDir = path.resolve(workspaceDir, workspaceName);
  const result = new Result();

  if (!fs.existsSync(workspaceDir)) {
    return result.setMessage("创建api失败，工作空间不存在！").toJSON();
  }
  const routerFile = path.resolve(workspaceNameDir, "index.js");

  if (!fs.existsSync(routerFile)) {
    let content = `
const KoaRouter = require("../../../middleware/koa@router");
const router = new KoaRouter("/${workspaceName}");
router.${method}("${url}", ${handler});
module.exports = router.router();
    `;
    fs.writeFileSync(routerFile, content, 'utf-8');
  }

  result.setSuccess(true).setMessage("添加api成功");
  return result.toJSON();
});

module.exports = router.router();
