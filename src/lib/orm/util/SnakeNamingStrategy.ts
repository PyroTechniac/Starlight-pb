import { snakeCase } from '@orm/util/utils';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

	public tableName(className: string, customName: string): string {
		return customName ? customName : snakeCase(className);
	}

	public columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
		return `${snakeCase(embeddedPrefixes.join('_'))}${customName ? customName : snakeCase(propertyName)}`;
	}

	public relationName(propertyName: string): string {
		return snakeCase(propertyName);
	}

	public joinColumnName(relationName: string, referencedColumn: string): string {
		return snakeCase(`${relationName}_${referencedColumn}`);
	}

	public joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string): string {
		return snakeCase(`${firstTableName}_${firstPropertyName.replace(/\./gi, '_')}_${secondTableName}`);
	}

	public joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
		return snakeCase(`${tableName}_${columnName ? columnName : propertyName}`);
	}

	public classTableInheritanceParentColumnName(parentTableName: string, parentTableIdPropertyName: string): string {
		return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
	}

	public eagerJoinRelationAlias(alias: string, propertyPath: string): string {
		return `${alias}__${propertyPath.replace('.', '_')}`;
	}

}
