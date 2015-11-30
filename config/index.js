const bodyParser = require('body-parser');

module.exports = app => {
  app.use((req, res, next) => {
    console.log(req.url);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
  }));
};
