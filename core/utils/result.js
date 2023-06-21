const only = require("only");

function convertData(data) {
  if (typeof data != "object") {
    return data;
  }

  for (let key in data) {
    if (typeof data[key] == "bigint") {
      data[key] = data[key].toString();
    } else if (typeof data[key] == "object") {
      data[key] = convertData(data[key]);
    }
  }
  return data;
}

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
    // this.data = convertData(this.data);
    return only(this, ["code", "success", "data", "message"]);
  }
}

module.exports = Result;
