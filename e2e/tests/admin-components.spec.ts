import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
    await page.waitForSelector('[class*="dashboard"]', { timeout: 10000 })
  })

  test('Server component should display features', async ({ page }) => {
    // Find server component
    const serverComponent = page.locator('text=Server Component Example').locator('..')

    // Check SSR badge
    await expect(serverComponent.locator('text=SSR')).toBeVisible()
  })

  test('Client component counter should work', async ({ page }) => {
    // Find the counter button
    const counterButton = page.locator('button:has-text("Clicked 0 times")')

    await counterButton.click()
    await expect(page.locator('button:has-text("Clicked 1 times")')).toBeVisible()
  })

  test('Config toggle should show/hide configuration', async ({ page }) => {
    // Initially config should not be visible
    await expect(page.locator('text=Server URL')).not.toBeVisible()

    // Click Show Config button
    await page.locator('button:has-text("Show Config")').click()

    // Config should now be visible
    await expect(page.locator('text=Server URL')).toBeVisible()
    await expect(page.locator('text=Admin Path')).toBeVisible()
    await expect(page.locator('text=API Path')).toBeVisible()

    // Button should now say Hide
    await expect(page.locator('button:has-text("Hide Config")')).toBeVisible()

    // Click again to hide
    await page.locator('button:has-text("Hide Config")').click()
    await expect(page.locator('text=Server URL')).not.toBeVisible()
  })

  test('User info fetch should work', async ({ page }) => {
    // Click the fetch user info button
    const userButton = page.locator('button:has-text("User Info")')
    await userButton.click()
    
    // Wait for the client component's user info to load
    // Target the client component section specifically
    const clientSection = page.locator('text=Client Component Example').locator('..').locator('..')
    
    // Wait for user info in the client section
    await clientSection.locator('text=Current User').waitFor({ timeout: 5000 })
    
    // Check elements within the client component section
    await expect(clientSection.locator('text=Current User')).toBeVisible()
    await expect(clientSection.locator('text=dev@payloadcms.com')).toBeVisible()
    
    // Note about fetching method (this is unique to client component)
    await expect(page.locator('text=Fetched client-side via REST API')).toBeVisible()
  })

  test('GraphQL Pages fetch should work', async ({ page }) => {
    // Click the fetch pages button
    const pagesButton = page.locator('button:has-text("Pages (GraphQL)")')
    await pagesButton.click()

    // Wait for response
    await page.waitForSelector('text=GraphQL Query Result', { timeout: 5000 })

    // Should show pages collection info
    await expect(page.locator('text=Pages Collection')).toBeVisible()

    // Should show total count (0 initially)
    await expect(page.locator('text=/\\d+ total/')).toBeVisible()

    // Note about GraphQL
    await expect(page.locator('text=Fetched via GraphQL API')).toBeVisible()
  })
})
