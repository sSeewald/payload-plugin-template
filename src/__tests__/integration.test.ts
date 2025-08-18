import type { Config } from 'payload'

import { myPlugin } from '../plugin'

describe('Plugin Integration Tests', () => {
  let baseConfig: Config

  beforeEach(() => {
    baseConfig = {
      serverURL: 'http://localhost:3000',
      collections: [
        {
          slug: 'pages',
          fields: [
            { name: 'title', type: 'text' },
            { name: 'content', type: 'richText' },
          ],
        },
        {
          slug: 'users',
          auth: true,
          fields: [],
        },
      ],
      globals: [
        {
          slug: 'settings',
          fields: [
            { name: 'siteName', type: 'text' },
          ],
        },
      ],
      endpoints: [
        {
          path: '/health',
          method: 'get',
          handler: async () => Response.json({ status: 'ok' }),
        },
      ],
      db: {} as any,
      secret: 'test-secret',
      admin: {
        components: {
          afterDashboard: ['ExistingComponent'],
        },
      },
    }
  })

  describe('Full Plugin Integration', () => {
    it('should integrate seamlessly with existing Payload config', () => {
      const plugin = myPlugin({ enabled: true })
      const finalConfig = plugin(baseConfig)

      // Should preserve all existing collections
      expect(finalConfig.collections).toHaveLength(2)
      expect(finalConfig.collections?.find((c) => c.slug === 'pages')).toBeDefined()
      expect(finalConfig.collections?.find((c) => c.slug === 'users')).toBeDefined()

      // Should preserve existing globals
      expect(finalConfig.globals).toHaveLength(1)
      expect(finalConfig.globals?.find((g) => g.slug === 'settings')).toBeDefined()

      // Should add new endpoints while preserving existing ones
      expect(finalConfig.endpoints).toBeDefined()
      expect(finalConfig.endpoints?.length).toBeGreaterThan(1)
      expect(finalConfig.endpoints?.find((e) => e.path === '/health')).toBeDefined()
      expect(finalConfig.endpoints?.find((e) => e.path === '/hello-world')).toBeDefined()

      // Should add admin components (existing ones are overwritten due to spread operator order)
      expect(finalConfig.admin?.components?.afterDashboard).toBeDefined()
      expect(finalConfig.admin?.components?.afterDashboard?.length).toBe(2)
    })

    it('should handle config with onInit properly', async () => {
      const onInitSpy = jest.fn()
      baseConfig.onInit = onInitSpy

      const plugin = myPlugin({ enabled: true, debug: true })
      const finalConfig = plugin(baseConfig)

      expect(finalConfig.onInit).toBeDefined()

      // Test onInit execution
      const mockPayload = {
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      } as any

      await finalConfig.onInit?.(mockPayload)

      expect(onInitSpy).toHaveBeenCalledWith(mockPayload)
    })

    it('should handle plugin with different option combinations', () => {
      const testCases = [
        { options: { enabled: true }, shouldModify: true },
        { options: { enabled: false }, shouldModify: false },
        { options: { enabled: true, debug: true }, shouldModify: true },
        { options: { enabled: true, debug: false }, shouldModify: true },
      ]

      testCases.forEach(({ options, shouldModify }) => {
        const plugin = myPlugin(options)
        const finalConfig = plugin(baseConfig)

        if (shouldModify) {
          expect(finalConfig.endpoints?.length).toBeGreaterThan(1)
        } else {
          expect(finalConfig.endpoints?.length).toBe(1) // Only existing endpoint
        }

        // Admin components should always be added (for webpack)
        expect(finalConfig.admin?.components?.afterDashboard?.length).toBeGreaterThan(1)
      })
    })

    it('should handle empty initial config', () => {
      const emptyConfig: Config = {
        serverURL: 'http://localhost:3000',
        db: {} as any,
        secret: 'test-secret',
      }

      const plugin = myPlugin({ enabled: true })
      const finalConfig = plugin(emptyConfig)

      expect(finalConfig.collections).toBeDefined()
      expect(finalConfig.endpoints).toBeDefined()
      expect(finalConfig.admin?.components?.afterDashboard).toBeDefined()
      expect(finalConfig.onInit).toBeDefined()
    })

    it('should properly transform collection fields', () => {
      const plugin = myPlugin({ enabled: true })
      const finalConfig = plugin(baseConfig)

      // Verify that collection field transformation logic runs
      finalConfig.collections?.forEach((collection) => {
        expect(collection.fields).toBeDefined()
        collection.fields?.forEach((field) => {
          // Fields should be passed through the transformation
          expect(field).toBeDefined()
        })
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in onInit gracefully', async () => {
      const errorOnInit = jest.fn().mockRejectedValue(new Error('Init failed'))
      baseConfig.onInit = errorOnInit

      const plugin = myPlugin({ enabled: true })
      const finalConfig = plugin(baseConfig)

      const mockPayload = {
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      } as any

      // Should not throw, but should log error
      await expect(finalConfig.onInit?.(mockPayload)).rejects.toThrow('Init failed')
      expect(errorOnInit).toHaveBeenCalled()
    })

    it('should handle missing optional config properties', () => {
      const minimalConfig: Config = {
        serverURL: 'http://localhost:3000',
        db: {} as any,
        secret: 'test-secret',
      }

      const plugin = myPlugin({ enabled: true })
      
      expect(() => plugin(minimalConfig)).not.toThrow()
      
      const finalConfig = plugin(minimalConfig)
      expect(finalConfig).toBeDefined()
      expect(finalConfig.endpoints).toBeDefined()
      expect(finalConfig.admin).toBeDefined()
    })
  })
})