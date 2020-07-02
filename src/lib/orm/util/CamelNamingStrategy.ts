import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { camelCase } from '@orm/util/utils';

export class CamelNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

	public tableName(className: string, customName: string): string {
		return customName ? customName : camelCase(className);
	}

	public columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
		return `${camelCase(embeddedPrefixes.join(' '))}${customName ? customName : camelCase(propertyName)}`;
	}

	public relationName(propertyName: string): string {
		return camelCase(propertyName);
	}

	public joinColumnName(relationName: string, referencedColumn: string): string {
		return camelCase(`${relationName} ${referencedColumn}`);
	}

	public joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string): string {
		return camelCase(`${firstTableName} ${firstPropertyName.replace(/\./gi, ' ')} ${secondTableName}`);
	}

	public joinTableColumnName(tableName: string, propertyName: string, columnName?: string): string {
		return camelCase(`${tableName} ${columnName ? columnName : propertyName}`);
	}

	public classTableInheritanceParentColumnName(parentTableName: string, parentTableIdPropertyName: string): string {
		return camelCase(`${parentTableName} ${parentTableIdPropertyName}`);
	}

	public eagerJoinRelationAlias(alias: string, propertyPath: string): string {
		return `${alias}  ${propertyPath.replace('.', ' ')}`;
	}

}
