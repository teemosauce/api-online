const KoaRouter = require("@koa/router");
const WorkspaceController = require("../controller/workspace");

const router = new KoaRouter({
  prefix: "/workspace",
});

/**
 * 生成一个唯一的命名空间 并创建space目录
 */

// 该接口加个限制 单机一天只能调用一次
router.post("/create", WorkspaceController.create);

router.get("/", WorkspaceController.findAndCountAll);

module.exports = router.routes();
