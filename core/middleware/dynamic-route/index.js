const RootRouter = require("../../router");
const apiService = require("../../service/api");
module.exports = function (opts) {
  let prefix = opts.prefix;
  return async function (ctx, next) {
    console.log(ctx.request);
    let { url, method } = ctx.request;

    if (!url.startsWith(prefix)) {
      return await next();
    }

    let tokens = url.split("/");
    let workspace = tokens[2];
    url = url.replace(`${prefix}/${workspace}`, "");

    let api;
    try {
      api = await apiService.findOneInWorksapce(workspace, method, url);
    } catch (err) {
      console.log(err);
      return await next();
    }

    if (!api) {
      return await next();
    }

    console.log(api);

    let route = {
      method,
      url: `/${workspace}${url}`,
      code: api.code,
    };
    // 添加路由
    RootRouter.addRoute(route);

    await next();

    // 执行完再删除该路由 防止内存一直增加
    RootRouter.removeRoute(route);
  };
};
