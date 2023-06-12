const path = require("path");
const fse = require("fs-extra");

module.exports = {
  getWorkspace,
  getWorkspaceByName,
  getWorkspacePackageJSON,

  validateWorkspace,
  validatePackageJson,

  readPackageJSON,
  writePackageJSON,
};

/**
 * 获取空间的完整路径
 * @returns
 */
function getWorkspace() {
  return path.resolve(__dirname, "../router/workspace");
}

/**
 * 获取指定空间的完整路径
 * @param {string} name 指定工作空间
 * @returns
 */
function getWorkspaceByName(name) {
  return path.resolve(getWorkspace(), name);
}

/**
 * 获取指定空间的package.json完整路径
 * @param {string} name 指定工作空间
 * @returns
 */
function getWorkspacePackageJSON(name) {
  return path.resolve(getWorkspaceByName(name), "package.json");
}

/**
 * 验证指定空间是否存在
 * @param {String} name 指定工作空间
 * @returns
 */
function validateWorkspace(name) {
  const workspace = getWorkspaceByName(name);
  return fse.existsSync(workspace);
}

/**
 * 验证指定空间下package.json是否存在
 * @param {String} name 指定工作空间
 * @returns
 */
function validatePackageJson(name) {
  const packageJSON = getWorkspacePackageJSON(name);
  return fse.existsSync(packageJSON);
}

/**
 * 读取指定空间下的package.json内容
 * @param {String} name 指定工作空间
 * @returns
 */
async function readPackageJSON(name) {
  const packageJSON = getWorkspacePackageJSON(name);

  const content = await fse.readJSON(packageJSON, {
    encoding: "utf-8",
  });
  return content;
}

/**
 * 往指定空间下的package.json写入内容
 * @param {String} name 指定工作空间
 * @param {Object} content 写入的JSON格式的内容
 * @returns
 */
async function writePackageJSON(name, content) {
  const packageJSON = getWorkspacePackageJSON(name);
  return await fse.writeJson(packageJSON, content, {
    encoding: "utf-8",
  });
}
