import express from 'express';

const app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(4000, function () {
  console.log('App is listening on port 3000!');
});
