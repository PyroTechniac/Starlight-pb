import type { Client } from '@klasa/core';
import type { ContentDeliveryNetwork } from '@lib/structures/cdn/ContentDeliveryNetwork';
import { Time } from '@lib/types/enums';
import type { ContentNodeJSON } from '@lib/types/interfaces';
import type { FetchTypes } from '@lib/types/types';
import fetch, { RequestInit, Response } from 'node-fetch';
import AbortController from 'abort-controller';
import { TimerManager } from '@klasa/timer-manager';

export class ContentNode {

	public type: FetchTypes = 'json';

	public createdTimestamp: number = Date.now();

	public options: RequestInit = {};

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	#data: unknown = null;

	#timeout = Date.now() + (Time.Minute * 15);
	/* eslint-enable @typescript-eslint/explicit-member-accessibility */

	public constructor(public readonly store: ContentDeliveryNetwork, public readonly url: string) { }

	public get expired(): boolean {
		return Date.now() > this.#timeout && !this.fetching;
	}

	public get fetching(): boolean {
		return this.store.fetchMap.has(this);
	}

	public get createdAt(): Date {
		return new Date(this.createdTimestamp);
	}

	public get client(): Client {
		return this.store.client;
	}

	public fetch(force = this.#data === null): Promise<ContentNode> {
		const fetchStatus = this.store.fetchMap.get(this);
		if (!force && fetchStatus) return fetchStatus || Promise.resolve(this);

		const sync = ContentNode.fetch(this).then((data): this => {
			this.#data = data;
			this.#timeout = Date.now() + (Time.Minute * 15);
			return this;
		})
			.finally((): void => { this.store.fetchMap.delete(this); });

		this.store.fetchMap.set(this, sync);
		return sync;
	}

	public data<V>(): V | null {
		return this.#data as V ?? null;
	}

	public setType(type: FetchTypes = 'json'): this {
		this.type = type;
		return this;
	}

	public setOptions(options: RequestInit = {}): this {
		this.options = { ...this.options, ...options };
		return this;
	}

	public toString(): string {
		return `ContentNode(${this.url})`;
	}

	public toJSON(): ContentNodeJSON {
		return {
			url: this.url,
			createdAt: this.createdTimestamp,
			type: this.type,
			options: this.options
		};
	}

	private static async fetch(node: ContentNode): Promise<unknown> {
		const { url, options, type } = node;
		const controller = new AbortController();
		const timeout = TimerManager.setTimeout((): void => controller.abort(), 30000);
		const result: Response = await fetch(url, { ...options, signal: controller.signal })
			.finally((): void => TimerManager.clearTimeout(timeout));
		if (!result.ok) throw result.status;

		switch (type) {
			case 'result': return result;
			case 'buffer': return result.buffer();
			case 'json': return result.json();
			case 'text': return result.text();
			default: throw new TypeError(`Invalid fetch type ${type}`);
		}
	}

}
