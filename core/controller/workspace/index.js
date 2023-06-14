const fse = require("fs-extra");
const path = require("path");
const { nanoid } = require("nanoid");
const Result = require("../../utils/result");
const {
  getWorkspace,
  validateWorkspace,
  getWorkspaceByName,
  writePackageJSON,
} = require("../../utils/workspace");

module.exports = {
  async createWorkspace(ctx) {
    const workspaceHome = getWorkspace();
    const workspaceName = nanoid().toLowerCase();
    const workspaceNameDir = getWorkspaceByName(workspaceName);
    const result = new Result();

    // 生成空间
    await fse.mkdir(workspaceNameDir);

    // 生成空间内的package.json
    await writePackageJSON(workspaceName, {
      workspace: workspaceName,
      routes: [],
    });

    result.setSuccess(true).setData({
      name: workspaceName,
    });

    return result.setMessage("生成工作空间成功！");
  },
};
