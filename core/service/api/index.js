const ApiModel = require("../../models/api");
const WorkspaceModel = require("../../models/workspace");
const workspaceService = require("../workspace");
const sequelize = require("../../database/mariadb")

class ApiService {
  async create(workspaceName, api) {
    let workspace;
    try {
      workspace = await workspaceService.findOne({
        where: {
          name: workspaceName,
        },
      });
    } catch (error) {
      throw error;
    }

    if (!workspace) {
      throw new Error("工作空间不存在");
    }
    api.workspaceId = workspace.id;

    return ApiModel.create(api);
  }

  update(id, api) {
    return ApiModel.update(api, {
      where: {
        id: id,
      },
    });
  }
  findById(id) {
    return ApiModel.findByPk(id);
  }

  findAndCountAll(pageHelper) {
    return ApiModel.findAndCountAll({
      ...pageHelper,
    });
  }

  findAndCountAllByWorkspace(workspaceName, pageHelper) {
    let where = pageHelper && pageHelper.where;
    if (where) {
      // where.
    }
    return ApiModel.findAndCountAll({
      // ...pageHelper,
      include: {
        model: WorkspaceModel,
        where: {
          name: workspaceName,
        },
      },
    });
  }

  remove(id) {
    return ApiModel.update(
      {
        isDelete: 1,
      },
      {
        where: {
          id: id,
        },
      }
    );
  }

  removeByWorksapce(workspace, id) {}
}

module.exports = new ApiService();
