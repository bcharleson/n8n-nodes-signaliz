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

	if (additionalFields.linkedinUrl) {
		body.linkedin_url = additionalFields.linkedinUrl;
	}

	if (additionalFields.industry) {
		body.industry = additionalFields.industry;
	}

	if (additionalFields.website) {
		body.website = additionalFields.website;
	}

	if (additionalFields.location) {
		body.location = additionalFields.location;
	}

	if (additionalFields.description) {
		body.description = additionalFields.description;
	}

	if (additionalFields.webhookUrl) {
		body.webhook_url = additionalFields.webhookUrl;
	}

	if (additionalFields.attachedFileUrls?.files && additionalFields.attachedFileUrls.files.length > 0) {
		body.attached_file_urls = additionalFields.attachedFileUrls.files.map((file: any) => ({
			url: file.url,
			...(file.filename && { filename: file.filename }),
		}));
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'signalizApi',
			{
				method: 'POST',
				url: 'https://api.signaliz.com/functions/v1/company-agentic-research',
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

