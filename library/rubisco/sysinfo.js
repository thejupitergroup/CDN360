const SysInfo = (function() {
    function language() {
        return navigator.language || navigator.userLanguage;
    }

    function browserName() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('arora')) return 'Arora';
        if (userAgent.includes('chrome')) return 'Google Chrome';
        if (userAgent.includes('edge')) return 'Microsoft Edge';
        if (userAgent.includes('epiphany')) return 'Epiphany';
        if (userAgent.includes('firefox')) return 'Mozilla Firefox';
        if (userAgent.includes('maxathon')) return 'Maxathon';
        if (userAgent.includes('midori')) return 'Midori';
        if (userAgent.includes('opera') && !userAgent.includes('opr')) return 'Opera';
        if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari';
        if (userAgent.includes('trident') || userAgent.includes('msie')) return 'Internet Explorer';
        if (userAgent.includes('yandex') || userAgent.includes('yabrowser')) return 'Yandex';
        if (userAgent.includes('vivaldi')) return 'Vivaldi';
        return 'Unidentified Browser';
    }

    function browserVersion() {
        const userAgent = navigator.userAgent.toLowerCase();
        let version = 'Unknown Version';
        const match = userAgent.match(/(arora|chrome|edge|epiphany|firefox|maxathon|midori|opera|opr|safari|trident|yandex|vivaldi)[\/\s]?([\d.]+)/);
        if (match && match.length > 2) {
            version = match[2];
        }

        return version;
    }

    function deviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mobile|android|iphone|ipad|ipod/.test(userAgent)) {
            return 'Mobile';
        } else if (/tablet/.test(userAgent)) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }

    function screenResolution() {
        return {
            width: window.screen.width,
            height: window.screen.height
        };
    }

    function colorDepth() {
        return window.screen.colorDepth;
    }

    function timezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    function memory() {
        return navigator.deviceMemory || 'Unknown';
    }

    function cores() {
        return navigator.hardwareConcurrency || 'Unknown';
    }

    function onlineStatus() {
        return navigator.onLine ? 'Online' : 'Offline';
    }

    function doNotTrack() {
        return navigator.doNotTrack || navigator.msDoNotTrack || 'Unknown';
    }

    function cookies() {
        return navigator.cookieEnabled;
    }

    function touchSupport() {
        return {
            maxTouchPoints: navigator.maxTouchPoints || 0,
            touchEvent: 'ontouchstart' in window || navigator.msMaxTouchPoints > 0
        };
    }

    function mediaDevices(callback) {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                callback(devices.map(device => ({
                    kind: device.kind,
                    label: device.label,
                    deviceId: device.deviceId
                })));
            }).catch(() => callback([]));
        } else {
            callback([]);
        }
    }

    function clipboard(callback) {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'clipboard-read' })
                .then(result => callback({ state: result.state }))
                .catch(() => callback({ error: 'Permission check failed.' }));
        } else {
            callback({ error: 'Permissions API not supported.' });
        }
    }

    function userAgent() {
        return navigator.userAgent;
    }

    function pageVisibility() {
        return document.visibilityState || 'Unknown';
    }

    function ipAddress(callback) {
        const pc = new (window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection)({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/g;

        let ipAddress = null;

        pc.createDataChannel('');
        pc.createOffer()
            .then(offer => pc.setLocalDescription(offer))
            .catch(err => console.error("Error creating offer:", err));

        pc.onicecandidate = function(event) {
            if (event.candidate && event.candidate.candidate) {
                const ip = event.candidate.candidate.match(ipRegex);
                if (ip) {
                    ipAddress = ip[0];
                    pc.close();
                    if (callback) {
                        callback(ipAddress);
                    }
                }
            }
        };

        setTimeout(() => {
            if (!ipAddress && callback) {
                callback(null);
            }
        }, 1000);
    }

    function location(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                callback({ latitude, longitude });
            }, () => {
                callback({ error: 'Location access denied!' });
            });
        } else {
            callback({ error: 'Geolocation is not supported.' });
        }
    }

    function battery(callback) {
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                callback({
                    charging: battery.charging,
                    level: battery.level * 100,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime
                });
            });
        } else {
            callback({ error: 'Battery status not supported.' });
        }
    }

    function network() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                downlink: connection.downlink,
                effectiveType: connection.effectiveType,
                rtt: connection.rtt,
                saveData: connection.saveData,
            };
        }
        return { error: 'Network information not supported.' };
    }

    // REMOVED API ENDPOINTS
    function osName() {
        let osName = "Unknown OS";
        const platform = navigator.platform.toLowerCase();
        const userAgent = navigator.userAgent.toLowerCase();

        if (platform.includes('win')) {
            osName = 'Microsoft Windows';
        } else if (platform.includes('mac')) {
            osName = 'MacOS';
        } else if (platform.includes('linux')) {
            osName = 'Linux';
        } else if (/android/.test(userAgent)) {
            osName = 'Android';
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
            osName = 'iOS';
        }
        return osName;
    }

    function javascript() {
        return true;
    }

    function platform() {
        return navigator.platform;
    }

    return {
        language,
        browserName,
        browserVersion,
        deviceType,
        screenResolution,
        colorDepth,
        timezone,
        memory,
        cores,
        onlineStatus,
        doNotTrack,
        cookies,
        touchSupport,
        mediaDevices,
        clipboard,
        userAgent,
        pageVisibility,
        ipAddress,
        location,
        battery,
        network,

        // REMOVED API ENDPOINTS
        osName,
        platform,
        javascript,
    };

})();

export default SysInfo;