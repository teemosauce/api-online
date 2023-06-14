/**
 * 包装代码
 * @param {string} code 用户编写的代码
 * @returns 包装后的代码
 *
 * 示例:
 * 源码:
 *  ctx.body = "Hello World"
 * 包装后:
   'use strict';
   (async function(ctx) {
    try {
       ctx.body = "Hello World"
     } catch (err) {
       ctx.body = {
         $catch: 1, 
         message: err.stack,
        }
    }
  })(ctx)
 */

const CODE_TEMPLATE = `'use strict';
(async function(ctx) {
  try {
    <%=code%>
  } catch(err) {
    ctx[SYMBOL_ERROR] = err;
  }
})(ctx);
  `;

function wrapCode(code) {
  return CODE_TEMPLATE.replace("<%=code%>", code);
}

module.exports = {
  wrapCode,
};
