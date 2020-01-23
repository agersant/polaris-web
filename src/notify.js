var notify = (function() {

	var recentThreshold = 5000; // in ms
	var maxRecentNotifications = 1;
	var recentNotificationTimes = [];

	var areWeSpammy = function() {
		var now = Date.now();
		recentNotificationTimes = recentNotificationTimes.filter(function(t){ return (now - t) < recentThreshold });
		return recentNotificationTimes.length >= maxRecentNotifications;
	};

	var spawned = function() {
		recentNotificationTimes.push(Date.now());
	};

	var requestedPermission = false;
	var requestPermissionAndThen = function(callback) {
		if (requestedPermission) {
			// Extra notifications while request is pending, drop
			return;
		}
		requestedPermission = true;
		Notification.requestPermission(function(permission) {
			if (permission === "granted") {
				callback();
			}
		});
	};

	var spawn = function(title, icon, body) {

		if (!("Notification" in window)) {
			return;
		}

		if (Notification.permission === "default") {
			return requestPermissionAndThen(function(){ spawn(title, body); });
		}

		if (areWeSpammy()) {
			console.log("Ignored spammy notification: " + body);
			return;
		}

		var options = { body: body, };
		if (icon) {
			options.icon = icon;
		}
		new Notification(title, options);

		spawned();
	}

	return {
		spawn: spawn,
	} 

})();
