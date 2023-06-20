const KoaRouter = require("@koa/router");
const Result = require("../utils/result");

const router = new KoaRouter({
  prefix: "/hello",
});

/**
 * 生成一个唯一的命名空间 并创建space目录
 */

// 该接口加个限制 单机一天只能调用一次
router.get("/", async (ctx, next) => {
  let result = new Result();
  result.setSuccess(true);
  result.setData(ctx.pageInfo);
  return result.setMessage("Hello World!");
});

module.exports = router.routes();
