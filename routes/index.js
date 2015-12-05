module.exports = (app, redis) => {
  app.get('/slack', main);
  app.get('/slack/hello', hello);

  function main(req, res) {
    let button = 'https://slack.com/oauth/authorize?scope=chat:write:user&team=T0429FWE3&client_id=4077540479.15566059090&redirect_uri=http://localhost:5577/auth/callback';
    res.send(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
      </head>
      <body style="background:lightblue;
                   font-family: 'Trebuchet MS', Helvetica, sans-serif;
                   color:#333;">
        <div style="margin-top:100px; text-align:center">
          <h1>SlangBot</h1>
          <h3>Press button below to continue</h3>
          <a href="${button}"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>
        </div>
      </body>
      </html>
      `
    );
  }

  function hello(req, res) {
    res.send(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
      </head>
      <body style="background:lightblue;
                   font-family: 'Trebuchet MS', Helvetica, sans-serif;
                   color:#333;">
        <div style="margin-top:100px; text-align:center">
          <h1>SlangBot</h1>
          <h3>Welcome, ${req.query.u}!</h3>
          <p>Now you can close this page.</p>
        </div>
      </body>
      </html>
      `
    );
  }

  require('./auth')(app, redis);
};
