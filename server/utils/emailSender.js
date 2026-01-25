const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

    // 1. Create Transporter (Using Real Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Reads from .env
            pass: process.env.EMAIL_PASS, // Reads from .env
        },
    });

    // 2. Define Email Options (Beautiful HTML Design)
    const mailOptions = {
        from: `"SubManager Alert" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message, // Plain text version
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #4f46e5; margin-top: 0;">🔔 Bill Reminder</h2>
                <p style="font-size: 16px; color: #374151; line-height: 1.5;">
                    ${options.message}
                </p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #9ca3af;">
                    Sent automatically by your SubManager App.
                </p>
            </div>
        </div>
        `,
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent successfully to ${options.email}`);
};

module.exports = sendEmail;