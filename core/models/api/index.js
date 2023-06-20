const { Model, DataTypes } = require("sequelize");
const Workspace = require("../workspace");
const sequelize = require("../../database/mariadb");

class Api extends Model {}

Api.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      comment: "ID",
    },
    workspaceId: {
      type: DataTypes.BIGINT.UNSIGNED,
      unique: "compositeIndex",
      allowNull: false,
      comment: "所属空间ID",
      references: {
        model: Workspace,
        key: "id",
      },
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
    timestamps: true,
    freezeTableName: true,
    underscored: true // 把所有的驼峰命名 转换成下划线名称 
  }
);

module.exports = Api;
