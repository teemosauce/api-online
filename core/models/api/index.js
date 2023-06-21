const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../database/sequelize");
const WorkspaceModel = require("../workspace");

class ApiModel extends Model {}

ApiModel.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "ID",
    },
    method: {
      type: DataTypes.STRING(20),
      unique: "compositeIndex",
      comment: "请求方式",
      allowNull: false,
      defaultValue: "GET",
    },
    url: {
      type: DataTypes.STRING(200),
      unique: "compositeIndex",
      comment: "请求地址",
      allowNull: false,
      defaultValue: "/",
    },
    code: {
      type: DataTypes.TEXT,
      comment: "处理方法",
    },

    isDelete: {
      type: DataTypes.TINYINT.UNSIGNED,
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    modelName: "api",
    sequelize,
  }
);

// 模型建立关联
WorkspaceModel.hasMany(ApiModel, {
  foreignKey: {
    name: "workspaceId",
    type: DataTypes.BIGINT.UNSIGNED,
    unique: "compositeIndex",
    allowNull: false,
    comment: "所属空间ID",
  },
});
ApiModel.belongsTo(WorkspaceModel);

(async () => {
  try {
    await ApiModel.sync();
  } catch (err) {
    console.log(err);
  }
})();

module.exports = ApiModel;
