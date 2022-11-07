import { useUserStore } from "@/stores/user";

export function save(key: string, value: any) {
	const user = useUserStore();
	if (!user.name) {
		return;
	}
	if (value == null || value == undefined) {
		localStorage.removeItem(user.name + "." + key);
		return true;
	}
	if (typeof value == "object") {
		value = JSON.stringify(value);
	}
	try {
		localStorage[user.name + "." + key] = value;
		return true;
	} catch (e) {
		console.log("Could not write to local storage: " + key);
		return false;
	}
}

export function load(key: string): any {
	const user = useUserStore();
	if (!user.name) {
		return;
	}
	let value = localStorage[user.name + "." + key];
	if (value && value[0] == "[") {
		value = JSON.parse(value);
	}
	return value;
}
