const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.alerts = (req, res, next) => {
  const alert = req.query.alert;
  if (alert === 'booking') {
    res.locals.alert = "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later.";
  };
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
    // get tour data from collection
    const tours = await Tour.find();

    // build template

    // render that remplate using tour data from 1

    res.status(200).render('overview', {
        title: 'All Tours',
        tours: tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'reviews rating user',
    });
   
    if (!tour) {
      return next(new AppError('There is no tour with that name', 404));
    }
    res
      .status(200)
      // .set(
      //   'Content-Security-Policy',
      //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      // )
      .render('tour', {
        title: `${tour.name}`,
        tour,
      });
  });
   
  exports.getLoginForm = (req, res, next) => {
    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "connect-src 'self' https://cdnjs.cloudflare.com"
      )
      .render('login', {
        title: 'User Login',
      });
  };

  exports.getAccount = (req, res) => {
    res
    .status(200).render('account', {
      title: 'Your account',
    });
  };

  exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({
      user: req.user.id
    });
    // 2) Find tours with the returned IDs
    const tourIds = bookings.map(el => el.tour.id); 
    const tours = await Tour.find({
      _id: { $in: tourIds}
    });

    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    })
  });

  exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      name: req.body.name, 
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
    );
    res
    .status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });

  exports.getSignupForm = (req, res, next) => {
    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "connect-src 'self' https://cdnjs.cloudflare.com"
      )
      .render('signup', {
        title: 'User Signup'
      });
  };