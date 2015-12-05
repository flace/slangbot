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

    slackOAuthClient.getToken(code, (err, resp) => {
      if (err) {
        console.log(err);
      }
      let token = resp.access_token;
      let slackAPIClient = slackey.getAPIClient(token);
      slackAPIClient.send('auth.test', (error, response) => {
        if (error) {
          console.log(error);
        }
        redis.set(response.user_id, token);
        res.redirect(`/slack/hello?u=${response.user}`);
      });
    });
  }
};
