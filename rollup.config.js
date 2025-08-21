import swc from '@rollup/plugin-swc'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import preserveDirectives from 'rollup-plugin-preserve-directives'
import { glob } from 'glob'
import path from 'path'
import fs from 'fs'
import pkg from './package.json' with { type: 'json' }
import aliasExportsPlugin from './scripts/rollup-plugin-alias-exports.js'
import * as sass from 'sass'

const packageName = pkg.name

// Shared external packages
const externalPackages = [
  /^(react|react-dom)/,
  /^(payload|@payloadcms\/)/,
  /^(next|next\/)/,
  /^node:/,
]

// External dependencies including static assets
const external = [
  ...externalPackages,
  // Static assets
  /\.(png|jpg|jpeg|gif|webp|svg|ico)$/,
  /\.(woff|woff2|ttf|eot|otf)$/,
  /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
]

// Automatically discover all TypeScript files in src
const discoverEntries = () => {
  const entries = {}

  const files = glob.sync('src/**/*.{ts,tsx}', {
    ignore: [
      'src/**/__tests__/**',
      'src/**/*.test.{ts,tsx}',
      'src/**/*.spec.{ts,tsx}',
      'src/**/mocks/**',
      'src/**/*.d.ts',
      'src/types.ts', // Pure type definitions don't need JS output
    ],
  })

  files.forEach(file => {
    // Double-check file exists (important for watch mode)
    if (!fs.existsSync(file)) {
      console.warn(`⚠️  Skipping non-existent file: ${file}`)
      return
    }

    // Convert src/path/to/file.ts to path/to/file
    const outputPath = file.replace('src/', '').replace(/\.(ts|tsx)$/, '')

    entries[outputPath] = file
  })

  return entries
}

// Plugin to copy non-CSS assets to dist
const copyAssets = () => {
  let copied = false

  return {
    name: 'copy-assets',
    buildEnd() {
      if (copied) return
      copied = true

      const assetFiles = glob.sync('src/**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,eot,otf}')

      assetFiles.forEach(file => {
        const outputPath = file.replace('src/', '')
        const outputFile = path.join('dist', outputPath)
        const outputDir = path.dirname(outputFile)

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }

        fs.copyFileSync(file, outputFile)
      })
    },
  }
}

// Plugin to handle dynamic entries in watch mode
const dynamicEntriesPlugin = () => ({
  name: 'dynamic-entries',

  // Dynamically set input files on each build
  options(options) {
    const entries = discoverEntries()
    if (process.env.VERBOSE) {
      console.log(`📦 Found ${Object.keys(entries).length} entry files`)
    }
    options.input = entries
    return options
  },
})

// CSS/SCSS plugin to handle styles without creating .js files
const cssPlugin = () => {
  const imports = {}
  const cssExts = /\.(s?css|module\.(s?css))$/

  return {
    name: 'css-handler',

    resolveId(source, importer) {
      if (cssExts.test(source) && importer && source[0] === '.') {
        ;(imports[importer] ??= []).push(source)
        return { id: source, external: true }
      }
    },

    generateBundle(opts, bundle) {
      // Emit all CSS/SCSS files
      glob.sync('src/**/*.{css,scss}').forEach(file => {
        const isSass = file.endsWith('.scss')
        this.emitFile({
          type: 'asset',
          fileName: file.replace('src/', '').replace('.scss', '.css'),
          source: isSass
            ? sass.compile(file, { style: 'compressed' }).css
            : fs.readFileSync(file, 'utf-8'),
        })
      })

      // Re-inject imports after directives (only for side-effect imports)
      if (opts.preserveModules) {
        Object.values(bundle).forEach(chunk => {
          if (chunk.type === 'chunk' && imports[chunk.facadeModuleId]) {
            // Check which CSS files need side-effect imports
            const neededImports = imports[chunk.facadeModuleId].filter(file => {
              const cssFile = file.replace('.scss', '.css')
              // Check if there's already a default/named import for this file
              const hasImport =
                chunk.code.includes(`from '${file}'`) ||
                chunk.code.includes(`from "${file}"`) ||
                chunk.code.includes(`from '${cssFile}'`) ||
                chunk.code.includes(`from "${cssFile}"`)
              return !hasImport
            })

            if (neededImports.length > 0) {
              const cssImports =
                neededImports.map(f => `import "${f.replace('.scss', '.css')}";`).join('\n') + '\n'

              const directive = chunk.code.match(/^(['"]use \w+['"];?\n?)/)
              chunk.code = directive
                ? chunk.code.replace(directive[0], directive[0] + cssImports)
                : cssImports + chunk.code
            }
          }
        })
      }
    },

    renderChunk(code) {
      // Transform all .scss imports to .css
      let transformed = code

      // Transform side-effect imports: import './file.scss'
      transformed = transformed.replace(/import\s+(['"])([^'"]+)\.scss\1/g, 'import $1$2.css$1')

      // Transform default imports: import styles from './file.scss'
      transformed = transformed.replace(
        /import\s+(\w+)\s+from\s+(['"])([^'"]+)\.scss\2/g,
        'import $1 from $2$3.css$2'
      )

      // Transform named imports: import { something } from './file.scss'
      transformed = transformed.replace(
        /import\s+(\{[^}]+\})\s+from\s+(['"])([^'"]+)\.scss\2/g,
        'import $1 from $2$3.css$2'
      )

      // Transform mixed imports: import styles, { something } from './file.scss'
      transformed = transformed.replace(
        /import\s+(\w+)\s*,\s*(\{[^}]+\})\s+from\s+(['"])([^'"]+)\.scss\3/g,
        'import $1, $2 from $3$4.css$3'
      )

      return transformed !== code ? { code: transformed, map: null } : null
    },
  }
}

// Create the combined alias and exports plugin (singleton)
const aliasPlugin = aliasExportsPlugin(packageName)
const dynamicPlugin = dynamicEntriesPlugin()

// Function to create the rollup config - allows dynamic updates
const createConfig = () => ({
  // input is set dynamically by dynamicEntriesPlugin
  output: {
    dir: 'dist',
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
    sourcemap: true,
    entryFileNames: '[name].js',
    chunkFileNames: '[name].js',
  },
  plugins: [
    dynamicPlugin, // Must be first to handle deleted files
    aliasPlugin,
    swc({
      swc: {
        sourceMaps: true,
        jsc: {
          target: 'esnext',
          parser: {
            syntax: 'typescript',
            tsx: true,
            dts: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
              pragmaFrag: 'React.Fragment',
              throwIfNamespace: true,
              development: false,
              useBuiltins: true,
            },
          },
        },
        module: {
          type: 'es6',
        },
      },
      exclude: [
        '**/__tests__/**/*',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.css',
        '**/*.scss',
        '**/*.sass',
        '**/*.less',
        '**/*.module.css',
        '**/*.module.scss',
      ],
    }),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      preferBuiltins: true,
    }),
    preserveDirectives(),
    cssPlugin(), // Handle CSS/SCSS without creating .js files
    json(),
    copyAssets(),
  ],
  external,
  treeshake: {
    moduleSideEffects: false,
  },
  onwarn(warning, warn) {
    // Suppress 'use client' warnings since preserve-directives handles them
    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
    warn(warning)
  },
})

// Export the configuration
export default createConfig()
