const { Sequelize, Model, DataTypes } = require("sequelize");

class Api extends Model {
  id;
  method;
  url;
  code;
  workspace;
}

(async () => {
  const sequelize = new Sequelize({
    host: "192.168.1.10",
    port: 3306,
    database: "api-online",
    username: "mysqlAdmin",
    password: "123456",
    dialect: "mariadb",
    timezone: "Asia/Shanghai",
  });

  try {
    await sequelize.authenticate();
    console.log("连接成功");
  } catch (error) {
    console.log(error);
  }

  Api.init(
    {
      id: {
        type: DataTypes.INTEGER,
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
      },
      url: {
        type: DataTypes.STRING(50),
        unique: "compositeIndex",
        comment: "请求地址",
      },
      code: {
        type: DataTypes.TEXT,
        comment: "处理方法",
      },
      workspace: {
        type: DataTypes.STRING(64),
        unique: "compositeIndex",
        allowNull: false,
        comment: "所属空间",
      },
    },
    {
      sequelize: sequelize,
      timestamps: true,
      modelName: "api",
      freezeTableName: true,
    }
  );

  try {
    await sequelize.sync({ force: false });
    await Api.create({
      method: "GET",
      url: "/test",
      code: 'ctx.body="Hello World!"',
      workspace: "flltndur6_zftae0ucjwt",
    });
  } catch (error) {
    console.log(error);
  }

  // let apis = await Api.update({
  //   code: 'ctx.body=123'
  // }, {
  //   where: {
  //     id: 1
  //   }
  // })
  // console.log(apis)
  sequelize.close();
})();
