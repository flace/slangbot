const slackey = require('slackey');
const config = require('config');

module.exports = (app, redis) => {
  app.get('/slack/auth/callback', auth);

  function auth(req, res) {
    let code = req.query.code;

    let slackOAuthClient = slackey.getOAuthClient({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      authRedirectURI: config.callbackUrl
    });

    slackOAuthClient.getToken(code, (err, response) => {
      if (err) {
        console.log(err);
      }
      let token = response.access_token;
      let slackAPIClient = slackey.getAPIClient(token);
      slackAPIClient.send('auth.test', (err, response) => {
        if (err) {
          console.log(err);
        }
        redis.set(response.user_id, token);
        res.redirect(`/slack/hello?u=${response.user}`);
      });
    });
  };
};
