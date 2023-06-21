const KoaRouter = require("@koa/router");
const router = new KoaRouter({
  prefix: "/api",
});
const APIController = require("../controller/api");

router.get("/", APIController.findAndCountAll);

module.exports = router.routes();
