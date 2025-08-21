import { test, expect } from '@playwright/test'

test.describe('GraphQL API', () => {
  test('GraphQL endpoint should be accessible', async ({ request }) => {
    const response = await request.post('/api/graphql', {
      data: {
        query: '{ __typename }'
      },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('__typename', 'Query')
  })

  test('should query Pages collection', async ({ request }) => {
    const response = await request.post('/api/graphql', {
      data: {
        query: `
          query GetPages {
            Pages {
              docs {
                id
                title
                createdAt
                updatedAt
              }
              totalDocs
              limit
              page
              totalPages
              hasNextPage
              hasPrevPage
            }
          }
        `
      },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('Pages')
    expect(data.data.Pages).toHaveProperty('docs')
    expect(data.data.Pages).toHaveProperty('totalDocs')
    expect(Array.isArray(data.data.Pages.docs)).toBeTruthy()
  })

  test('should query Users collection', async ({ request }) => {
    const response = await request.post('/api/graphql', {
      data: {
        query: `
          query GetUsers {
            Users {
              docs {
                id
                email
                createdAt
                updatedAt
              }
              totalDocs
            }
          }
        `
      },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('Users')
    expect(data.data.Users.totalDocs).toBeGreaterThan(0) // At least the auto-login user
  })

  test('should handle GraphQL errors gracefully', async ({ request }) => {
    const response = await request.post('/api/graphql', {
      data: {
        query: `
          query InvalidQuery {
            NonExistentField
          }
        `
      },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    // GraphQL returns 200 even for query errors
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('errors')
    expect(Array.isArray(data.errors)).toBeTruthy()
    expect(data.errors.length).toBeGreaterThan(0)
  })
})