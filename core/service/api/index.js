// const sequelize = require("../../database/sequelize");
const ApiModel = require("../../models/api");
const WorkspaceModel = require("../../models/workspace");
const workspaceService = require("../workspace/index");
const { Op } = require("sequelize");
const sequelize = require("../../database/sequelize");
const IncludeUpdateSets = new Set(["method", "url", "code", "isDelete"]);

class ApiService {
  /**
   * 创建指定空间下的api
   * @param {*} workspaceName 指定空间
   * @param {*} api
   * @returns
   */
  async createInWorkspace(workspaceName, api) {
    let workspace;
    try {
      workspace = await workspaceService.findOne({
        where: {
          name: {
            [Op.eq]: workspaceName,
          },
        },
      });
    } catch (err) {
      throw err;
    }

    if (!workspace) {
      throw new Error("工作空间不存在");
    }

    return ApiModel.create({
      workspaceId: workspace.id,
      ...api,
    });
  }
  /**
   * 更新指定空间下的api
   * @param {*} workspaceName
   * @param {*} newApi
   * @returns
   */
  async updateInWorkspace(workspaceName, newApi) {
    let id = newApi.id;
    let sets = [];
    for (let key in newApi) {
      if (IncludeUpdateSets.has(key)) {
        sets.push(`api.${key} = ${JSON.stringify(newApi[key])}`);
      }
    }
    try {
      await sequelize.query(`UPDATE api
    INNER JOIN workspace ON api.workspace_id = workspace.id 
    SET api.id = ${id} ${sets.length > 0 ? "," + sets.join(",") : ""}
    WHERE
      api.id = ${id} 
      AND workspace.name = '${workspaceName}'`);
    } catch (err) {
      if (err.code !== "ER_DUP_ENTRY") {
        throw err;
      }
    }
    return this.findById(id);
  }
  /**
   * 根据id查询
   * @param {*} id
   * @returns
   */
  findById(id) {
    return ApiModel.findByPk(id);
  }
  /**
   * 查询指定空间下的指定api
   * @param {*} workspaceName
   * @param {*} id
   * @returns
   */
  findByIdInWorkspace(workspaceName, id) {
    let $where = {};
    if (workspaceName) {
      $where.name = {
        [Op.eq]: workspaceName,
      };
    }

    return ApiModel.findOne({
      where: {
        id: {
          [Op.eq]: id,
        },
      },
      include: {
        model: WorkspaceModel,
        where: $where,
        attributes: ["name"],
      },
      attributes: {
        exclude: ["isDelete", "workspaceId"],
      },
    });
  }

  /**
   * 查询全部
   * @param {*} pageHelper
   * @returns
   */
  findAndCountAll(pageHelper) {
    return this.findAndCountAllByWorkspace(null, pageHelper);
  }

  /**
   * 查询指定空间下的全部
   * @param {*} workspaceName
   * @param {*} pageHelper
   * @returns
   */
  findAndCountAllByWorkspace(workspaceName, pageHelper) {
    let $where = {};
    if (workspaceName) {
      $where.name = {
        [Op.eq]: workspaceName,
      };
    }

    return ApiModel.findAndCountAll({
      ...pageHelper,
      include: {
        model: WorkspaceModel,
        attributes: ["name"],
        where: $where,
      },
      attributes: {
        exclude: ["isDelete", "workspaceId"],
      },
    });
  }

  findOneInWorksapce(workspaceName, method, url) {
    return ApiModel.findOne({
      where: {
        [Op.and]: {
          method: {
            [Op.eq]: method,
          },
          url: {
            [Op.eq]: url,
          },
        },
      },
      include: {
        model: WorkspaceModel,
        where: {
          name: {
            [Op.eq]: workspaceName,
          },
        },
      },
    });
  }

  /**
   * 删除指定空间下的api
   * @param {*} workspace
   * @param {*} id
   * @returns
   */
  removeInWorkspace(workspaceName, id) {
    return this.updateInWorkspace(workspaceName, {
      id,
      isDelete: 1,
    });
  }
  /**
   * 删除
   * @param {*} id
   * @returns
   */
  remove(id) {
    return ApiModel.update(
      {
        isDelete: 1,
      },
      {
        where: {
          id: {
            [Op.eq]: id,
          },
        },
      }
    );
  }
}

module.exports = new ApiService();
