import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { myPlugin } from 'payload-plugin-template'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './emailAdapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Detect if we're running in Docker (MongoDB) or locally (SQLite)
const databaseURI = process.env.DATABASE_URI || ''
const isMongoDb = databaseURI.startsWith('mongodb://')

// Choose the appropriate database adapter
const dbAdapter = isMongoDb
  ? mongooseAdapter({
      url: databaseURI,
    })
  : sqliteAdapter({
      client: {
        url: databaseURI || path.resolve(dirname, '../database.db'),
      },
    })

export default buildConfig({
  admin: {
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
    },
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    {
      slug: 'pages',
      admin: {
        useAsTitle: 'title',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'content',
          type: 'richText',
        },
      ],
    },
    {
      slug: 'media',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
      upload: true,
    },
  ],
  db: dbAdapter,
  editor: lexicalEditor(),
  email: testEmailAdapter,
  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
        },
      })
    }
  },
  plugins: [
    myPlugin({
      debug: true,
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'SOME_SECRET',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
