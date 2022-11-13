import { useUserStore } from "@/stores/user";

export function saveForAnyUser(key: string, value: any): boolean {
	if (value == null || value == undefined) {
		localStorage.removeItem(key);
		return true;
	}
	if (typeof value == "object") {
		value = JSON.stringify(value);
	}
	try {
		localStorage[key] = value;
		return true;
	} catch (e) {
		console.log("Could not write to local storage: " + key);
		return false;
	}
}

export function loadForAnyUser(key: string): any {
	let value = localStorage[key];
	if (value && value[0] == "[") {
		value = JSON.parse(value);
	}
	return value;
}

export function saveForCurrentUser(key: string, value: any): boolean {
	const user = useUserStore();
	if (!user.name) {
		return false;
	}
	return saveForAnyUser(user.name + "." + key, value);
}

export function loadForCurrentUser(key: string): any {
	const user = useUserStore();
	if (!user.name) {
		return;
	}
	return loadForAnyUser(user.name + "." + key);
}
