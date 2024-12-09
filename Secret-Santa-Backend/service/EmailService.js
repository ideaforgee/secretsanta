const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email to the user with their Secret Santa game code.
 *
 * @param {Object} user - The user object containing name and email.
 * @param {string} gameCode - The Secret Santa game code.
 */
const sendCreatedSecretSantaGameEmail = async (user, gameCode) => {
  const emailSubject = "🎅🎄 Your Secret Santa Game Code is Here! 🎁✨";
  const emailBody = await loadTemplate("secretSantaGameEmail.html", { name: user.name, gameCode });
  await sendEmail(user.email, emailSubject, emailBody);
}

/**
 * Sends an email to each shuffled user with details about who they are the Secret Santa for.
 *
 * @param {Array} shuffledUsers - Array of user objects where each user has a name, email, and a giftNinja (assigned Secret Santa).
 */
const sendAssignedSecretSantaEmail = async (shuffledUsers) => {
  for (const user of shuffledUsers) {
    const { name, email, secretSanta } = user;
    const emailSubject = `🎅 You are a Secret Santa 🎄`;
    const emailBody = await loadTemplate("assignedSecretSantaEmail.html", { name: secretSanta?.name, santaFor: name });
    await sendEmail(secretSanta?.email, emailSubject, emailBody);
  }
}

const sendSecretSantaSentMessageEmail = async (user, reverserChatBoxType) => {
  const { name, email } = user;
  const target = reverserChatBoxType === 'secretSanta' ? 'Secret Santa' : 'Gift Ninja';
  const emailSubject = `🕵️ Your Secret Gift Awaits!`;
  const emailBody = await loadTemplate("secretSantaMessageEmail.html", { name, target });
  await sendEmail(email, emailSubject, emailBody);
}

/**
 * Sends an email with the specified subject and HTML content.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} emailSubject - The subject line of the email.
 * @param {string} emailHTML - The HTML content of the email.
 */
async function sendEmail(email, emailSubject, emailHTML) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: emailSubject,
    html: emailHTML
  });
}

/**
 * Loads an email template from the 'templates' folder and replaces placeholders with actual data.
 *
 * @param {string} templateName - The name of the template file to load (e.g., "secretSantaGameEmail.html").
 * @param {Object} data - An object containing data to replace placeholders in the template.
 * @returns {string} - The HTML content of the template with the placeholders replaced by actual data.
 */
async function loadTemplate(templateName, data) {
  const filePath = path.join(__dirname, 'templates', templateName);
  let template = fs.readFileSync(filePath, 'utf-8');

  for (const key in data) {
    const placeholder = `{{${key}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), data[key]);
  }

  return template;
}

module.exports = {
  sendCreatedSecretSantaGameEmail,
  sendAssignedSecretSantaEmail,
  sendSecretSantaSentMessageEmail,
  sendEmail
};
