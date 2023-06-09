const KoaRouter = require("../middleware/koa@router");
const WorkspaceController = require("../controller/workspace");

const router = new KoaRouter("/workspace");

/**
 * 生成一个唯一的命名空间 并创建space目录
 */

// 该接口加个限制 单机一天只能调用一次
router.post("/create", WorkspaceController.createWorkspace); 

module.exports = router.router();
