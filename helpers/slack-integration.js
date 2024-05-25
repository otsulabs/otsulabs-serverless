require("dotenv").config();
const { WebClient } = require("@slack/web-api");
const bot = new WebClient(process.env.SLACK_TOKEN);

async function slackPostMessageWithAttechment(data) {
  console.log("========================Preset data====================", data)
  try {
    return await bot.files.uploadV2({
      file: data.url,
      filename: data.pathname,
      channel_id: process.env.SLACK_CHANNEL,
      initial_comment: `
  ==============*New ${data.type}*=================
  
  Name: ${data.name}
  Email: ${data.email}
  ==================Message===================
  ${data.message}
  ====================End=====================
          `,
    });
  } catch (error) {
    console.log(error)
    throw Error('Slack notification failed');
  }
}

async function slackPostMessage(data) {
  console.log("========================Preset Slack data====================", data)
  try {
    return await bot.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: `
  ==============*New ${data.type}*=================
  
  Name: ${data.name}
  Email: ${data.email}
  ==================Message===================
  ${data.message || 'There are no messages to display'}
  =================Attachment=================
  ${data.attachment || 'There are no attachments'}
  ====================End=====================
          `,
    });
  } catch (error) {
    console.log(error)
    throw Error('Slack notification failed');
  }
}

module.exports = { slackPostMessage, slackPostMessageWithAttechment };
