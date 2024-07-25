const functions = require('@google-cloud/functions-framework');

functions.http('hey', (req, res) => {
  const hello = 'hello123123123jalskdjalskj';
  const hello1 = 'hello123123123jalskdjalskj';
  res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
});
