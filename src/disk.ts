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
		return undefined;
	}
	return loadForAnyUser(user.name + "." + key);
}

export function compress(string: string): Promise<ArrayBuffer> {
	const byteArray = new TextEncoder().encode(string);
	const cs = new CompressionStream("gzip");
	const writer = cs.writable.getWriter();
	writer.write(byteArray);
	writer.close();
	return new Response(cs.readable).arrayBuffer();
}

export function decompress(byteArray: Uint8Array): Promise<string> {
	const cs: DecompressionStream = new DecompressionStream("gzip");
	const writer = cs.writable.getWriter();
	writer.write(byteArray);
	writer.close();
	return new Response(cs.readable).arrayBuffer().then((arrayBuffer) => new TextDecoder().decode(arrayBuffer));
}
