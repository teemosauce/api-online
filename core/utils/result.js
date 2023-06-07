const only = require("only");

class Result {
  success = false;
  data = null;
  message = null;
  code = null;
  constructor() {}

  setSuccess(success) {
    this.success = success;
    return this;
  }

  setData(data) {
    this.data = data;
    return this;
  }

  setMessage(message) {
    this.message = message;
    return this;
  }

  setCode(code) {
    this.code = code;
    return this;
  }

  toJSON() {
    return only(this, ["code", "success", "data", "message"]);
  }
}

module.exports = Result;
