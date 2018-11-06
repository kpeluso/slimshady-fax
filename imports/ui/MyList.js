import {Meteor} from 'meteor/meteor';
import React from 'react';
import {Tracker} from 'meteor/tracker';

// import {Bodies} from '../api/bodies';
// import {Reviews} from '../api/reviews';

import BodyList from './BodyList';
import PrivateHeader from './PrivateHeader';
import QueryInput from './QueryInput';
import GraphBodies from './GraphBodies';
import ReviewsList from './ReviewsList';

export default () => {
  return (
    <div>
      <PrivateHeader title='Slim Shady'/>
      <div className='page-content'>
        <div className='upper-content'>
          <BodyList/>
          <QueryInput/>
          <GraphBodies/>
        </div>
        <div className='lower-content'>
          <ReviewsList/>
        </div>
      </div>
    </div>
  );
}

