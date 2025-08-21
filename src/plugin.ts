import type { Config } from 'payload'

import type { MyPluginOptions } from './types'

import { helloWorldHandler } from './endpoints'

export const myPlugin =
  (pluginOptions: MyPluginOptions) =>
  (incomingConfig: Config): Config => {
    const config = { ...incomingConfig }

    config.admin = {
      ...(config.admin || {}),

      // Add additional admin config here

      components: {
        ...(config.admin?.components || {}),
        // Add additional admin components here
        afterDashboard: [
          '@components#AfterDashboard',
          '@components#AfterDashboardClient',
        ],
      },
    }

    /**
     * If the plugin is disabled, return the config without modifying it
     *
     * Be cautious when using this if your plugin adds new collections or fields
     * as this could cause issues w/ Postgres migrations
     */
    if (pluginOptions.enabled === false) {
      return config
    }

    config.collections = (config.collections || []).map((collection) => {
      const modifiedCollection = { ...collection }

      // Make changes to the collection here

      modifiedCollection.fields = (modifiedCollection.fields || []).map((field) => {
        const newField = { ...field }

        // Make changes to the fields here

        return newField
      })

      return modifiedCollection
    })

    // Add additional collections here

    config.endpoints = [
      ...(config.endpoints || []),
      {
        handler: helloWorldHandler,
        method: 'get',
        path: '/hello-world',
      },
      // Add additional endpoints here
    ]

    config.globals = [
      ...(config.globals || []),
      // Add additional globals here
    ]

    config.hooks = {
      ...(config.hooks || {}),
      // Add additional hooks here
    }

    config.onInit = async (payload) => {
      if (incomingConfig.onInit) {
        await incomingConfig.onInit(payload)
      }
    }

    return config
  }
