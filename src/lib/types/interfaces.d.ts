import type { Message } from '@klasa/core';
import type { File } from '@klasa/rest';
import type { Command, Possible } from 'klasa';

export interface FileResolvable {
	resolve(): Promise<File>;
}

// Don't include editSettings (even though every conf command has one) because it's an implementation detail
export interface ConfCommand extends Command {
	show(message: Message, [key]: [string]): Promise<Message[]>;
	set(message: Message, [key, valueToSet]: [string, unknown]): Promise<Message[]>;
	remove(message: Message, [key, valueToRemove]: [string, unknown]): Promise<Message[]>;
	reset(message: Message, [key]: [string]): Promise<Message[]>;
}

export interface CustomArgResolver {
	(arg: any, possible: Possible, message: Message, args: any[]): any;
}
