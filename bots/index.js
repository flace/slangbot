const Slackbots = require('slackbots');
const slackey = require('slackey');
const config = require('config');
const botToken = process.env.botToken || config.botToken;
const slackToken = process.env.slackToken || config.slackToken;

// const flashFunction = require('./flashFunction');
const celeronFunction = require('./celeronFunction');

module.exports = app => {
  const bot = new Slackbots({
    token: botToken,
    name: 'flaceslang'
  });
  const APIClient = slackey.getAPIClient(slackToken);

  bot.on('start', () => {
    bot.on('message', data => {
      if (data.type === 'message' && data.subtype !== 'message_changed') {
        let updatedMessage = getTrueMessage(data).trim();
        if (updatedMessage !== data.text) {
          APIClient.send('chat.update', {
            ts: data.ts,
            token: slackToken,
            channel: data.channel,
            text: updatedMessage
          }, errorHandler);
        }
      }
    });
  });
};

function getTrueMessage(data) {
  // if (data.user === config.celeronId) {
  return celeronFunction(data.text);
  // }
  // if (data.user === config.flashId) {
  //   return celeronFunction(data.text);
  // }
  // return data.text;
}

function errorHandler(err) {
  if (err) {
    console.error(err);
  }
}
