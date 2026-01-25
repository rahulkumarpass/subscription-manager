const cron = require('node-cron');
const webpush = require('web-push');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const sendEmail = require('../utils/emailSender');

const checkDueBills = () => {
  // 1. Load Keys Safely (Inside function ensures .env is loaded first)
  webpush.setVapidDetails(
    process.env.MAILTO_ADDRESS,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // 2. Schedule: Run EVERY MINUTE to support exact times like 8:15
  cron.schedule('* * * * *', async () => {
    // console.log('--- CRON: Checking... ---'); // Uncomment for debugging

    try {
      const now = new Date();

      // 3. Get exact time string (HH:MM) e.g., "08:15", "14:05"
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      // 4. SMART QUERY: Get ONLY subscriptions that want an alert at this exact minute
      const matchingSubs = await Subscription.find({
        "reminderSettings.preferredTimes": currentTime
      }).populate('user');

      // If no one wants an alert right now, stop here.
      if (matchingSubs.length === 0) return;

      console.log(`Found ${matchingSubs.length} reminders for ${currentTime}`);

      for (const sub of matchingSubs) {
        if (!sub.user) continue;

        const daysBefore = sub.reminderSettings?.daysBefore || 3;

        // Calculate Days Until Due
        const due = new Date(sub.nextPaymentDate);
        const today = new Date();
        due.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

        // 5. Check if it's the right day to send the alert
        if (diffDays >= 0 && diffDays <= daysBefore) {
          console.log(`>>> Sending alert for ${sub.name} (Due in ${diffDays} days)`);

          // A. Send Email
          await sendEmail({
            email: sub.user.email,
            subject: `Bill Due: ${sub.name}`,
            message: `Your ${sub.name} is due in ${diffDays} days.`
          });

          // B. Send Push Notification
          const payload = JSON.stringify({
            title: `Upcoming Bill: ${sub.name}`,
            body: `Amount: ₹${sub.price} is due in ${diffDays} days!`,
            icon: '/vite.svg'
          });

          const user = await User.findById(sub.user._id);

          // Send to all registered devices (Phone, Laptop, etc.)
          if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
            user.pushSubscriptions.forEach(subEndpoint => {
              webpush.sendNotification(subEndpoint, payload).catch(err => {
                // Silent catch: User might have closed browser or revoked permission
                if (err.statusCode === 410) {
                  console.log("Device subscription expired.");
                } else {
                  console.error("Push Error:", err.statusCode);
                }
              });
            });
          }
        }
      }
    } catch (error) {
      console.error('Cron Error:', error);
    }
  });
};

module.exports = checkDueBills;