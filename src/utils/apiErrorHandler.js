class APIError extends Error {
  constructor(code, message, status = 500, error = "") {
    // We pass message only to paraent class because parent class Error know only how to handle message.
    // Likewise we always do when we throw error new Error("any error message").
    super(message);
    this.code = code;
    this.success = false;
    this.status = status;
    this.msg = message;
    this.error = error;
  }
}

export default APIError;
