const KoaRouter = require("../middleware/Router");
const router = new KoaRouter({
  prefix: "/file",
});

router.get("/", (ctx) => {
  ctx.body = "文件测试接口";
});

module.exports = router.routes();
