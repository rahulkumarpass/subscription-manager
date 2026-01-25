# Subscription Manager (MERN Stack)

A powerful, full-stack application to track, manage, and receive alerts for recurring subscriptions. Built with the MERN stack (MongoDB, Express, React, Node.js) and equipped with **real-time Push Notifications** and Email Alerts.

## ✨ Key Features

- **📊 Smart Dashboard:** View active subscriptions, total monthly costs, and upcoming due dates at a glance.
- **🔔 Push Notifications:** Cross-platform device notifications (Desktop & Mobile) with sound and vibration support.
- **📧 Email Alerts:** Automated email reminders sent via Nodemailer.
- **🌗 Dark/Light Mode:** Beautiful UI with instant theme toggling.
- **🔄 Smart Renewal:** "Mark as Paid" button automatically calculates the next due date based on billing cycles (Monthly/Yearly/Weekly).
- **📱 PWA Ready:** Installable on mobile devices with Service Worker support.
- **🔐 Secure Auth:** JWT-based authentication with Bcrypt password hashing.

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Vite, Lucide React (Icons)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Notifications:** Web-Push (Service Workers), Nodemailer, Node-Cron
- **State Management:** React Context API

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/subscription-manager.git](https://github.com/your-username/subscription-manager.git)
cd subscription-manager
```

```Run the App
Open two terminals:

Terminal 1 (Server):

Bash
cd server
npx nodemon server.js
Terminal 2 (Client):

Bash
cd client
npm run dev
The app will launch at http://localhost:5173.
```
