import { glob } from 'glob'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

export default function aliasExportsPlugin(packageName) {
  // Cache: filepath -> Set of aliases found in that file
  const fileAliasesCache = new Map()
  let lastExportsHash = null
  let isGeneratingExports = false
  let pendingRegeneration = false
  let buildCount = 0
  let expectedBuilds = 0

  // Extract @ aliases from code
  const extractAliases = code => {
    const aliases = new Set()
    const regex =
      /(?<!from\s+)(?<!import\s+)(?<!import\s+\*\s+as\s+\w+\s+from\s+)['"]@([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)(?:#([^'"]+))?['"]/g

    let match
    while ((match = regex.exec(code)) !== null) {
      const [, path, exportName] = match
      const modulePath = exportName ? `${path}#${exportName}` : path
      aliases.add(modulePath)
    }

    return aliases
  }

  // Generate exports.js file
  const generateExportsFile = async () => {
    // Collect all aliases from all files
    const allAliases = []
    for (const aliases of fileAliasesCache.values()) {
      allAliases.push(...aliases)
    }

    // Create hash to detect changes
    const currentHash = crypto
      .createHash('md5')
      .update(JSON.stringify(allAliases.sort()))
      .digest('hex')

    // Skip if nothing changed
    if (currentHash === lastExportsHash) {
      return false
    }

    lastExportsHash = currentHash

    // Get all available dist files for validation
    const distFiles = new Set(
      glob.sync('dist/**/*.js', {
        cwd: rootDir,
        ignore: ['dist/**/*.map', 'dist/**/*.d.ts', 'dist/exports.js', 'dist/index.js'],
      })
    )

    const exportsByPath = new Map()

    // Process each alias
    allAliases.forEach(modulePath => {
      const [basePath, explicitExportName] = modulePath.split('#')

      // Determine the export name
      let exportName = explicitExportName
      if (!exportName) {
        const pathParts = basePath.split('/')
        exportName = pathParts[pathParts.length - 1]
      }

      // Simple, direct path resolution
      const candidates = [`dist/${basePath}.js`, `dist/${basePath}/index.js`]

      if (process.env.VERBOSE) {
        console.log(`\n📦 Processing alias: @${modulePath}`)
        console.log(`   Base path: ${basePath}`)
        console.log(`   Export name: ${exportName}`)
        console.log(`   Checking candidates:`)
        candidates.forEach(c => {
          const exists = distFiles.has(c)
          console.log(`     - ${c}: ${exists ? '✅ exists' : '❌ not found'}`)
        })
      }

      // Find the first existing file
      const resolvedFile = candidates.find(f => distFiles.has(f))

      if (!resolvedFile) {
        console.error(`\n❌ ERROR: Could not resolve @ alias: @${modulePath}`)
        console.error(`   Tried paths:`)
        candidates.forEach(c => console.error(`     - ${c}`))
        console.error(
          `   Check if the file exists or if the @ alias path matches the actual file structure\n`
        )
        return
      }

      const relativePath = './' + resolvedFile.replace('dist/', '')

      // Check if the file has default export
      const fileContent = fs.readFileSync(path.join(rootDir, resolvedFile), 'utf-8')
      const hasDefaultExport =
        fileContent.includes('export default') ||
        fileContent.includes('export { default }') ||
        fileContent.match(/export\s+{\s*\w+\s+as\s+default\s*}/)

      if (process.env.VERBOSE) {
        console.log(`   Resolved to: ${resolvedFile}`)
        console.log(`   Relative path: ${relativePath}`)
        console.log(`   Has default export: ${hasDefaultExport}`)
        console.log(
          `   Will export as: ${hasDefaultExport ? `default as ${exportName}` : exportName}`
        )
      }

      if (!exportsByPath.has(relativePath)) {
        exportsByPath.set(relativePath, new Map())
      }

      if (hasDefaultExport) {
        exportsByPath.get(relativePath).set(exportName, 'default')
      } else {
        exportsByPath.get(relativePath).set(exportName, exportName)
      }
    })

    // Generate exports file content
    if (process.env.VERBOSE) {
      console.log(`\n📋 Export map has ${exportsByPath.size} entries:`)
      exportsByPath.forEach((nameMap, path) => {
        const names = Array.from(nameMap.keys()).join(', ')
        console.log(`   ${path}: ${names}`)
      })
    }

    const exports = Array.from(exportsByPath.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([path, nameMap]) => {
        const exportParts = Array.from(nameMap.entries()).map(([exportName, sourceName]) => {
          if (sourceName === 'default') {
            return `default as ${exportName}`
          } else {
            return exportName
          }
        })
        return `export { ${exportParts.join(', ')} } from '${path}';`
      })
      .join('\n')

    const content = `// Auto-generated file - do not edit directly
// Re-exports all components and utilities for easy access

${exports}
`

    // Ensure dist directory exists
    const distDir = path.join(rootDir, 'dist')
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true })
    }

    fs.writeFileSync(path.join(distDir, 'exports.js'), content)
    console.info(`Generated exports.js with ${exportsByPath.size} export statements`)

    return true
  }

  // Helper function to process file changes
  const processFileChange = id => {
    // Only process TypeScript files
    if (!id.endsWith('.ts') && !id.endsWith('.tsx')) return

    if (process.env.VERBOSE) {
      console.log(`🔄 File changed: ${path.basename(id)}`)
    }

    // Check if file was deleted
    if (!fs.existsSync(id)) {
      if (process.env.VERBOSE) {
        console.log(`   🗑️ File deleted, removing from cache`)
      }
      fileAliasesCache.delete(id)

      // Trigger regeneration
      if (!isGeneratingExports) {
        isGeneratingExports = true
        generateExportsFile()
          .then(changed => {
            isGeneratingExports = false
            if (changed) {
              console.log('📝 File deleted - exports.js updated')
            }
          })
          .catch(err => {
            console.error('Error generating exports after deletion:', err)
            isGeneratingExports = false
          })
      }
      return
    }

    // Re-scan the changed file immediately
    try {
      const code = fs.readFileSync(id, 'utf-8')
      const aliases = extractAliases(code)

      // Update cache
      if (aliases.size > 0) {
        fileAliasesCache.set(id, aliases)
        if (process.env.VERBOSE) {
          console.log(`   Found ${aliases.size} @ aliases`)
        }
      } else {
        fileAliasesCache.delete(id)
        if (process.env.VERBOSE) {
          console.log(`   No @ aliases found`)
        }
      }

      // Start or queue regeneration
      if (!isGeneratingExports) {
        isGeneratingExports = true
        generateExportsFile()
          .then(changed => {
            isGeneratingExports = false

            if (changed) {
              console.log('📝 @ alias paths changed - exports.js updated')
            }

            // If more changes came in while generating, run again
            if (pendingRegeneration) {
              pendingRegeneration = false
              // Just regenerate again
              generateExportsFile().then(changed2 => {
                if (changed2) {
                  if (process.env.VERBOSE) {
                    console.log('📝 Queued regeneration completed')
                  }
                }
              })
            }
          })
          .catch(err => {
            console.error('Error generating exports:', err)
            isGeneratingExports = false
          })
      } else {
        // Mark that we need another generation after the current one
        pendingRegeneration = true
        if (process.env.VERBOSE) {
          console.log('   ⏳ Queued for regeneration after current build')
        }
      }
    } catch (err) {
      console.error(`Error processing ${id}:`, err.message)
    }
  }

  return {
    name: 'alias-exports',

    // Transform @ aliases and track them
    transform(code, id) {
      if (!id.endsWith('.ts') && !id.endsWith('.tsx')) return null

      // Extract aliases from this file
      const aliases = extractAliases(code)

      // Update cache for this file
      if (aliases.size > 0) {
        fileAliasesCache.set(id, aliases)

        if (process.env.VERBOSE) {
          console.log(`Found ${aliases.size} @ aliases in ${id}:`, Array.from(aliases))
        }
      } else {
        // Remove from cache if no aliases
        fileAliasesCache.delete(id)
      }

      // Transform the code
      const transformed = code.replace(
        /(?<!from\s+)(?<!import\s+)(?<!import\s+\*\s+as\s+\w+\s+from\s+)['"]@([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)(?:#([^'"]+))?['"]/g,
        (match, path, exportName) => {
          const componentName = exportName || path.split('/').pop()
          return `"${packageName}/exports#${componentName}"`
        }
      )

      return transformed !== code ? { code: transformed, map: null } : null
    },

    // Handle file changes in watch mode
    watchChange(id) {
      processFileChange(id)
    },

    // Track build starts
    buildStart() {
      buildCount++
      if (process.env.VERBOSE) {
        console.log(`Build ${buildCount} started`)
      }
    },

    // Keep track of builds
    buildEnd() {
      // This is called after all transforms are complete for this build
      if (process.env.VERBOSE) {
        console.log(
          `Build ${buildCount} completed, cache has ${fileAliasesCache.size} files with aliases`
        )
      }
    },

    // Generate exports after bundle is written
    async writeBundle() {
      expectedBuilds++

      // Wait a bit for all parallel builds to complete
      setTimeout(async () => {
        // Only generate once after all expected builds
        if (expectedBuilds >= buildCount) {
          await generateExportsFile()
          // Reset counters
          buildCount = 0
          expectedBuilds = 0
        }
      }, 200)
    },
  }
}
