import { test, expect } from '@playwright/test'

test.describe('Plugin Installation', () => {
  test('should load the admin dashboard', async ({ page }) => {
    await page.goto('/admin')

    // Should auto-login with dev credentials
    await page.waitForURL('**/admin', { timeout: 10000 })

    // Dashboard should be visible
    await expect(page.locator('h2')).toContainText('Collections')
  })

  test('should display plugin components on dashboard', async ({ page }) => {
    await page.goto('/admin')

    // Wait for dashboard to load
    await page.waitForSelector('[class*="dashboard"]', { timeout: 10000 })

    // Check if our AfterDashboard components are rendered
    const serverComponent = page.locator('text=Server Component Example')
    const clientComponent = page.locator('text=Client Component Example')

    await expect(serverComponent).toBeVisible()
    await expect(clientComponent).toBeVisible()
  })

  test('should have custom API endpoint available', async ({ page }) => {
    const response = await page.request.get('/api/hello-world')

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('message', 'Hello World!')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('method', 'GET')
  })
})
