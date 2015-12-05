const express = require('express');
const config = require('config');
const redis = require('redis');
const app = express();

require('./config')(app);

const port = process.env.PORT || config.port;
const client = redis.createClient();

app.listen(port, () => {
  console.log('app start on port ' + config.port);
});

require('./routes')(app, client);

app.use((req, res) => {
  res.send(404);
});

require('./bots')(app, client);
