import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('hello-world endpoint should return correct response', async ({ request }) => {
    const response = await request.get('/api/hello-world')

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json()

    // Check response structure
    expect(data).toHaveProperty('message', 'Hello World!')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('method', 'GET')
    expect(data).toHaveProperty('headers')

    // Timestamp should be valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp)
  })
})
