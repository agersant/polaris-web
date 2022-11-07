const recentThreshold = 5000; // in ms
const maxRecentNotifications = 1;
let recentNotificationTimes: number[] = [];

let areWeSpammy = function () {
	const now = Date.now();
	recentNotificationTimes = recentNotificationTimes.filter(function (t) {
		return now - t < recentThreshold;
	});
	return recentNotificationTimes.length >= maxRecentNotifications;
};

let requestedPermission = false;
function requestPermissionAndThen(callback: () => void) {
	if (requestedPermission) {
		// Extra notifications while request is pending, drop
		return;
	}
	requestedPermission = true;
	Notification.requestPermission(permission => {
		if (permission === "granted") {
			callback();
		}
	});
}

export default async function (title: string, icon: string | null, body: string) {
	if (!("Notification" in window)) {
		return;
	}

	if (Notification.permission === "default") {
		if (requestedPermission) {
			return;
		}
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			return;
		}
	}

	if (areWeSpammy()) {
		console.log("Ignored spammy notification: " + body);
		return;
	}

	new Notification(title, { icon: icon || undefined, body: body });
	recentNotificationTimes.push(Date.now());
}
