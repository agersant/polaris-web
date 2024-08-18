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

export default async function (title: string, icon: string | null, body: string) {
	if (!("Notification" in window)) {
		return;
	}

	if (Notification.permission === "default") {
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
