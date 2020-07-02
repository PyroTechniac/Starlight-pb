export function camelCase(str: string): string {
	return pascalOrCamelCase(str, false);
}

export function snakeCase(str: string): string {
	return str.replace(/(?:([a-z])([A-Z]))|(?:((?!^)[A-Z])([a-z]))/g, '$1_$3$2$4').toLowerCase();
}

export function pascalCase(str: string): string {
	return pascalOrCamelCase(str, true);
}

export function titleCase(str: string): string {
	return str.replace(/\w\S*/g, (txt): string => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function pascalOrCamelCase(str: string, pascal: boolean): string {
	return str.replace(/^([A-Z])|[\s-_](\w)/g, (match, p1, p2, offset): string => {
		if (pascal && offset === 0) return p1;
		return p2 ? p2.toUpperCase() : p1.toLowerCase();
	});
}
