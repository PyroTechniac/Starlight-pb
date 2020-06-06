import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import type { ParsedPart } from '../types/interfaces';

export function noop(): null {
	return null;
}

export namespace HTTPUtils {

	const [SLASH, COLON] = [47, 58] as const;

	export function parsePart(value: string): ParsedPart {
		const type = Number(value.charCodeAt(0) === COLON);
		if (type) value = value.substring(1);
		return { type, value };
	}

	export function split(url: string): readonly string[] {
		if (url.length === 1 && url.charCodeAt(0) === SLASH) return [url];
		else if (url.charCodeAt(0) === SLASH) url = url.substring(1);
		return url.split('/');
	}

	export function parse(url: string): readonly ParsedPart[] {
		return split(url).map(parsePart);
	}

	export function encrypt(data: unknown, secret: string): string {
		const iv = randomBytes(16);
		const cipher = createCipheriv('aes-256-cbc', secret, iv);
		return `${cipher.update(JSON.stringify(data), 'utf8', 'base64') + cipher.final('base64')}.${iv.toString('base64')}`;
	}

	export function decrypt(token: string, secret: string): unknown {
		const [data, iv] = token.split('.');
		const decipher = createDecipheriv('aes-256-cbc', secret, Buffer.from(iv, 'base64'));
		return JSON.parse(decipher.update(data, 'base64', 'utf8') + decipher.final('utf8')) as unknown;
	}
}
