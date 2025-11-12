import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class SignalizApi implements ICredentialType {
	name = 'signalizApi';
	displayName = 'Signaliz API';
	documentationUrl = 'https://signaliz.com/dashboard/api-documentation';

	icon: Icon = {
		light: 'file:signaliz-icon.svg',
		dark: 'file:signaliz-icon.svg',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			placeholder: 'sk_...',
			description: 'Your Workspace API Key from Signaliz (starts with sk_). Generate it from Settings → API Keys in your workspace.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.signaliz.com/functions/v1',
			url: '/company-signal-enrichment',
			method: 'POST',
			body: {
				company_name: 'Test Company',
				research_prompt: 'Test authentication',
				target_signal_count: 1,
			},
		},
	};
}

