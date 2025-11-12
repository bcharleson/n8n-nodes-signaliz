import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as companySignalEnrichment from './operations/companySignalEnrichment';
import * as deepResearch from './operations/deepResearch';
import * as agenticResearch from './operations/agenticResearch';
import * as multipassResearch from './operations/multipassResearch';

export class Signaliz implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Signaliz',
		name: 'signaliz',
		icon: 'file:signaliz-icon.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'AI-powered company research and signal detection',
		defaults: {
			name: 'Signaliz',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'signalizApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Company Signal Enrichment',
						value: 'companySignalEnrichment',
						description: 'Find business signals about a specific company',
					},
					{
						name: 'Deep Research',
						value: 'deepResearch',
						description: 'Find companies matching ICP criteria with signals',
					},
					{
						name: 'Agentic Research',
						value: 'agenticResearch',
						description: 'AI-powered research on a specific company',
					},
					{
						name: 'Multipass Research',
						value: 'multipassResearch',
						description: 'High-speed parallel research for bulk discovery',
					},
				],
				default: 'companySignalEnrichment',
			},
			...companySignalEnrichment.description,
			...deepResearch.description,
			...agenticResearch.description,
			...multipassResearch.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				if (resource === 'companySignalEnrichment') {
					responseData = await companySignalEnrichment.execute.call(this, i);
				} else if (resource === 'deepResearch') {
					responseData = await deepResearch.execute.call(this, i);
				} else if (resource === 'agenticResearch') {
					responseData = await agenticResearch.execute.call(this, i);
				} else if (resource === 'multipassResearch') {
					responseData = await multipassResearch.execute.call(this, i);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as any),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						[{ json: { error: (error as Error).message } }],
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

