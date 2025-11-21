class APIResponse {
  constructor(code, data, status = 200) {
    this.code = code;
    this.data = data;
    this.status = status;
    this.success = true;
  }
}

export default APIResponse;
