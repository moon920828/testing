const functions = require('@google-cloud/functions-framework');

functions.http('hey', (req, res) => {
  const hello = 'hello123123123jal123123asdf12skdjalskj';
  const hello1 = 'hello12123123asdasd3123123jalskdjalskj';
  res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
});
