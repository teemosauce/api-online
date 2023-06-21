const KoaRouter = require("@koa/router");
const router = new KoaRouter({
  prefix: "/:workspace/api",
});
const APIController = require("../controller/api");

router.post("/create", APIController.createInWorkspace);

router.put("/:id", APIController.updateInWorkspace);

router.get("/", APIController.findAndCountAllByWorkspace);

router.get("/:id", APIController.findByIdInWorkspace);

router.delete("/:id", APIController.removeInWorkspace);

module.exports = router.routes();
