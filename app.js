const Koa = require("koa");
const path = require("path");
const router = require("./core/router");
const fs = require("fs");
const { koaBody } = require("koa-body");
const app = new Koa();

const WORKSPACE_DIR = path.resolve(
  path.dirname(__filename),
  "core/router/workspace"
);

if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR);
}

// 记录日志、统计时间的中间件
app.use(async (ctx, next) => {
  // 给每个请求都加上工作空间的主目录
  ctx.request.workspaceDir = WORKSPACE_DIR;

  console.log("接口请求开始......");
  console.log(ctx.request.inspect());
  const startTime = Date.now();

  await next();

  const responseTime = Date.now() - startTime;
  ctx.response.set("responseTime", responseTime);
  console.log("===========响应结果===========");
  console.log(ctx.body);
  console.log("=============================");
});

app.use(
  koaBody({
    multipart: true,
  })
);

// 所有的路由中间件
router.mount(app);

// 错误处理中间件
app.use(async function (ctx, next) {
  ctx.response.status = 404;
  // ctx.body = `404`;
});

let PORT = 8999;
app.listen(PORT, () => {
  console.log(`测试服务${PORT}启动成功！`);
});
