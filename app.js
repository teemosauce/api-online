const Koa = require("koa");
const router = require("./core/router");
const { koaBody } = require("koa-body");
const Result = require("./core/utils/result");
const app = new Koa();
const static = require("koa-static");
const conditional = require("koa-conditional-get"); // 走协商缓存时 判断文件是否新鲜 是否有变化
const etag = require("koa-etag"); // 生成文件的唯一tag标识
const responseTime = require("koa-response-time");
const pageHelper = require("./core/middleware/query-helper");
const sequelize = require("./core/database/sequelize");
const dynamicRoute = require("./core/middleware/dynamic-route");

// 记录日志、统计时间的中间件
// app.use(async (ctx, next) => {
//   // 给每个请求都加上工作空间的主目录
//   console.log("接口请求开始......");
//   console.log(ctx.request.inspect());
//   const startTime = Date.now();

//   await next();

//   const responseTime = Date.now() - startTime;
//   ctx.response.set("responseTime", responseTime);

//   console.log("===========响应结果===========");
//   console.log(ctx.body);
//   console.log("=============================");
// });

app.use(responseTime());

app.use(conditional());
app.use(etag());
app.use(
  static("public", {
    maxAge: 20 * 1000, // 缓存时间 10秒钟 主要用于测试
  })
);

app.use(
  koaBody({
    multipart: true,
  })
);

app.use(
  dynamicRoute({
    prefix: "/space",
  })
);

app.use(pageHelper());

app.use(async (ctx, next) => {
  let result = await next();

  if (result) {
    if (result instanceof Result) {
      result = result.toJSON();
    }

    ctx.body = result;
  } else {
    // result = new Result().setMessage("接口未实现").toJSON();
  }
});

// 所有的路由中间件
router.mount(app);

// 错误处理中间件
app.use(async (ctx, next) => {
  console.log("最后一个");
  ctx.response.status = 404;
});

let PORT = 8999;
const bootstrap = async () => {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功");
  } catch (err) {
    console.log("数据库连接失败，自动退出");
    console.log(err);
    process.exit();
  }

  app.listen(PORT, async () => {
    console.log(`服务${PORT}启动成功！`);
  });
};
bootstrap();
