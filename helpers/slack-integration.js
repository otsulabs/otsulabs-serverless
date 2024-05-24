require("dotenv").config();
const { WebClient } = require("@slack/web-api");
const bot = new WebClient(process.env.SLACK_TOKEN || 'xoxb-4821072139254-5684536683809-KKR4PbIOKSvGsjw64XbzSsnq');

async function slackPostMessage(data) {
  let type = data.type || 'contact'
  type = type[0].toUpperCase() + type.slice(1)
  try {
    return await bot.files.uploadV2({
      file: data.url,
      filename: data.pathname,
      channel_id: process.env.SLACK_CHANNEL || 'C04UNAMF2BZ',
      initial_comment: `
  ==============*New ${type}*=================
  
  Name: ${data.name}
  Email: ${data.email}
  ==================Message===================
  ${data.message}
  ====================End=====================
          `,
    });
  } catch (error) {
    throw Error('Slack notification failed');
  }
}

module.exports = { slackPostMessage };
