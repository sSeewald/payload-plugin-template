import type { Config } from 'payload'

import { myPlugin } from '../plugin'

describe('Plugin Core Tests', () => {
  let mockConfig: Config

  beforeEach(() => {
    mockConfig = {
      serverURL: 'http://localhost:3000',
      collections: [],
      db: {} as any,
      secret: 'test-secret',
    }
  })

  describe('myPlugin', () => {
    it('should return a function when initialized with options', () => {
      const plugin = myPlugin({ enabled: true })
      expect(typeof plugin).toBe('function')
    })

    it('should add endpoints to the config', () => {
      const plugin = myPlugin({ enabled: true })
      const modifiedConfig = plugin(mockConfig)

      expect(modifiedConfig.endpoints).toBeDefined()
      expect(Array.isArray(modifiedConfig.endpoints)).toBe(true)
      expect(modifiedConfig.endpoints?.length).toBeGreaterThan(0)

      const helloWorldEndpoint = modifiedConfig.endpoints?.find(
        (ep) => ep.path === '/hello-world'
      )
      expect(helloWorldEndpoint).toBeDefined()
      expect(helloWorldEndpoint?.method).toBe('get')
    })

    it('should add admin components to the config', () => {
      const plugin = myPlugin({ enabled: true })
      const modifiedConfig = plugin(mockConfig)

      expect(modifiedConfig.admin?.components?.afterDashboard).toBeDefined()
      expect(Array.isArray(modifiedConfig.admin?.components?.afterDashboard)).toBe(true)
      expect(modifiedConfig.admin?.components?.afterDashboard?.length).toBe(2)
    })

    it('should preserve existing config when adding new features', () => {
      const existingEndpoint = {
        path: '/existing',
        method: 'post' as const,
        handler: async () => Response.json({ test: true }),
      }

      mockConfig.endpoints = [existingEndpoint]

      const plugin = myPlugin({ enabled: true })
      const modifiedConfig = plugin(mockConfig)

      expect(modifiedConfig.endpoints).toContainEqual(existingEndpoint)
      expect(modifiedConfig.endpoints?.length).toBeGreaterThan(1)
    })

    it('should not modify config when plugin is disabled', () => {
      const plugin = myPlugin({ enabled: false })
      const modifiedConfig = plugin(mockConfig)

      // Admin components should still be added (for webpack)
      expect(modifiedConfig.admin?.components?.afterDashboard).toBeDefined()

      // But no endpoints should be added
      expect(modifiedConfig.endpoints).toBeUndefined()
    })

    it('should handle onInit extension', () => {

      mockConfig.onInit = jest.fn()

      const plugin = myPlugin({ enabled: true })
      const modifiedConfig = plugin(mockConfig)

      expect(modifiedConfig.onInit).toBeDefined()
      expect(typeof modifiedConfig.onInit).toBe('function')
    })

    it('should preserve existing collections and add modifications', () => {
      mockConfig.collections = [
        {
          slug: 'test-collection',
          fields: [
            { name: 'title', type: 'text' },
          ],
        },
      ]

      const plugin = myPlugin({ enabled: true })
      const modifiedConfig = plugin(mockConfig)

      expect(modifiedConfig.collections).toBeDefined()
      expect(modifiedConfig.collections?.length).toBe(1)
      expect(modifiedConfig.collections?.[0].slug).toBe('test-collection')
    })
  })
})
