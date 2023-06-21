const Result = require("../../utils/result");
const RouterManager = require("../../router/index");
const apiService = require("../../service/api");

module.exports = {
  async createInWorkspace(ctx) {
    const { workspace } = ctx.params;
    const { method, url, code } = ctx.request.body;
    const result = new Result();

    let api;
    try {
      api = await apiService.createInWorkspace(workspace, {
        method,
        url,
        code,
      });
    } catch (err) {
      return result.setMessage(err.message);
    }
    RouterManager.addRoute(workspace, {
      method,
      url,
      code,
    }); // 创建完之后直接加入到根路由中间件中
    result.setSuccess(true).setData(api);
    result.setMessage("添加成功");
    return result;
  },

  async updateInWorkspace(ctx) {
    let { workspace, id } = ctx.params;
    const { method, url, code } = ctx.request.body;
    const result = new Result();

    let api;

    try {
      api = await apiService.updateInWorkspace(workspace, {
        id,
        method,
        url,
        code,
      });
    } catch (err) {
      return result.setMessage(err.message);
    }

    RouterManager.addRoute(workspace, {
      method,
      url,
      code,
    }); // 创建完之后直接加入到根路由中间件中
    result.setSuccess(true).setData(api);
    result.setMessage("编辑成功");

    return result;
  },

  async findByIdInWorkspace(ctx) {
    const { id } = ctx.params;
    const result = new Result();
    let api;
    try {
      api = await apiService.findById(id);
    } catch (err) {
      return result.setMessage(err.message);
    }

    result.setSuccess(true).setData(api);
    return result.setMessage("查询成功");
  },

  async findAndCountAll(ctx) {
    const result = new Result();
    let res;
    try {
      res = await apiService.findAndCountAll(ctx.queryHelper);
    } catch (err) {
      return result.setMessage(err.message);
    }

    result.setSuccess(true).setData(res);

    return result.setMessage("查询成功");
  },

  async findAndCountAllByWorkspace(ctx) {
    const { workspace } = ctx.params;
    const result = new Result();
    let res;
    try {
      res = await apiService.findAndCountAllByWorkspace(
        workspace,
        ctx.queryHelper
      );
    } catch (err) {
      return result.setMessage(err.message);
    }

    result.setSuccess(true).setData(res);

    return result.setMessage("查询成功");
  },

  async remove(ctx) {
    const { id } = ctx.params;

    const result = new Result();
    try {
      await apiService.remove(id);
    } catch (err) {
      return result.setMessage(err.message);
    }

    result.setSuccess(true);
    return result.setMessage("删除成功");
  },

  async removeInWorkspace(ctx) {
    const { workspace } = ctx.params;
    const result = new Result();
    let res;

    try {
      await apiService.removeInWorkspace(workspace, id);
    } catch (err) {
      return result.setMessage(err.message);
    }
    result.setSuccess(true);
    return result.setMessage("删除成功");
  }
};
