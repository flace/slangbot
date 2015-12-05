const Slackbots = require('slackbots');
const slackey = require('slackey');
const config = require('config');
const botToken = config.botToken;

const flashFunction = require('./flashFunction');
const celeronFunction = require('./celeronFunction');

module.exports = (app, redis) => {
  const bot = new Slackbots({
    token: botToken,
    name: 'flaceslang'
  });

  bot.on('start', () => {
    bot.on('message', data => {
      if (data.type === 'message' && data.subtype !== 'message_changed' && data.channel === config.channel) {
        let updatedMessage = getTrueMessage(data).trim();
        redis.get(data.user, (err, token) => {
          if (!err && token) {
            let APIClient = slackey.getAPIClient(token);
            if (updatedMessage !== data.text) {
              APIClient.send('chat.update', {
                ts: data.ts,
                token: token,
                channel: data.channel,
                text: updatedMessage
              }, errorHandler);
            }
          }
        });
      }
    });
  });
};

function getTrueMessage(data) {
  if (data.user === config.celeronId) {
    return celeronFunction(data.text);
  }
  if (data.user === config.flashId) {
    return flashFunction(data.text);
  }
  return data.text;
}

function errorHandler(err) {
  if (err) {
    console.error(err);
  }
}
