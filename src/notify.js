const recentThreshold = 5000; // in ms
const maxRecentNotifications = 1;
let recentNotificationTimes = [];

let areWeSpammy = function() {
	const now = Date.now();
	recentNotificationTimes = recentNotificationTimes.filter(function(t) { return (now - t) < recentThreshold });
	return recentNotificationTimes.length >= maxRecentNotifications;
};


let requestedPermission = false;
let requestPermissionAndThen = function(callback) {
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
};

export default function(title, icon, body) {

	if (!("Notification" in window)) {
		return;
	}

	if (Notification.permission === "default") {
		return requestPermissionAndThen(() => spawn(title, body));
	}

	if (areWeSpammy()) {
		console.log("Ignored spammy notification: " + body);
		return;
	}

	let options = { body: body, };
	if (icon) {
		options.icon = icon;
	}
	new Notification(title, options);

	recentNotificationTimes.push(Date.now());
}

