let SlackBot = require('slackbots');

let bot = new SlackBot({
	token: 'xoxb-15357276705-BHKGlH2TsaS7ajEFi6bg0F7t',
	name: 'flaceslang'
});

bot.on('start', () => {
	bot.on('message', data => {
		var params = {
			icon_emoji: ':cat:'
		};
		if (data.type === 'message' && data.channel === 'C0FAZ2LKE' && data.subtype !== 'bot_message') {
			let text = data.text;
			let newText = text.split('').reverse().join('');
			bot.postMessageToChannel('slang', newText, params);
		}
	})
});

