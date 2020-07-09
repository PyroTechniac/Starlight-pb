import { EntitySubscriberInterface, EventSubscriber, InsertEvent, ObjectLiteral, UpdateEvent } from "typeorm";
import {validate} from 'class-validator';

@EventSubscriber()
export class Validator implements EntitySubscriberInterface {
	public async beforeInsert(event: InsertEvent<any>): Promise<void> {
		await this.validate(event.entity);
	}

	public async beforeUpdate(event: UpdateEvent<any>): Promise<void> {
		await this.validate(event.entity);
	}

	private async validate(entity: ObjectLiteral): Promise<void> {
		await validate(entity);
	}
}
