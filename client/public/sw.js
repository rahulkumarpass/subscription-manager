// client/public/sw.js

console.log("Service Worker Loaded...");

self.addEventListener("push", e => {
    const data = e.data.json();
    console.log("Push Received...");

    // Standard System Notification Options
    const options = {
        body: data.body,
        icon: '/vite.svg', // Main icon (Replace with your app logo path)
        badge: '/vite.svg', // Small icon for Android Status Bar
        vibrate: [200, 100, 200], // Vibration pattern: Vibrate, Pause, Vibrate
        tag: 'sub-manager-notification', // Groups notifications together
        renotify: true, // Forces sound/vibration even if an old notification is visible
        data: {
            url: data.url || '/' // Where to go when clicked
        },
        // Actions (Optional: buttons inside the notification)
        actions: [
            { action: 'view', title: 'View Details' },
            { action: 'close', title: 'Close' }
        ]
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle Notification Click (Opens the App)
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Check if app is already open
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open a new window
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});