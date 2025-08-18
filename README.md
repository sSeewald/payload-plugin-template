# Payload v3 Plugin Template
[![author](https://img.shields.io/badge/author-Sascha%20Seewald-blue)](https://www.linkedin.com/in/sascha-seewald-1a065336/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Payload CMS](https://img.shields.io/badge/Payload%20CMS-3.x-black.svg)](https://payloadcms.com/)

[![CI](https://github.com/sSeewald/payload-plugin-template/actions/workflows/test.yml/badge.svg)](https://github.com/sSeewald/payload-plugin-template/actions/workflows/ci.yml) [![Forked From](https://img.shields.io/badge/forked%20from-payloadcms%2Fpayload--plugin--template-blue?style=flat-square)](https://github.com/payloadcms/payload-plugin-template)

> **This is a fork of the official [Payload Plugin Template](https://github.com/payloadcms/payload-plugin-template)**
> Special thanks to the amazing team at [Payload CMS](https://payloadcms.com) for creating this excellent foundation for plugin development.

A modern, production-ready template for creating [Payload CMS](https://payloadcms.com) plugins with TypeScript, React, and comprehensive testing.

## Features

- **Complete Development Environment**: Pre-configured with hot-reloading, TypeScript, and ESLint
- **Docker Support**: Ready-to-use Docker setup for containerized development
- **Comprehensive Testing**: Jest test suite with examples for components, endpoints, and integration tests
- **Example Components**: Server and Client component examples demonstrating Payload's architecture
- **Custom Endpoints**: Example API endpoint implementation
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Modern Tooling**: Uses pnpm workspaces, Next.js 15, and React 19

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm 8+
- Docker (optional, for containerized development)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/payload-plugin-template.git
cd payload-plugin-template
```

2. Install dependencies:
```bash
pnpm install
```

3. Start development:
```bash
pnpm dev
```

This will:
- Watch and compile the plugin source code
- Start the development Payload app at http://localhost:3000
- Enable hot-reloading for both plugin and app code

## Project Structure

```
payload-plugin-template/
├── src/                    # Plugin source code
│   ├── components/         # React components (Server & Client)
│   ├── endpoints/          # Custom API endpoints
│   ├── __tests__/          # Jest test suites
│   ├── plugin.ts           # Main plugin configuration
│   └── index.ts            # Plugin exports
├── dev/                    # Development Payload app
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   └── payload.config.ts
│   └── package.json
├── dist/                   # Compiled plugin output
└── package.json            # Plugin package configuration
```

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development with hot-reloading |
| `pnpm build` | Build the plugin for production |
| `pnpm test` | Run the test suite |
| `pnpm lint` | Lint the codebase |
| `pnpm dev:docker` | Start development with Docker |

### Docker Development

For containerized development with MongoDB:

```bash
# Start Docker environment
pnpm dev:docker

# Stop containers
cd dev && pnpm docker:down

# Clean volumes
cd dev && pnpm docker:clean
```

### Testing

The template includes comprehensive test examples:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

Test files are located in `src/__tests__/` and cover:
- Plugin initialization
- React components (Server & Client)
- Custom endpoints
- Integration scenarios

## Building Your Plugin

### 1. Update Package Information

Edit `package.json` with your plugin details:

```json
{
  "name": "payload-plugin-your-name",
  "description": "Your plugin description",
  "author": "Your Name",
  "license": "MIT"
}
```

### 2. Configure the Plugin

The main plugin file is `src/plugin.ts`:

```typescript
export const yourPlugin = (pluginOptions: PluginTypes) =>
  (incomingConfig: Config): Config => {
    let config = { ...incomingConfig }

    // Extend collections
    config.collections = [
      ...(config.collections || []),
      // Your collections
    ]

    // Add custom endpoints
    config.endpoints = [
      ...(config.endpoints || []),
      // Your endpoints
    ]

    return config
  }
```

### 3. Add Components

Create Server and Client components in `src/components/`:

**Server Component** (runs during SSR):
```tsx
export const MyServerComponent: PayloadServerReactComponent = () => {
  // Has access to server-side resources
  return <div>Server Component</div>
}
```

**Client Component** (runs in browser):
```tsx
'use client'
export const MyClientComponent: PayloadClientReactComponent = () => {
  // Can use hooks and browser APIs
  const [state, setState] = useState()
  return <div>Client Component</div>
}
```

### 4. Create Endpoints

Add custom API endpoints in `src/endpoints/`:

```typescript
export const myEndpoint: Endpoint = {
  path: '/my-endpoint',
  method: 'get',
  handler: async (req) => {
    return Response.json({ message: 'Hello!' })
  }
}
```

## Publishing

1. Build your plugin:
```bash
pnpm build
```

2. Publish to npm:
```bash
npm publish
```

3. Users can then install your plugin:
```bash
pnpm add your-plugin-name
```

## Best Practices

- Always spread existing config arrays/objects to preserve data
- Provide TypeScript types for all plugin options
- Include comprehensive tests
- Add an enable/disable option
- Document all configuration options
- Use Semantic Versioning
- Tag your repository with `payload-plugin`

## Resources

- [Payload Plugin Documentation](https://payloadcms.com/docs/plugins/overview)
- [Payload CMS Documentation](https://payloadcms.com/docs)

## License

MIT - See [LICENSE](LICENSE) for details

## Questions & Support

- For plugin template issues: [Open an issue](https://github.com/sSeewald/payload-plugin-template/issues)
- For general inquiries: [dev@payloadcms.com](mailto:dev@payloadcms.com)

---

Built with ❤️ using [Payload CMS](https://payloadcms.com)
