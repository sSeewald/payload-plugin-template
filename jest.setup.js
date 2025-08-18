// Suppress console outputs during tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}

// Mock Response object for Node.js environment
global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.headers = new Map(Object.entries(init?.headers || {}))
  }

  static json(data, init) {
    const body = JSON.stringify(data)
    return new Response(body, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {}),
      },
    })
  }

  async json() {
    return JSON.parse(this.body)
  }

  get headers() {
    return {
      get: (key) => {
        return this._headers?.get(key) || 'application/json'
      },
    }
  }

  set headers(value) {
    this._headers = value
  }
}

// Mock Payload module and its error classes
jest.mock('payload', () => {
  // Create mock error classes that match Payload's error structure
  class ValidationError extends Error {
    constructor(options) {
      super(options.errors?.[0]?.message || 'Validation error')
      this.name = 'ValidationError'
      this.errors = options.errors || []
      this.collection = options.collection
    }
  }

  class Forbidden extends Error {
    constructor(message) {
      super(message || 'Forbidden')
      this.name = 'Forbidden'
    }
  }

  return {
    ValidationError,
    Forbidden,
  }
})