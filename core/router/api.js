const KoaRouter = require("@koa/router");
const router = new KoaRouter({
  prefix: "/:workspace/apis",
});
const APIController = require("../controller/api");

router.post("/create", APIController.create);

router.put("/:id", APIController.update);

router.get("/list", APIController.list);

router.get("/:id/info", APIController.getById);

router.delete("/:id", APIController.remove);

module.exports = router.routes();
