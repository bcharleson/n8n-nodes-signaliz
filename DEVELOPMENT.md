# Development Guide

This document provides information for developers working on the n8n-nodes-signaliz package.

## Project Structure

```
n8n-nodes-signaliz/
├── credentials/
│   └── SignalizApi.credentials.ts    # API authentication
├── nodes/
│   └── Signaliz/
│       ├── Signaliz.node.ts          # Main node implementation
│       ├── Signaliz.node.json        # Node metadata
│       ├── signaliz.svg              # Node icon
│       └── operations/               # Operation implementations
│           ├── companySignalEnrichment/
│           │   ├── index.ts          # Operation definitions
│           │   └── execute.ts        # Execution logic
│           ├── deepResearch/
│           ├── agenticResearch/
│           └── multipassResearch/
├── dist/                             # Compiled output (gitignored)
├── package.json
├── tsconfig.json
├── gulpfile.js
└── README.md
```

## Development Workflow

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Project

```bash
npm run build
```

This runs TypeScript compilation and copies SVG icons to the dist folder.

### 3. Link for Local Testing

To test in a local n8n instance:

```bash
# In this project directory
npm link

# In your n8n installation directory
npm link n8n-nodes-signaliz

# Restart n8n
n8n start
```

### 4. Watch Mode (Development)

For active development, use watch mode:

```bash
npm run build -- --watch
```

## API Endpoints

### Company Signal Enrichment
- **Endpoint**: `/company-signal-enrichment`
- **Method**: POST
- **Purpose**: Find business signals about a specific company
- **Response**: Synchronous (immediate results)

### Deep Research
- **Endpoint**: `/deep-research`
- **Method**: POST
- **Purpose**: Find companies matching ICP criteria
- **Response**: Async (webhook-based)

### Agentic Company Research
- **Endpoint**: `/company-agentic-research`
- **Method**: POST
- **Purpose**: AI-powered research on a specific company
- **Response**: Async (webhook-based)

### Multipass Company Research
- **Endpoint**: `/company-multipass-research`
- **Method**: POST
- **Purpose**: High-speed parallel research for bulk discovery
- **Response**: Async (webhook-based)

## Code Conventions

- **TypeScript**: Strict mode enabled
- **Naming**: PascalCase for classes, camelCase for variables/functions
- **Error Handling**: Use NodeApiError for API errors
- **Authentication**: Bearer token via httpRequestWithAuthentication
- **Parameters**: Use snake_case for API request bodies (Signaliz API convention)

## Testing Checklist

Before publishing:

- [ ] All operations build without errors
- [ ] Credentials authenticate successfully
- [ ] Each operation executes correctly in n8n
- [ ] Webhook URLs work for async operations
- [ ] File attachments upload properly
- [ ] Error messages are clear and helpful
- [ ] README examples are accurate
- [ ] Icon displays correctly in n8n UI

## Publishing to npm

1. Update version in package.json
2. Build the project: `npm run build`
3. Test locally with `npm link`
4. Publish: `npm publish`

## Resources

- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [Signaliz API Docs](https://signaliz.com/dashboard/api-documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For questions or issues:
- GitHub Issues: https://github.com/bcharleson/n8n-nodes-signaliz/issues
- Signaliz Support: https://signaliz.com/support

