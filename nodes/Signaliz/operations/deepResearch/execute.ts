import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, index: number) {
	const description = this.getNodeParameter('description', index) as string;
	const targetCount = this.getNodeParameter('targetCount', index) as number;
	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as any;

	const body: any = {
		description,
		target_count: targetCount,
	};

	if (additionalFields.saveToDatabase !== undefined) {
		body.save_to_database = additionalFields.saveToDatabase;
	}

	if (additionalFields.selectedModel) {
		body.selected_model = additionalFields.selectedModel;
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
				url: 'https://api.signaliz.com/functions/v1/deep-research',
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

