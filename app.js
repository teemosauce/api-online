const Koa = require("koa");
const router = require("./core/router/index");
const { koaBody } = require("koa-body");
const Result = require("./core/utils/result");
const app = new Koa();

// 记录日志、统计时间的中间件
app.use(async (ctx, next) => {
  // 给每个请求都加上工作空间的主目录
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

app.use(async (ctx, next) => {
  let result = await next();
  if (result) {
    if (result instanceof Result) {
      result = result.toJSON();
    }
  } else {
    result = new Result().setSuccess(true).toJSON();
  }
  ctx.body = result;
  
});

// 所有的路由中间件
router.mount(app);

// 错误处理中间件
app.use(async (ctx, next) => {
  console.log("最后一个");
  ctx.response.status = 404;
  ctx.body = `404`;
});

let PORT = 8999;
app.listen(PORT, () => {
  console.log(`测试服务${PORT}启动成功！`);
});
