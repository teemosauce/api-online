const Result = require("../../utils/result");
const workspaceService = require("../../service/workspace");
module.exports = {
  async create(ctx) {
    const result = new Result();
    let workspace;
    try {
      workspace = await workspaceService.create();
      console.log(111111);
    } catch (error) {
      console.log(error);
      result.setMessage(error.message);
    }
    console.log(workspace);
    if (workspace) {
      result.setSuccess(true).setData(workspace);
      result.setMessage("生成工作空间成功！");
    }
    return result;
  },

  async query(ctx) {
    const result = new Result();
    let res;
    try {
      res = await workspaceService.findAndCountAll(ctx.queryHelper);
    } catch (error) {
      result.setMessage(error.message);
    }

    if (res) {
      result.setSuccess(true).setData(res);
      result.setMessage("查询成功");
    }

    return result;
  },
};
