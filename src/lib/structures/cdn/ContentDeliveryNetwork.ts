import { Cache } from '@klasa/cache';
import { ContentNode } from '@lib/structures/cdn/ContentNode';
import { URL } from 'url';
import type { Client } from '@klasa/core';
import { TimerManager } from '@klasa/timer-manager';
import type { ClientManager } from '@lib/structures/ClientManager';
import type { ClientEngine, ContentNodeJSON } from '@lib/types/interfaces';

export class ContentDeliveryNetwork extends Cache<string, ContentNode> implements ClientEngine {

	public readonly fetchMap = new WeakMap<ContentNode, Promise<ContentNode>>();

	#sweepInterval: NodeJS.Timer | null = null; // eslint-disable-line @typescript-eslint/explicit-member-accessibility

	public constructor(public readonly manager: ClientManager) {
		super();
	}

	public get client(): Client {
		return this.manager.client;
	}

	public set(url: string, node: ContentNode): this {
		if (this.#sweepInterval === null) this.#sweepInterval = TimerManager.setInterval(this.sweep.bind(this), 30000);
		return super.set(url, node);
	}

	public sweep(fn: (value: ContentNode, key: string, cache: this) => boolean = (cn): boolean => cn.expired, thisArg?: any): number {
		const amount = super.sweep(fn, thisArg);

		if (this.size === 0) {
			TimerManager.clearInterval(this.#sweepInterval!);
			this.#sweepInterval = null;
		}

		return amount;
	}

	public acquire(url: string): ContentNode {
		return this.get(url) ?? this.create(url);
	}

	public create(url: string): ContentNode {
		try {
			new URL(url);
		} catch {
			throw new Error('Invalid url provided');
		}

		const node = new ContentNode(this, url);
		this.set(url, node);

		return node;
	}

	public async fetch(force = false): Promise<ContentNode[]> {
		return Promise.all(this.map((node): Promise<ContentNode> => node.fetch(force)));
	}

	public toJSON(): ContentNodeJSON[] {
		return this.map((node): ContentNodeJSON => node.toJSON());
	}

	public static get [Symbol.species](): typeof Cache {
		return Cache;
	}

}
