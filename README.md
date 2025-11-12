# n8n-nodes-signaliz

This is an n8n community node that lets you use [Signaliz](https://signaliz.com) in your n8n workflows.

Signaliz is an AI-powered company research and signal detection platform that helps you discover, understand, and track companies using advanced AI models.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Nodes (Recommended)

1. Go to **Settings** → **Community Nodes** in your n8n instance
2. Click **Install**
3. Enter `n8n-nodes-signaliz`
4. Click **Install**
5. Restart n8n to load the node

### Manual Installation

To install manually, navigate to your n8n installation directory and run:

```bash
npm install n8n-nodes-signaliz
```

## Operations

This node supports the following operations:

### Company Signal Enrichment
- **Enrich Company**: Find business signals (news, product launches, executive hires, funding, partnerships) about a specific company using 30 parallel AI searches

### Deep Research
- **Find Companies**: Find companies exhibiting behavioral signals (hiring, funding, tech adoption, growth patterns) with webhook-based async execution

### Agentic Research
- **Research Company**: Conduct AI-powered research on a specific company with custom questions and automatic AI model selection

### Multipass Research
- **Bulk Discovery**: High-speed parallel research for finding 10-500 companies matching ICP criteria
- **Single Company Enrichment**: Comprehensive data gathering for one company with sources from multiple search pathways

## Credentials

To use this node, you need a Signaliz API key:

1. Log in to your [Signaliz workspace](https://signaliz.com/dashboard)
2. Navigate to **Settings** → **API Keys**
3. Click **Generate API Key**
4. Copy the API key (starts with `sk_`)
5. In n8n, create new Signaliz API credentials and paste your API key

## Compatibility

- Minimum n8n version: 1.0.0
- Tested with n8n version: 1.19.0

## Usage

### Example 1: Company Signal Enrichment

Find recent signals about a company:

1. Add the Signaliz node to your workflow
2. Select **Company Signal Enrichment** as the resource
3. Choose **Enrich Company** operation
4. Enter the company name (e.g., "Snowflake")
5. Add a research prompt (e.g., "Find recent product launches and executive hires")
6. Optionally add the company domain for better accuracy
7. Set target signal count and lookback days
8. Execute the workflow

The node returns signals with titles, content, URLs, confidence scores, and metadata.

### Example 2: Deep Research

Find companies matching your ICP:

1. Add the Signaliz node
2. Select **Deep Research** as the resource
3. Choose **Find Companies** operation
4. Enter a description (e.g., "B2B SaaS companies hiring executives in last 90 days")
5. Set target count (max 25)
6. Optionally add a webhook URL to receive results as they're found
7. Execute the workflow

The node returns a job ID and task URL. Results are delivered via webhook if configured.

### Example 3: Agentic Research

Research a specific company with AI:

1. Add the Signaliz node
2. Select **Agentic Research** as the resource
3. Choose **Research Company** operation
4. Enter company name (e.g., "Stripe")
5. Add research prompt (e.g., "What is their current AI strategy?")
6. Optionally add company context (domain, LinkedIn URL, industry, etc.)
7. Add webhook URL for completion notification (optional)
8. Execute the workflow

The node returns a job ID and task ID. Results are saved to your workspace and delivered via webhook.

### Example 4: Multipass Research - Bulk Discovery

Find multiple companies at scale:

1. Add the Signaliz node
2. Select **Multipass Research** as the resource
3. Choose **Bulk Discovery** operation
4. Enter research prompt (e.g., "Find B2B SaaS companies in marketing automation with 50-200 employees")
5. Set target count (up to 500)
6. Add webhook URL to receive each company as it's discovered
7. Execute the workflow

The node uses 15 parallel batch searches across 5 diverse pathways for maximum coverage.

## Features

- ✅ **Complete API Coverage**: All Signaliz API endpoints supported
- ✅ **Webhook Support**: Real-time results via webhooks for async operations
- ✅ **File Attachments**: Support for Google Docs, PDFs, and other documents
- ✅ **Multiple AI Models**: Choose from Claude, GPT, Gemini, and more
- ✅ **Signal Detection**: Track funding, hiring, product launches, partnerships, and more
- ✅ **Bulk Operations**: Find up to 500 companies in a single request
- ✅ **Error Handling**: Comprehensive error handling with meaningful messages
- ✅ **Type Safety**: Full TypeScript implementation

## API Rate Limits

- **Rate Limit**: 100 requests per minute per API key
- **Deep Research**: 10 requests per minute per API key
- **Agentic Research**: 10 requests per minute per API key
- **Multipass Research**: 10 requests per minute per API key

Contact Signaliz support for higher limits.

## Pricing

Signaliz uses a credit-based pricing model:

- **Company Signal Enrichment**: 1 base credit + API costs (~$0.026-0.078 USD per request)
- **Cache Hits**: 0 credits (same workspace/API key)
- **Deep Research**: 1 credit per second of execution time
- **Agentic Research**: 1 credit per second of execution time
- **Multipass Research**: 1 credit per second of execution time
- **File Attachments**: FREE - no credit charge

See [Signaliz pricing](https://signaliz.com/pricing) for details.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Signaliz API Documentation](https://signaliz.com/dashboard/api-documentation)
- [Signaliz Website](https://signaliz.com)

## License

[MIT](LICENSE.md)

## Support

For issues with this n8n node:
- Open an issue on [GitHub](https://github.com/bcharleson/n8n-nodes-signaliz/issues)

For Signaliz API support:
- Contact [Signaliz Support](https://signaliz.com/support)
- Visit [Signaliz Documentation](https://signaliz.com/dashboard/api-documentation)


