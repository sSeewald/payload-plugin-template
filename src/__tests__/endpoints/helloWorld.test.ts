import { helloWorldHandler } from '../../endpoints'

describe('Hello World Endpoint', () => {
  let mockRequest: any

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      headers: new Headers({
        'user-agent': 'Jest Test Agent',
      }),
      url: 'http://localhost:3000/api/hello-world',
    }
  })

  describe('helloWorldHandler', () => {
    it('should return a JSON response with correct structure', async () => {
      const response = await helloWorldHandler(mockRequest)

      expect(response).toBeInstanceOf(Response)
      expect(response.headers.get('content-type')).toContain('application/json')

      const data = await response.json()
      expect(data).toHaveProperty('message', 'Hello World!')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('method', 'GET')
      expect(data).toHaveProperty('headers')
    })

    it('should include user-agent in response headers', async () => {
      const response = await helloWorldHandler(mockRequest)
      const data = await response.json()

      expect(data.headers).toHaveProperty('user-agent', 'Jest Test Agent')
    })

    it('should return valid ISO timestamp', async () => {
      const response = await helloWorldHandler(mockRequest)
      const data = await response.json()

      const timestamp = new Date(data.timestamp)
      expect(timestamp).toBeInstanceOf(Date)
      expect(timestamp.toISOString()).toBe(data.timestamp)
    })

    it('should handle requests without user-agent', async () => {
      mockRequest.headers = new Headers({})

      const response = await helloWorldHandler(mockRequest)
      const data = await response.json()

      expect(response).toBeInstanceOf(Response)
      expect(data.headers['user-agent']).toBeNull()
    })

    it('should handle different HTTP methods', async () => {
      const methods = ['POST', 'PUT', 'DELETE', 'PATCH']

      for (const method of methods) {
        mockRequest.method = method
        const response = await helloWorldHandler(mockRequest)
        const data = await response.json()

        expect(data.method).toBe(method)
      }
    })
  })
})
