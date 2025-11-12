import type { INodeProperties } from 'n8n-workflow';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['agenticResearch'],
			},
		},
		options: [
			{
				name: 'Research Company',
				value: 'research',
				description: 'Conduct AI-powered research on a specific company',
				action: 'Research a company',
			},
		],
		default: 'research',
	},
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['agenticResearch'],
				operation: ['research'],
			},
		},
		default: '',
		placeholder: 'Stripe',
		description: 'The name of the company to research',
	},
	{
		displayName: 'Research Prompt',
		name: 'researchPrompt',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['agenticResearch'],
				operation: ['research'],
			},
		},
		default: '',
		placeholder: 'What is their current AI strategy?',
		description: 'Your research question or prompt',
		typeOptions: {
			rows: 3,
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['agenticResearch'],
				operation: ['research'],
			},
		},
		options: [
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				placeholder: 'stripe.com',
				description: 'Company domain',
			},
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				default: '',
				placeholder: 'https://linkedin.com/company/stripe',
				description: 'Company LinkedIn URL',
			},
			{
				displayName: 'Industry',
				name: 'industry',
				type: 'string',
				default: '',
				placeholder: 'Financial Services',
				description: 'Company industry',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				placeholder: 'https://stripe.com',
				description: 'Company website URL',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				placeholder: 'San Francisco, CA',
				description: 'Company headquarters location',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: 'Online payment processing platform',
				description: 'Brief company description',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'https://your-api.com/webhooks/research',
				description: 'Optional webhook URL to receive completion notification',
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
								placeholder: 'icp_requirements.pdf',
								description: 'Optional filename for the document',
							},
						],
					},
				],
			},
		],
	},
];

