const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const Result = require("../../utils/result");

module.exports = {
  async createWorkspace(ctx) {
    const { workspaceDir } = ctx.request;
    const workspaceName = nanoid().toLowerCase();
    const workspaceNameDir = path.resolve(workspaceDir, workspaceName);
    const result = new Result();
    if (!fs.existsSync(workspaceNameDir)) {
      fs.mkdirSync(workspaceNameDir);
      result.setSuccess(true).setMessage("生成工作空间成功！").setData({
        name: workspaceName
      });
    } else {
      result.setMessage("生成工作空间失败！");
    }
    return result.toJSON();
  },
};
