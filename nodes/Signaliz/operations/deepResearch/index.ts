import type { INodeProperties } from 'n8n-workflow';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['deepResearch'],
			},
		},
		options: [
			{
				name: 'Find Companies',
				value: 'findCompanies',
				description: 'Find companies exhibiting behavioral signals',
				action: 'Find companies with signals',
			},
		],
		default: 'findCompanies',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deepResearch'],
				operation: ['findCompanies'],
			},
		},
		default: '',
		placeholder: 'Hiring Exec Roles',
		description: 'Natural language description of companies to find',
		typeOptions: {
			rows: 3,
		},
	},
	{
		displayName: 'Target Count',
		name: 'targetCount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['deepResearch'],
				operation: ['findCompanies'],
			},
		},
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 25,
		},
		description: 'Maximum number of companies to return (max: 25)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['deepResearch'],
				operation: ['findCompanies'],
			},
		},
		options: [
			{
				displayName: 'Save to Database',
				name: 'saveToDatabase',
				type: 'boolean',
				default: true,
				description: 'Whether to save found companies to your workspace database',
			},
			{
				displayName: 'Selected Model',
				name: 'selectedModel',
				type: 'options',
				options: [
					{ name: 'Anthropic Claude Sonnet 4.5', value: 'anthropic/claude-sonnet-4.5' },
					{ name: 'Anthropic Claude Opus 4', value: 'anthropic/claude-opus-4' },
					{ name: 'OpenAI GPT-5 Pro', value: 'openai/gpt-5-pro' },
					{ name: 'OpenAI O3 Deep Research', value: 'openai/o3-deep-research' },
					{ name: 'Google Gemini 2.5 Pro', value: 'google/gemini-2.5-pro' },
					{ name: 'Perplexity Sonar Deep Research', value: 'perplexity/sonar-deep-research' },
					{ name: 'DeepSeek R1', value: 'deepseek/deepseek-r1-0528' },
				],
				default: '',
				description: 'Force a specific AI model (leave empty for automatic selection)',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'https://your-api.com/webhook',
				description: 'Optional webhook URL to receive individual company results',
			},
			{
				displayName: 'Attached File URLs',
				name: 'attachedFileUrls',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'URLs to fetch documents from (Google Docs, PDFs, etc.)',
				options: [
					{
						name: 'files',
						displayName: 'Files',
						values: [
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								placeholder: 'https://docs.google.com/document/d/...',
								description: 'URL to fetch document from',
							},
							{
								displayName: 'Filename',
								name: 'filename',
								type: 'string',
								default: '',
								placeholder: 'icp_profile.pdf',
								description: 'Optional filename for the document',
							},
						],
					},
				],
			},
		],
	},
];

