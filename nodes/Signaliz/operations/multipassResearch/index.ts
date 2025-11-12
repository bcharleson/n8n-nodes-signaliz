import type { INodeProperties } from 'n8n-workflow';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['multipassResearch'],
			},
		},
		options: [
			{
				name: 'Bulk Discovery',
				value: 'bulkDiscovery',
				description: 'Find multiple companies matching ICP criteria',
				action: 'Find multiple companies',
			},
			{
				name: 'Single Company Enrichment',
				value: 'singleCompany',
				description: 'Deep enrichment for one specific company',
				action: 'Enrich single company',
			},
		],
		default: 'bulkDiscovery',
	},
	// Bulk Discovery Fields
	{
		displayName: 'Research Prompt',
		name: 'researchPrompt',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['multipassResearch'],
				operation: ['bulkDiscovery'],
			},
		},
		default: '',
		placeholder: 'Find B2B SaaS companies in marketing automation with 50-200 employees',
		description: 'Your research question or ICP criteria',
		typeOptions: {
			rows: 3,
		},
	},
	{
		displayName: 'Target Count',
		name: 'targetCount',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['multipassResearch'],
				operation: ['bulkDiscovery'],
			},
		},
		default: 25,
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		description: 'Number of companies to find (max: 500)',
	},
	// Single Company Fields
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['multipassResearch'],
				operation: ['singleCompany'],
			},
		},
		default: '',
		placeholder: 'Snowflake',
		description: 'Name of the company to research',
	},
	{
		displayName: 'Research Prompt',
		name: 'researchPromptSingle',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['multipassResearch'],
				operation: ['singleCompany'],
			},
		},
		default: '',
		placeholder: 'Analyze cloud data platform positioning and recent product launches',
		description: 'Research question for this company',
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
				resource: ['multipassResearch'],
			},
		},
		options: [
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				placeholder: 'snowflake.com',
				description: 'Company domain (for single company mode)',
			},
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				default: '',
				placeholder: 'https://linkedin.com/company/snowflake-computing',
				description: 'Company LinkedIn URL (for single company mode)',
			},
			{
				displayName: 'Industry',
				name: 'industry',
				type: 'string',
				default: '',
				placeholder: 'Cloud Data Platform',
				description: 'Company industry classification',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'https://api.clay.com/webhooks/company-found',
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
				description: 'URLs to fetch documents from (Google Docs, PDFs, ICP documents)',
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

