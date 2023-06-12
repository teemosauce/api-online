const path = require("path");

/**
 * 获取Workspace工作目录
 * @returns
 */
function getWorkspace() {
  return path.resolve(__dirname, "../router/workspace");
}

/**
 * 获取指定名称的目录
 * @param {string} name 指定工作空间
 * @returns
 */
function getWorkspaceByName(name) {
  return path.resolve(getWorkspace(), name);
}

/**
 * 获取指定名称目录下的package.json
 * @param {string} name 指定工作空间
 * @returns
 */
function getWorkspacePackageJSON(name) {
  return path.resolve(getWorkspaceByName(name), "package.json");
}
module.exports = {
  getWorkspace,
  getWorkspaceByName,
  getWorkspacePackageJSON,
};
