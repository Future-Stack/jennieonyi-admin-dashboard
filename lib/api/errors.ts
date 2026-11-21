export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BackendProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendProtocolError";
  }
}
