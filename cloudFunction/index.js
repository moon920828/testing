const functions = require('@google-cloud/functions-framework');

functions.http('hey', (req, res) => {
  const hello = 'hello123123';
  res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
});
