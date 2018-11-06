import React from 'react';
import {Session} from 'meteor/session';
import {Tracker} from 'meteor/tracker';
import FlipMove from 'react-flip-move';
import Modal from 'react-modal';
import moment from 'moment';

import AddBody from './AddBody';
import {Bodies} from '../api/bodies';

export default class BodyList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {bodies: [], editModal: false, error: '', editBody: {}};
  }
  componentDidMount() {
    this.bodiesTracker = Tracker.autorun(() => {
      Meteor.subscribe('bodies_all');
      const bodies = Bodies.find({}).fetch();
      this.setState({bodies});
    });
  }
  componentWillUnmount() {
    this.bodiesTracker.stop(); // we don't want to set the state every time the page is loaded
  }
  onSubmit(e) {
    const {editBody} = this.state;
    e.preventDefault(); // prevent page refresh
    Meteor.call('bodies.edit', editBody, (err) => {
      if (!err) {
        alert('Body has been edited!');
        this.handleModalClose(); // to clear form input element
      } else {
        this.setState({error: err.reason})
      }
    });
  }

  onChange_first(e) {
    var editBody = this.state.editBody;
    editBody.firstName = e.target.value.trim();
    this.setState({editBody});
  }
  onChange_last(e) {
    var editBody = this.state.editBody;
    editBody.lastName = e.target.value.trim();
    this.setState({editBody});
  }
  onChange_rank(e) {
    var editBody = this.state.editBody;
    editBody.rating = parseInt(e.target.value.trim());
    this.setState({editBody});
  }
  onChange_date(e) {
    var editBody = this.state.editBody;
    editBody.date = new Date(e.target.value.trim()); // moment(e.target.value.trim()).format('DD-MM-YYYY');
    this.setState({editBody});
  }
  onChange_ethnicity(e) {
    var editBody = this.state.editBody;
    editBody.ethnicity = e.target.value.trim(); // moment(e.target.value.trim()).format('DD-MM-YYYY');
    this.setState({editBody});
  }
  onChange_note(e) {
    var editBody = this.state.editBody;
    editBody.note = e.target.value;
    this.setState({editBody});
  }
  renderRows() {
    if (this.state.bodies.length === 0) {
      return (
        <div className="list-row">
          <p className="list-row__message">No bodies listed yet...</p>
        </div>
      );
    } else {
      return this.state.bodies.map((el) => {
        return (
          <div className='list-row' key={el._id}>
            <span className="list-row__message list-row__item">{el.rank}</span>
            <span className="list-row__message list-row__item">{el.firstName} {el.lastName}</span>
            <button className='button button--pill list-row__item' onClick={() => this.setState({editModal: true, editBody: el})}>Edit</button>
          </div>
        );
      });
    }
  };
  handleModalClose() {
    this.setState({editModal: false, error: '', editBody: {}});
  }
  populateOptions() {
    return [
      'White American', 'White European',
      'Asian', 'South Asian',
      'Middle Eastern', 'African',
      'African American', 'Jewish',
      'Latinx'].map((el) => {
      if (this.state.editBody.ethnicity === el) {
        return <option key={el} value={el} selected>{el}</option>
        // See this to explain warning that pops up:
        //   https://stackoverflow.com/questions/36704166/why-does-react-say-not-to-set-selected-property-on-option-elements
      } else {
        return <option key={el} value={el}>{el}</option>
      }
    });
  }
  populateRankOps() {
    return ['1','2','3','4','5'].map((el) => {
      if (this.state.editBody.rating === parseInt(el)) {
        return <option key={el} value={el} selected>{el}</option>
        // See this to explain warning that pops up:
        //   https://stackoverflow.com/questions/36704166/why-does-react-say-not-to-set-selected-property-on-option-elements
      } else {
        return <option key={el} value={el}>{el}</option>
      }
    });
  }
  //   return [1,2,3,4,5].map((el) => {
  //     if (this.state.editBody.rating === el) {
  //       return <div key={el} className='radio-container'><label><pre>{el} </pre><input checked type="radio" name='rating' value={`${el}`} ref='body_rating' onChange={this.onChange_rating.bind(this)}/></label></div>
  //     } else {
  //       return <div key={el} className='radio-container'><label><pre>{el} </pre><input type="radio" name='rating' value={`${el}`} ref='body_rating' onChange={this.onChange_rating.bind(this)}/></label></div>
  //     }
  //   });
  // }
  render() {
    return (
      <div className='boxed-view__box'>
        <AddBody/>
        <div id='bodies-list'>
          <FlipMove maintainContainerHeight={true}>
            {this.renderRows()}
          </FlipMove>
        </div>
        <Modal
          ariaHideApp={false}
          isOpen={this.state.editModal}
          contentLabel='Edit Body'
          onAfterOpen={null}
          onRequestClose={this.handleModalClose.bind(this)}
          className='boxed-view__box boxed-view__box--modal'
          overlayClassName='boxed-view boxed-view--modal'
          // onAfterOpen, onRequestClose allow you to close modal via ESC key or clicking in grey area
        >

          <h1>Edit Body</h1>
          {this.state.error ? <p>{this.state.error}</p> : undefined}
          <form onSubmit={this.onSubmit.bind(this)} className='boxed-view__form'>
            <div className='boxed-view__form__form-item-solo'>
              <input type="text" name='firstName' onChange={this.onChange_first.bind(this)} placeholder="First Name" ref='body_firstName' value={this.state.editBody.firstName} required/>
            </div>

            <div className='boxed-view__form__form-item-solo'>
              <input type="text" name='lastName' onChange={this.onChange_last.bind(this)} placeholder="Last Name" ref='body_lastName' value={this.state.editBody.lastName} required/>
            </div>

            <div className='boxed-view__form__form-item'>
              <h2>Rate them (1 is 'Worst'):</h2>
              <select name='rank' ref='body_rank' onChange={this.onChange_rank.bind(this)} required>
                {this.populateRankOps()}
              </select>
            </div>

            <div className='boxed-view__form__form-item buttons-container'>
              <h2>Date:</h2>
              <input type="date" name='date' onChange={this.onChange_date.bind(this)} ref='body_date' value={moment(this.state.editBody.date).add(1, 'day').format('YYYY-MM-DD')} required/>
            </div>

            <div className='boxed-view__form__form-item buttons-container'>
              <h2>Ethnicity:</h2>
              <select name='ethnicity' ref='body_ethnicity' onChange={this.onChange_ethnicity.bind(this)} required>
                {this.populateOptions()}
              </select>
            </div>

            <div className='boxed-view__form__form-item-solo'>
              <textarea rows="4" cols="50" name='body_note' placeholder="Tell us how much you loved it..." ref='body_note' onChange={this.onChange_note.bind(this)} value={this.state.editBody.note}/>
            </div>

            <div className='boxed-view__form__form-item buttons-container'>
              <button className='button'>Yes I Fucked This Body</button>
              <button type='button' className='button button--secondary' onClick={this.handleModalClose.bind(this)}>Cancel</button>
            </div>
          </form>

        </Modal>
      </div>
    );
  }
};

