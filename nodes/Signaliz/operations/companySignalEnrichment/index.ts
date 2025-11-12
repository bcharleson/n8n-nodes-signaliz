import type { INodeProperties } from 'n8n-workflow';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['companySignalEnrichment'],
			},
		},
		options: [
			{
				name: 'Enrich Company',
				value: 'enrich',
				description: 'Find business signals about a specific company',
				action: 'Enrich company with signals',
			},
		],
		default: 'enrich',
	},
	{
		displayName: 'Company Name',
		name: 'companyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['companySignalEnrichment'],
				operation: ['enrich'],
			},
		},
		default: '',
		placeholder: 'Snowflake',
		description: 'Name of the company to research',
	},
	{
		displayName: 'Research Prompt',
		name: 'researchPrompt',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['companySignalEnrichment'],
				operation: ['enrich'],
			},
		},
		default: '',
		placeholder: 'Find recent product launches, funding news, and executive hires',
		description: 'Natural language description of what signals to find',
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
				resource: ['companySignalEnrichment'],
				operation: ['enrich'],
			},
		},
		options: [
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				placeholder: 'snowflake.com',
				description: 'Company domain - helps with more accurate search',
			},
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				default: '',
				description: 'Your internal company ID - links signals to your company records',
			},
			{
				displayName: 'Signal Types',
				name: 'signalTypes',
				type: 'multiOptions',
				options: [
					{ name: 'Funding', value: 'funding' },
					{ name: 'Hiring', value: 'hiring' },
					{ name: 'Product Launch', value: 'product_launch' },
					{ name: 'Partnership', value: 'partnership' },
					{ name: 'Expansion', value: 'expansion' },
					{ name: 'Leadership Change', value: 'leadership_change' },
					{ name: 'Award', value: 'award' },
					{ name: 'Compliance', value: 'compliance' },
					{ name: 'Pricing Change', value: 'pricing_change' },
					{ name: 'Acquisition', value: 'acquisition' },
					{ name: 'Other', value: 'other' },
				],
				default: [],
				description: 'Specific signal types to focus on',
			},
			{
				displayName: 'Target Signal Count',
				name: 'targetSignalCount',
				type: 'number',
				default: 3,
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				description: 'Number of signals to return (max: 10)',
			},
			{
				displayName: 'Lookback Days',
				name: 'lookbackDays',
				type: 'number',
				default: 180,
				typeOptions: {
					minValue: 30,
					maxValue: 180,
				},
				description: 'How many days to look back (min: 30, max: 180)',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				options: [
					{ name: 'Google Gemini 2.5 Flash', value: 'google/gemini-2.5-flash' },
					{ name: 'Anthropic Claude 3.5 Sonnet', value: 'anthropic/claude-3.5-sonnet' },
					{ name: 'OpenAI GPT-4', value: 'openai/gpt-4' },
				],
				default: 'google/gemini-2.5-flash',
				description: 'AI model to use (automatically gets :online suffix)',
			},
		],
	},
];

