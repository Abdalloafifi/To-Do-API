var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const content = require("./config/conectet");
const securityMiddleware = require('./middlewares/securityMiddleware');
const { errorNotFound, errorHandler } = require('./middlewares/error');
require("dotenv").config();
const cors = require('cors');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var forgetpassRouter = require('./routes/forgetpass');


var app = express();

content();


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'auth-token'],
  exposedHeaders: ['auth-token']
}));

const compression = require("compression")
app.use(compression())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(securityMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/', usersRouter);
app.use('/api/tasks', indexRouter);
app.use('/api/forgetpass', forgetpassRouter);

// catch 404 and forward to error handler
app.use(errorNotFound);

// error handler
app.use(errorHandler);


module.exports = app;
