const { Op } = require("sequelize");

function makesureInt(num) {
  return isNaN(num) ? 0 : parseInt(num);
}

function normalize(opts = { pageSize: 10, pageNum: 1 }) {
  let pageSize = makesureInt(opts.pageSize);
  let pageNum = makesureInt(opts.pageNum);

  pageNum = pageNum < 1 ? 1 : pageNum;
  pageSize = pageSize > 0 ? pageSize : 10;

  return {
    pageNum,
    pageSize,
  };
}

// 分页相关字段
const PAGE_FILEDS = ["pageNum", "pageSize"];

module.exports = function (opts) {
  return async function (ctx, next) {
    if (ctx.method == "GET") {
      let { pageNum, pageSize } = normalize(ctx.query);

      // 构造分页信息对象
      let queryHelper = {
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
        order: [["updatedAt", "DESC"]],
      };

      // 构造搜索信息
      let where = {
        [Op.and]: [],
      };
      for (let key in ctx.query) {
        if (!PAGE_FILEDS.includes(key)) {
          where[Op.and].push({
            [key]: ctx.query[key],
          });
        }
      }
      queryHelper.where = where;
      ctx.queryHelper = queryHelper;
    }

    return await next();
  };
};
