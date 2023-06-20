const mariadb = require("mariadb");
let pool = mariadb.createPool({
  host: "192.168.1.10",
  port: 3306,
  database: "api-online",
  user: "mysqlAdmin",
  password: "123456",
  timezone: "+8:00", // 东八区
  connectionLimit: 10, // 连接池冲连接的最大个数
  idleTimeout: 10000, // 如果一个线程 10 秒钟内没有被使用过的话，那么就释放线程
  acquireTimeout: 30000
});
module.exports = pool;
