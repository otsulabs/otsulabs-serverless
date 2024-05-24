require("dotenv").config();
var cors = require("cors");
const express = require("express");
const { sql } = require("@vercel/postgres");
var multiparty = require("multiparty");
const { testVercelPostgres } = require("../helpers/test-vercel-postgres");
const { uploadFile, fileToBase64 } = require("../helpers/upload-file-to-vercel");
const { sendMail } = require("../helpers/send-mail");

const app = express();

app.use(cors());

app.post("/contact", async (req, res, next) => {
  try {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
      if (!fields.name || !fields.email) {
        res.status(400).json({
          success: false,
          message: "You must fill in your email and name.",
        });
      }
      if (err) {
        next(err);
        return;
      }
      try {
        const base64data = await fileToBase64(files.attachment[0]);
        if (!base64data) {
          res.status(400).json({
            success: false,
            message: "File upload failed.",
          });
        }
        const file = await uploadFile(files.attachment[0].originalFilename, base64data);
        if (!file) {
          res.status(400).json({
            success: false,
            message: "File upload failed.",
          });
        }
        await sql`INSERT INTO contacts (name, email, message, attachment, type) VALUES (${fields.name}, ${fields.email}, ${fields.message || ''}, ${file.url}, ${fields.type || 'contact'});`;
        const data = {
          from: `Otsulabs <${process.env.RESEND_EMAIL_FROM}>`,
          to: [process.env.RESEND_EMAIL_TO],
          reply_to: fields.email,
          subject: `New ${fields.type || 'contact'}`,
          html: `
            <p>Message:</p>
            <br></br>
            <span>${fields.message}</span>
          `,
          attachments: [
            {
              filename: file.pathname,
              content: base64data,
            },
          ],
          tags: [
            {
              name: 'category',
              value: `${fields.type || 'contact'}`,
            },
          ],
        }
        await sendMail(data);
      } catch (error) {
        console.log(error);
        next(err);
        return;
      }
      res.json({
        success: true,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Fail to send contact");
  }
});

app.listen(2000, async () => {
  await testVercelPostgres();
  console.log("Server ready on port 2000.");
});

module.exports = app;
