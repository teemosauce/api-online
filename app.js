const Koa = require("koa");
const router = require("./core/router/index");
const { koaBody } = require("koa-body");
const Result = require("./core/utils/result");
const app = new Koa();
const static = require('koa-static')
const conditional = require('koa-conditional-get') // 走协商缓存时 判断文件是否新鲜 是否有变化
const etag = require('koa-etag') // 生成文件的唯一tag标识
const responseTime = require('koa-response-time')



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

app.use(responseTime())

app.use(conditional())
app.use(etag())
app.use(static('public', {
  maxAge: 20 * 1000 // 缓存时间 10秒钟 主要用于测试
}))

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
app.listen(PORT, () => {
  console.log(`测试服务${PORT}启动成功！`);
});
