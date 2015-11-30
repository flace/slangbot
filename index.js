const express = require('express');
const app = express();
const config = require('config');

require('./config')(app);

const port = process.env.PORT || config.port;

app.listen(port, () => {
  console.log('app start on port ' + config.port);
});

require('./routes')(app);
app.use((req, res) => {
  res.send(404);
});

require('./bots')(app);
