import { Middleware, MiddlewareOptions } from '@http/Middleware';
import { mergeOptions } from '@utils/decorators';
import type { StarlightIncomingMessage } from '@http/StarlightIncomingMessage';
import type { Transform } from 'stream';
import { createInflate, createGunzip } from 'zlib';

@mergeOptions<MiddlewareOptions>({
	priority: 10
})
export default class extends Middleware {

	public async run(request: StarlightIncomingMessage): Promise<void> {
		if (request.method !== 'POST') return;

		const stream = this.contentStream(request);
		let body = '';

		for await (const chunk of stream) body += chunk;

		const data = JSON.parse(body);
		request.body = data;
	}

	private contentStream(request: StarlightIncomingMessage): Transform {
		const length = request.headers['content-length'];
		let stream: Transform | null = null;
		switch ((request.headers['content-encoding'] || 'identity').toLowerCase()) {
			case 'deflate':
				stream = createInflate();
				request.pipe(stream);
				break;
			case 'gzip':
				stream = createGunzip();
				request.pipe(stream);
				break;
			case 'identity':
				stream = request as unknown as Transform;
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-expect-error
				stream.length = length;
				break;
		}
		return stream!;
	}

}
