import {Meteor} from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';
import {Tracker} from 'meteor/tracker';
import PropTypes from 'prop-types';
import FlipMove from 'react-flip-move';

import {Reviews} from '../api/reviews';

export default class ReviewsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {reviews: [], review: '', isOpen: false, error: ''};
  }
  onSubmit(e) {
    const {review} = this.state;
    e.preventDefault(); // prevent page refresh
    Meteor.call('reviews.insert', review, (err) => {
      if (!err) {
        alert('Oooo juicy! Your review has been added!');
        this.handleModalClose(); // to clear form input element
      } else {
        this.setState({error: err.reason});
      }
    });
  }
  componentDidMount() {
    this.reviewsTracker = Tracker.autorun(() => {
      Meteor.subscribe('reviews');
      const reviews = Reviews.find({}).fetch();
      this.setState({reviews});
    });
  }
  componentWillUnmount() {
    this.reviewsTracker.stop(); // we don't want to set the state every time the page is loaded
  }
  onChange(e) {
    this.setState({
      review: e.target.value.trim()
    });
  }
  handleModalClose() {
    this.setState({review: '', isOpen: false, error: ''});
  }
  renderReviewItems() {
    if (this.state.reviews.length === 0) {
      return <p className='review'>No reviews yet...</p>
    }
    return this.state.reviews.map((review) => {
      return <p key={review._id} className='review'>{review.review}</p>
    });
  }
  render() {
    return (
      <div className='boxed-view__box lower-content__box'>
        <button className='button' onClick={() => this.setState({isOpen: true})}>+ Add Review</button>
        <FlipMove maintainContainerHeight={true}>
          <div className='reviews-container'>
            {this.renderReviewItems()}
          </div>
        </FlipMove>
        <Modal
          ariaHideApp={false}
          isOpen={this.state.isOpen}
          contentLabel='View Bodies'
          onAfterOpen={null}
          onRequestClose={this.handleModalClose.bind(this)}
          className='boxed-view__box boxed-view__box--modal'
          overlayClassName='boxed-view boxed-view--modal'
          // onAfterOpen, onRequestClose allow you to close modal via ESC key or clicking in grey area
        >
          <h2>Note: You can't edit a submitted review!</h2>
          {this.state.error ? <p>{this.state.error}</p> : undefined}
          <form onSubmit={this.onSubmit.bind(this)} className='boxed-view__form'>
            <div className='boxed-view__form__form-item-solo'>
              <textarea type="textarea" rows="4" cols="50" name='reviewInput' placeholder='e.g. "Damn, what a night!" ~ Anonymous Lover #42' ref='reviewInput' onChange={this.onChange.bind(this)}/>
            </div>
            <div className='boxed-view__form__form-item buttons-container'>
              <button className='button'>Submit Review</button>
              <button type='button' className='button button--secondary' onClick={this.handleModalClose.bind(this)}>Cancel</button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }
}

