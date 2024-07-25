const functions = require('@google-cloud/functions-framework');

functions.http('hey', (req, res) => {
  const hello = 'hello123123123jalskdjalskj';
  const hello1 = 'hello121231233123123jalskdjalskj';
  res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
});
