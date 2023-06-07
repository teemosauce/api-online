const KoaRouter = require("../middleware/koa@router");
const WorkspaceController = require("../controller/workspace");

const router = new KoaRouter("/workspace");

/**
 * 生成一个唯一的命名空间 并创建space目录
 */
router.get("/generate", WorkspaceController.createWorkspace);

module.exports = router.router();
