import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {Session} from 'meteor/session';
import numeral from 'numeral';
import moment from 'moment';

export const Bodies = new Mongo.Collection('bodies');

if (Meteor.isServer) {
  // for users logged in
  Meteor.publish('bodies_all', function() {
    return Bodies.find({userId: this.userId});
  });
  // users not logged in - for D3 splash pre-login animation
  Meteor.publish('bodies_names', function() {
    return Bodies.find(
      {
        //userId: this.userId // USE A cache IN THE FUTURE!
      },{
        firstName: 1,
        _id: 1
      }
    );
  });
}

Meteor.methods({
  'bodies.insert'(body) {
    if (!this.userId) {
      throw new Meteor.error('Not-authorized');
    }

    try {
      new SimpleSchema({
        body: {
          type: Object,
          label: 'New body'
        },
        'body.firstName': {
          type: String
        },
        'body.lastName': {
          type: String
        },
        'body.rating': {
          type: Number
        },
        'body.date': {
          type: Date
        },
        'body.ethnicity': {
          type: String
        },
        'body.note': {
          type: String
        }
      }).validate({body});
    } catch (e) {
      throw new Meteor.Error(400,e.message);
    }

    // get next rank placement
    //Meteor.subscribe('bodies_all');
    let latest = Bodies.findOne({userId: this.userId}, {sort: {position: -1}});
    let position = 1;
    if (latest) {
      position += latest.position;
    }
    //let position = 1 + Bodies.findOne({userId: this.userId}, {sort: {position: -1}}).position;
    //let position = 1 + Bodies.find({userId: this.userId}).fetch().sort({position: -1}).limit(1);
    //let position = 1 + Bodies.find({userId: this.userId}).fetch({$max: position});;

    Bodies.insert({
      ...body,
      position,
      rank: numeral(position).format('0o'),
      userId: this.userId
    });
  },
  'bodies.edit'(newBody) {
    if (!this.userId) {
      throw new Meteor.error('Not-authorized');
    }

    try {
      new SimpleSchema({
        newBody: {
          type: Object,
          label: 'New newBody'
        },
        'newBody._id': {
          type: String,
          label: 'newBody _id',
          min: 1
        },
        'newBody.userId': {
          type: String,
          label: 'newBody _id',
          min: 1
        },
        'newBody.firstName': {
          type: String
        },
        'newBody.lastName': {
          type: String
        },
        'newBody.rating': {
          type: Number
        },
        'newBody.date': {
          type: Date
        },
        'newBody.ethnicity': {
          type: String
        },
        'newBody.rank': {
          type: String
        },
        'newBody.position': {
          type: Number
        },
        'newBody.note': {
          type: String
        }
      }).validate({newBody});
    } catch (e) {
      throw new Meteor.Error(400, e.message);
    }

    Bodies.update({_id: newBody._id}, newBody);
  }
});

