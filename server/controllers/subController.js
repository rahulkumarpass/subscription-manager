const Subscription = require('../models/Subscription');

// @desc    Get all subscriptions for the logged-in user
// @route   GET /api/subscriptions
const getSubscriptions = async (req, res) => {
    try {
        const subs = await Subscription.find({ user: req.user.id });
        res.status(200).json(subs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new subscription
// @route   POST /api/subscriptions
const addSubscription = async (req, res) => { // Renamed from createSubscription to match Routes
    const {
        name, price, category, billingCycle, startDate,
        customDays, nextPaymentDate,
        reminderDaysBefore, reminderFrequency, reminderTimes
    } = req.body;

    try {
        let nextDate;
        if (nextPaymentDate) {
            nextDate = new Date(nextPaymentDate);
        } else {
            nextDate = new Date(startDate);
            if (billingCycle === 'Monthly') nextDate.setMonth(nextDate.getMonth() + 1);
            else if (billingCycle === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
            else if (billingCycle === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
        }

        const sub = await Subscription.create({
            user: req.user.id,
            name,
            price,
            category,
            billingCycle: customDays ? `${customDays} Days` : billingCycle,
            startDate,
            nextPaymentDate: nextDate,
            reminderSettings: {
                daysBefore: Number(reminderDaysBefore) || 3,
                frequency: Number(reminderFrequency) || 1,
                preferredTimes: reminderTimes || ["09:00"]
            }
        });

        res.status(201).json(sub);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
const deleteSubscription = async (req, res) => {
    try {
        const sub = await Subscription.findById(req.params.id);

        if (!sub) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (sub.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await sub.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a subscription (NEW FEATURE)
// @route   PUT /api/subscriptions/:id
const updateSubscription = async (req, res) => {
    try {
        const sub = await Subscription.findById(req.params.id);

        if (!sub) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Check user ownership
        if (sub.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Update the subscription
        const updatedSub = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // Return the updated document
        );

        res.status(200).json(updatedSub);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSubscriptions,
    addSubscription, // This matches the import in your routes file
    deleteSubscription,
    updateSubscription, // Added the new function here
};