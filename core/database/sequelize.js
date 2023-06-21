const config = require('../../databse.config')
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.user,
  password: config.password,
  dialect: config.type,

  // timezone: "Asia/Shanghai",
  timezone: "+8:00",
  define: {
    timestamps: true, // 每张表自动添加created_at和updated_at
    underscored: true, // 把所有的驼峰命名 转换成下划线名称
    freezeTableName: true, // 固定传入的表明 禁止自动加s
  },
  pool: {
    max: 10, // 最大连接数
    min: 0, // 最小连接数
    idle: 10000, // 10s自动释放未使用的连接
    acquire: 10000,
  },
});

module.exports = sequelize;
