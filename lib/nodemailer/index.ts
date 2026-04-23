import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE, RESET_PASSWORD_EMAIL_TEMPLATE } from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
});

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Stockolio" <sample@gmail.com>`,
        to: email,
        subject: 'Welcome to Stockolio',
        text: 'Thanks for joining Stockolio',
        html: htmlTemplate,
    };
    await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({ email, date, newsContent }: { email: string; date: string; newsContent: string }) => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Stockolio News" <stockolio@gmail.com>`,
        to: email,
        subject: `📈 Market News Summary Today – ${date}`,
        text: `Today's market news summary from Stockolio`,
        html: htmlTemplate,
    };
    await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async ({ email, url }: { email: string; url: string }) => {
    const htmlTemplate = RESET_PASSWORD_EMAIL_TEMPLATE.replace('{{resetUrl}}', url);

    const mailOptions = {
        from: `"Stockolio Security" <stockolio@gmail.com>`,
        to: email,
        subject: 'Reset Your Stockolio Password',
        text: `Click this link to reset your password: ${url}`,
        html: htmlTemplate,
    };
    await transporter.sendMail(mailOptions);
};
