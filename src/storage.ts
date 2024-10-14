import { useUserStore } from "@/stores/user";
import { computed, ref, WritableComputedRef } from "vue";

export interface Serializer<T> {
	read: (raw: string) => T
	write: (value: T) => string
}

export const StorageSerializers: Record<'boolean' | 'object' | 'number' | 'any' | 'string' | 'map' | 'set' | 'date', Serializer<any>> = {
	boolean: {
		read: (v: any) => v === 'true',
		write: (v: any) => String(v),
	},
	object: {
		read: (v: any) => JSON.parse(v),
		write: (v: any) => JSON.stringify(v),
	},
	number: {
		read: (v: any) => Number.parseFloat(v),
		write: (v: any) => String(v),
	},
	any: {
		read: (v: any) => v,
		write: (v: any) => String(v),
	},
	string: {
		read: (v: any) => v,
		write: (v: any) => String(v),
	},
	map: {
		read: (v: any) => new Map(JSON.parse(v)),
		write: (v: any) => JSON.stringify(Array.from((v as Map<any, any>).entries())),
	},
	set: {
		read: (v: any) => new Set(JSON.parse(v)),
		write: (v: any) => JSON.stringify(Array.from(v as Set<any>)),
	},
	date: {
		read: (v: any) => new Date(v),
		write: (v: any) => v.toISOString(),
	},
}

export function guessSerializerType<T>(rawInit: T) {
	return rawInit == null
		? 'any'
		: rawInit instanceof Set
			? 'set'
			: rawInit instanceof Map
				? 'map'
				: rawInit instanceof Date
					? 'date'
					: typeof rawInit === 'boolean'
						? 'boolean'
						: typeof rawInit === 'string'
							? 'string'
							: typeof rawInit === 'object'
								? 'object'
								: !Number.isNaN(rawInit)
									? 'number'
									: 'any'
}

function read<T>(key: string, defaultValue: T, serializer: Serializer<any>): T {
	const rawValue = localStorage.getItem(key);
	if (rawValue == null) {
		return defaultValue;
	} else {
		return serializer.read(rawValue);
	}
}

function write<T>(key: string, value: T, serializer: Serializer<any>) {
	const serialized = serializer.write(value);
	try {
		localStorage.setItem(key, serialized);
		return true;
	} catch (e) {
		console.log(`Could not write '${key}' to local storage`);
		return false;
	}
}

export function useUserStorage<T>(key: string, defaultValue: T): WritableComputedRef<T> {
	const type = guessSerializerType<T>(defaultValue);
	const serializer = StorageSerializers[type];
	const user = useUserStore();

	const asRef = ref(defaultValue);

	const getter = () => {
		if (!user.name) {
			return defaultValue;
		}
		asRef.value;
		return read(`${user.name}.${key}`, defaultValue, serializer);
	};

	const setter = (value: T) => {
		if (!user.name) {
			return;
		}
		write(`${user.name}.${key}`, value, serializer);
		asRef.value = value;
	};

	return computed({
		get: getter,
		set: setter,
	});
}

export function loadUserValue<T>(key: string, defaultValue: T): T {
	const user = useUserStore();
	if (!user.name) {
		return defaultValue;
	}
	const type = guessSerializerType<T>(defaultValue);
	const serializer = StorageSerializers[type];
	return read(`${user.name}.${key}`, defaultValue, serializer);
}

export function saveUserValue<T>(key: string, value: T) {
	const user = useUserStore();
	if (!user.name) {
		return false;
	}
	const type = guessSerializerType<T>(value);
	const serializer = StorageSerializers[type];
	return write(`${user.name}.${key}`, value, serializer);
}
