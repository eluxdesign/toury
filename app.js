const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

// Start express app
const app = express();

// for heroku
app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors()); //if just frontend: app.use(cors({origin: 'https://....'}))

app.options('*', cors()); // also complex requests - * - all

// Serving static files from folder
app.use(express.static(path.join(__dirname, 'public'))); 

// Set security Http headers
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          scriptSrc: [
            "'self'",
            'https:',
            'http:',
            'blob:',
            'https://*.mapbox.com',
            'https://js.stripe.com',
            'https://m.stripe.network',
            'https://*.cloudflare.com',
          ],
          frameSrc: ["'self'", 'https://js.stripe.com'],
          objectSrc: ["'none'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          workerSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://*.tiles.mapbox.com',
            'https://api.mapbox.com',
            'https://events.mapbox.com',
            'https://m.stripe.network',
          ],
          childSrc: ["'self'", 'blob:'],
          imgSrc: ["'self'", 'data:', 'blob:'],
          formAction: ["'self'"],
          connectSrc: [
            "'self'",
            "'unsafe-inline'",
            'data:',
            'blob:',
            'https://*.stripe.com',
            'https://*.mapbox.com',
            'https://*.cloudflare.com/',
            'https://bundle.js:*',
            'ws://127.0.0.1:*/',
   
          ],
          upgradeInsecureRequests: [],
        },
      },
    })
  );

// Development Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

// Limit request from same API
const limiter = rateLimit({
    max: 100, 
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour' 
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }), //body should not be in json --> before body parser
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'})); 
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration', 
        'ratingsQuantity', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price'
    ]
}));

app.use(compression());

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.cookies);
    next();
});

// 2) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => { //has to come after all the other routes 
    next(new AppError(`Can't find ${req.originalUrl} on this server!`), 404);
});

app.use(globalErrorHandler);

module.exports = app;