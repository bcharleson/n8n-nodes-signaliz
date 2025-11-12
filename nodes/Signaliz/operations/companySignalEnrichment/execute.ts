import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, index: number) {
	const companyName = this.getNodeParameter('companyName', index) as string;
	const researchPrompt = this.getNodeParameter('researchPrompt', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;

	const body: any = {
		company_name: companyName,
		research_prompt: researchPrompt,
	};

	if (additionalFields.domain) {
		body.domain = additionalFields.domain;
	}

	if (additionalFields.companyId) {
		body.company_id = additionalFields.companyId;
	}

	if (additionalFields.signalTypes && additionalFields.signalTypes.length > 0) {
		body.signal_types = additionalFields.signalTypes;
	}

	if (additionalFields.targetSignalCount) {
		body.target_signal_count = additionalFields.targetSignalCount;
	}

	if (additionalFields.lookbackDays) {
		body.lookback_days = additionalFields.lookbackDays;
	}

	if (additionalFields.model) {
		body.model = additionalFields.model;
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'signalizApi',
			{
				method: 'POST',
				url: 'https://api.signaliz.com/functions/v1/company-signal-enrichment',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body,
				json: true,
			},
		);

		return response;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as any);
	}
}

