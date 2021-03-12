const mongoose = require('mongoose');
const Tour = require('./tourModel');
const { findByIdAndDelete } = require('./userModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'review must belong to a user']
    }, 
    tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
    }
},
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

// one review per user
reviewSchema.index({tour: 1, user: 1}, {unique: true});

reviewSchema.pre(/^find/, function(next) {
    // this
    //     .populate({
    //         path: 'tour',
    //         select: 'name'
    //     })
    //     .populate({
    //         path: 'user',
    //         select: 'name photo'
    //     }) 
    this
    .populate({
        path: 'user',
        select: 'name photo'
    }) 
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1}, //for each document 1 will be added
                avgRating: {$avg: '$rating'}
            }
        }
    ]);
    //console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate & findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) { //cannot change it to post because at this point we no longer have access to query 
    this.r = await this.findOne();
    //console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    //await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
