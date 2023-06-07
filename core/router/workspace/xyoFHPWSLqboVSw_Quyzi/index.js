const KoaRouter = require("../../../middleware/koa@router");
const router = new KoaRouter("/xyoFHPWSLqboVSw_Quyzi");
router.get("/test", async function (ctx) {
    console.log("######################")
  return "HelloWorld!";
});
module.exports = router.router();
