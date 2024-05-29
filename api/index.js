require("dotenv").config();
var cors = require("cors");
const express = require("express");
const { sql } = require("@vercel/postgres");
var multiparty = require("multiparty");
const { testVercelPostgres } = require("../helpers/test-vercel-postgres");
const { uploadFile, fileToBase64 } = require("../helpers/upload-file-to-vercel");
const { slackPostMessage } = require("../helpers/slack-integration");
const { sendMail } = require("../helpers/send-mail");
const { randomString } = require("../helpers/random-string");

const app = express();

app.use(cors());

app.post("/contact", async (req, res, next) => {
  try {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
      if (!fields.name || !fields.name.length || !fields.email || !fields.email.length) {
        return res.status(400).json({
          success: false,
          message: "You must fill in your email and name.",
        });
      }
      if (err) {
        next(err);
        return;
      }
      let fileUrl = '';
      let file;
      let base64data;
      const extensionFilters = ['image/jpeg', 'image/jpg', 'application/pdf'];
      const message = fields.message ? fields.message[0] : 'There are no messages to display';
      const name = fields.name[0];
      const email = fields.email[0];
      let type = fields.type ? fields.type[0] : 'contact';
      type = type[0].toUpperCase() + type.slice(1);
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please write correct email address.",
        });
      }
      try {
        if (files.attachment && files.attachment.length > 0) {
          const fileFromAttachemnt = files.attachment[0];
          if (fileFromAttachemnt.headers && !extensionFilters.includes(fileFromAttachemnt.headers['content-type'])) {
            return res.status(400).json({
              success: false,
              message: "Please select correct file format(.jpg, png, pdf).",
            });
          }
          base64data = await fileToBase64(fileFromAttachemnt);
          if (!base64data) {
            return res.status(400).json({
              success: false,
              message: "File upload failed.",
            });
          }
          file = await uploadFile(fileFromAttachemnt.originalFilename, base64data);
          if (!file) {
            return res.status(400).json({
              success: false,
              message: "File upload failed.",
            });
          }
          fileUrl = file.url
        }
        await sql`INSERT INTO contacts (name, email, message, attachment, type) VALUES (${name}, ${email}, ${message || ''}, ${fileUrl}, ${type});`;
        let presetMail = {
          from: `Otsulabs <${process.env.RESEND_EMAIL_FROM}>`,
          to: [process.env.RESEND_EMAIL_TO],
          reply_to: email,
          subject: `New ${type}`,
          html: `
            <p> From: ${name} </p>
            <p> Email: ${email} </p>
            <br></br>
            <span>${message}</span>
          `,
          tags: [
            {
              name: 'category',
              value: type,
            },
          ],
        }
        let presetSlack = {
          name,
          type,
          email,
          message,
        }
        if (fileUrl) {
          const filename = `${randomString()}-${file.pathname}`
          presetMail.attachments = [
            {
              filename,
              content: base64data,
            },
          ];
          presetSlack.attachment = fileUrl
        }
        sendMail(presetMail);
        await slackPostMessage(presetSlack);
      } catch (error) {
        console.log(error);
        res.status(400).json({
          success: false,
          message: `Fail to send ${type.toLowerCase()}.`,
        });
        return;
      }
      return res.json({
        success: true,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Fail to send form.",
    });
  }
});

app.listen(3000, async () => {
  await testVercelPostgres();
  console.log("Server ready on port 3000.");
});

module.exports = app;
