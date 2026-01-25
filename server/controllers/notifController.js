const User = require('../models/User');
const webpush = require('web-push');

// 1. CONFIGURE WEB PUSH
// Ideally, these should be in your .env file
const publicVapidKey = 'BA19u_muixCKT_o0sRVXC7Uo5mjEHFbVpi-LBq6JAxZ8wU9J3h9_o2pZHTZ6YdRVuElFpBakqvV9Kuwoz8yAStw';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

// 2. SUBSCRIBE USER (Save keys to DB)
const subscribeUser = async (req, res) => {
  try {
    const subscription = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { pushSubscriptions: subscription }
    });

    res.status(201).json({ message: 'Device Subscribed!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. SEND TEST NOTIFICATION (With Auto-Cleanup)
const sendTestNotification = async (req, res) => {
  try {
    // Find the user
    const user = await User.findById(req.user.id);

    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return res.status(400).json({ message: 'No subscription found. Enable Alerts first!' });
    }

    // The Payload
    const payload = JSON.stringify({
      title: `Hello ${user.username || 'User'}! 👋`,
      body: "This is a test notification with Sound & Vibration!",
      url: "http://localhost:5173",
    });

    // Send to ALL devices & Clean up dead ones
    const notifications = user.pushSubscriptions.map(sub =>
      webpush.sendNotification(sub, payload)
        .catch(async err => {
          // --- THE FIX IS HERE ---
          // If the subscription is expired (410) or not found (404), remove it.
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log(`Cleaning up expired subscription: ${sub.endpoint}`);
            await User.findByIdAndUpdate(user._id, {
              $pull: { pushSubscriptions: { endpoint: sub.endpoint } }
            });
          } else {
            console.error("Push Error:", err);
          }
        })
    );

    await Promise.all(notifications);

    res.status(200).json({ message: 'Notification Sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
};

module.exports = { subscribeUser, sendTestNotification };