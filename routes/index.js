module.exports = app => {
  app.get('/', main);

  function main(req, res) {
    res.send('slack bot');
  }
};
