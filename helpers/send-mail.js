require("dotenv").config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail(mailObject) {
  return await new Promise(async (resolve, reject) => {
    const { data, error } = await resend.emails.send(mailObject);
    if (error) {
      return reject(error)
    }
    return resolve(data)
  });
}

module.exports = { sendMail };
