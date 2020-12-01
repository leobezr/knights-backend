const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const router = express.Router();

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  next();
});

app.use(cors({
  origin: "*",
  optionsSuccessStatus: 200
}));

app.set('port', PORT);
app.set('env', NODE_ENV);
app.use(logger('tiny'));
app.use(bodyParser.json());

app.use('/', require(path.join(__dirname, 'routes/knights.js')));
app.use('/', require(path.join(__dirname, 'routes/profile.js')));

app.use((req, res, next) => {
  const ERROR = new Error(`${req.method} ${req.url} Not Found`);

  ERROR.status = 404;
  next(ERROR);
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500);

  res.json({
    error: {
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(
    `Express Server started on Port ${app.get(
      'port'
    )} | Environment : ${app.get('env')}`
  );
});

module.exports = router;