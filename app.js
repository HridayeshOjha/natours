const path = require('path');
const express = require('express');
// const { request } = require('http');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const globalErrorHnadler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { __esModule } = require('xss-clean/lib/xss');
const viewRouter = require('./routes/viewRoutes');
const cookieParser = require('cookie-parser');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Global Middlewares

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Development Logging
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//  THESE TWO MIDDLEWARW DOESN'T WORK WITH EXPRESS 5 - In Express 5, req.query is no longer a plain mutable object💥
// // Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// // Data sanitization against XSS
app.use(xss());

// THAT'S WHY WE BUILD THIS FUCTION BELOW FOR SANITIZATION💥
// OR I CAN SWITCH TO EXPRESS 4 WHICH I DID LATER BUT I AM STILL KEEPING THIS FUNCTION FOR REFERENCE
// utils/sanitize.js
// function sanitizeObject(obj) {
//   if (typeof obj !== 'object' || obj === null) return obj;

//   const cleanObj = {};
//   for (let key in obj) {
//     if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

//     // ❌ Block MongoDB operators ($, .)
//     if (key.startsWith('$') || key.includes('.')) {
//       continue;
//     }

//     let value = obj[key];
//     if (typeof value === 'object') {
//       value = sanitizeObject(value); // recursive
//     } else if (typeof value === 'string') {
//       // ❌ Basic XSS cleaning
//       value = value.replace(/<script.*?>.*?<\/script>/gi, '');
//       value = value.replace(/<\/?.*?>/g, ''); // remove HTML tags
//     }

//     cleanObj[key] = value;
//   }
//   return cleanObj;
// }

// // Middleware for Express
// function sanitizeMiddleware(req, res, next) {
//   if (req.body) req.body = sanitizeObject(req.body);
//   if (req.query) req.query = sanitizeObject(req.query);
//   if (req.params) req.params = sanitizeObject(req.params);
//   next();
// }

// app.use(sanitizeMiddleware);

//  THIS MIDDLEWARW DOESN'T WORK WITH EXPRESS 5 - In Express 5, req.query is no longer a plain mutable object💥
// THAT'S WHY I SWITCH TO EXPRESS 4
// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// app.use((req, res, next) => {
//   console.log('hello from the middleware');
//   next();
// });

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// app.get('/api/v1/tours',GetAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createTour);

// app.patch('/api/v1/tours/:id', updateTour);

// app.delete('/api/v1/tours/:id', deleteTour);

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.use((req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server`,
  // });

  // const err= new Error( `Can't find ${req.originalUrl} on this server`);
  // err.status='fail';
  // err.statusCode=404;

  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHnadler);

module.exports = app;
