const KoaRouter = require("../middleware/koa@router");
const { addUser } = require("../controller/user");
const router = new KoaRouter("/user");

const Result = require("../utils/result");
router.post("/add", (ctx) => {
  ctx.body = "添加用户成功";
});

router.get("/info/:id", (ctx) => {
  console.log(ctx.params);
  ctx.body = {
    success: true,
    message: `获取用户id:${ctx.params.id}成功`,
    data: {
      id: 1,
    },
  };
});

router.get("/add", async (ctx) => {
  const { name } = ctx.request.query;
  const result = new Result();
  if (!name) {
    result.setMessage("用户名称不存在！");
  } else {
    // 把用户临时存到本地文件中

    addUser(name);

    result.setSuccess.setMessage("用户添加成功！");
  }

  return result;
});

module.exports = router.router();
