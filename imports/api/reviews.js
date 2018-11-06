import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Reviews = new Mongo.Collection('reviews');

if (Meteor.isServer) {
  // for users logged in only
  Meteor.publish('reviews', function() {
    return Reviews.find({userId: this.userId});
  });
}

Meteor.methods({
  'reviews.insert'(review) {
    if (!this.userId) {
      throw new Meteor.error('Not-authorized');
    }

    try {
      new SimpleSchema({
        review: {
          type: String,
          label: 'New review',
        }
      }).validate({review});
    } catch (e) {
      throw new Meteor.Error(400,e.message);
    }

    Reviews.insert({
      review,
      userId: this.userId
    });
  }
});

