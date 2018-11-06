import {Meteor} from 'meteor/meteor';
import React from 'react';
import Modal from 'react-modal';
import moment from 'moment';
import {Tracker} from 'meteor/tracker';

import {Bodies} from '../api/bodies';

export default class AddBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bodies: [],
      body: {firstName: '', lastName: '', rating: 0, date: new Date(), ethnicity: '', note: ''},
      isOpen_add: false,
      isOpen_view: false,
      error: ''
    };
  }
  onSubmit(e) {
    const {body} = this.state;
    e.preventDefault(); // prevent page refresh
    Meteor.call('bodies.insert', body, (err) => {
      if (!err) {
        alert('Glad to see you\'ve been getting some action! Body has been added to your Body Count.');
        this.handleModalClose(); // to clear form input element
      } else {
        this.setState({error: err.reason})
      }
    });
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
  renderViewRows() {
    if (this.state.bodies.length === 0) {
      return (
        <div className="list-row--view">
          <p className="list-row__message">No bodies listed yet...</p>
        </div>
      );
    } else {
      return this.state.bodies.map((el) => {
        return (
          <div className='list-row--view' key={el._id}>
            <div className="list-row__message list-row__item review-rank">{el.rank}</div>
            <div className="list-row__message list-row__item">{el.firstName} {el.lastName}</div>
            <div className="list-row__message list-row__item">{el.rating}</div>
            <div className="list-row__message list-row__item">{el.ethnicity}</div>
            <div className="list-row__message list-row__item">{moment(el.date).format('MMM Do YY')}</div>
            <div className="list-row__message list-row__item"><div className='review-note'>{el.note}</div></div>
          </div>
        );
      });
    }
  };
  onChange_first(e) {
    var body = this.state.body;
    body.firstName = e.target.value.trim();
    this.setState({body});
  }
  onChange_last(e) {
    var body = this.state.body;
    body.lastName = e.target.value.trim();
    this.setState({body});
  }
  onChange_rank(e) {
    var body = this.state.body;
    body.rating = parseInt(e.target.value.trim());
    this.setState({body});
  }
  onChange_date(e) {
    var body = this.state.body;
    body.date = new Date(e.target.value.trim()); // moment(e.target.value.trim()).format('DD-MM-YYYY');
    this.setState({body});
  }
  onChange_ethnicity(e) {
    var body = this.state.body;
    body.ethnicity = e.target.value.trim(); // moment(e.target.value.trim()).format('DD-MM-YYYY');
    this.setState({body});
  }
  onChange_note(e) {
    var body = this.state.body;
    body.note = e.target.value;
    this.setState({body});
  }
  // ^^^
  // Look at second answer and comments here:
  //    https://stackoverflow.com/questions/27105257/storing-an-object-in-state-of-a-react-component
  // this.setState({
  //   body: e.target.value.trim() // !!! NEED TO ALTER THIS BASED ON REQUESTED FEATURES !!!
  // });
  handleModalClose() {
    this.setState({
      isOpen_add: false,
      isOpen_view: false,
      body: {firstName: '', lastName: '', rating: 0, date: new Date(), ethnicity: '', note: ''},
      error: ''
    });
  }
  populateOptions() {
    return ['White American', 'White European', 'Asian', 'South Asian', 'Middle Eastern', 'African', 'African American', 'Jewish', 'Latinx'].map((el) => {
      return <option key={el} value={el}>{el}</option>
      // if (el === '') {
      //   return <option key={el} value={el} defaultValue>{el}</option>
      // } else {
      //   return <option key={el} value={el}>{el}</option>
      // }
    });
  }
  populateRankOps() {
    return ['1','2','3','4','5'].map((el) => {
      return <option key={el} value={el}>{el}</option>
      // if ('' === el) {
      //   return <option key={el} value={el} selected>{el}</option>
      //   // See this to explain warning that pops up:
      //   //   https://stackoverflow.com/questions/36704166/why-does-react-say-not-to-set-selected-property-on-option-elements
      // } else {
      //   return <option key={el} value={el}>{el}</option>
      // }
    });
  }
  renderViewList() {
    return ['Order', 'Name', 'Rating', 'Ethnicity', 'Date', 'Notes'].map((el) => {
      if (el === 'Order') {
        return <div key={el} className='list-row__message list-row__message--header review-rank'>{el}</div>
      } else {
        return <div key={el} className='list-row__message list-row__message--header'>{el}</div>
      }
    });
  }
  render() {
    return (
      <div>
        <div className='buttons-container'>
          <button className='button' onClick={() => this.setState({isOpen_add: true})}>+ Add Body</button>
          <button className='button' onClick={() => this.setState({isOpen_view: true})}>View Raw</button>
        </div>
        <Modal
          ariaHideApp={false}
          isOpen={this.state.isOpen_add}
          contentLabel='Add Body'
          onAfterOpen={() => this.refs.body_firstName.focus()}
          onRequestClose={this.handleModalClose.bind(this)}
          className='boxed-view__box boxed-view__box--modal'
          overlayClassName='boxed-view boxed-view--modal'
          // onAfterOpen, onRequestClose allow you to close modal via ESC key or clicking in grey area
        >
          <h1>Add Body</h1>
          {this.state.error ? <p>{this.state.error}</p> : undefined}
          <form onSubmit={this.onSubmit.bind(this)} className='boxed-view__form'>
            <div className='boxed-view__form__form-item-solo'>
              <input type="text" name='firstName' onChange={this.onChange_first.bind(this)} placeholder="First Name" ref='body_firstName' required/>
            </div>
            <div className='boxed-view__form__form-item-solo'>
              <input type="text" name='lastName' onChange={this.onChange_last.bind(this)} placeholder="Last Name" ref='body_lastName' required/>
            </div>

            <div className='boxed-view__form__form-item'>
              <h2>Rate them (1 is 'Worst'):</h2>
              <select name='rank' ref='body_rank' onChange={this.onChange_rank.bind(this)} required>
                {this.populateRankOps()}
              </select>
            </div>

            <div className='boxed-view__form__form-item buttons-container'>
              <h2>Date:</h2>
              <input type="date" name='date' onChange={this.onChange_date.bind(this)} ref='body_date' required/>
            </div>
            <div className='boxed-view__form__form-item buttons-container'>
              <h2>Ethnicity:</h2>
              <select name='ethnicity' ref='body_ethnicity' onChange={this.onChange_ethnicity.bind(this)} required>
                {this.populateOptions()}
              </select>
            </div>
            <div className='boxed-view__form__form-item-solo'>
              <textarea rows="4" cols="50" name='body_note' placeholder="Tell us how much you loved it. What made it special? Why was it terrible?" ref='body_note' onChange={this.onChange_note.bind(this)}/>
            </div>
            <div className='boxed-view__form__form-item buttons-container'>
              <button className='button'>Yes I Fucked This Body</button>
              <button type='button' className='button button--secondary' onClick={this.handleModalClose.bind(this)}>Cancel</button>
            </div>
          </form>
        </Modal>
        <Modal
          ariaHideApp={false}
          isOpen={this.state.isOpen_view}
          contentLabel='View Bodies'
          onAfterOpen={null}
          onRequestClose={this.handleModalClose.bind(this)}
          className='boxed-view__box boxed-view__box__view-modal'
          overlayClassName='boxed-view boxed-view--modal'
          // onAfterOpen, onRequestClose allow you to close modal via ESC key or clicking in grey area
        >
          <div className='list-row'>
            <button type='button' className='button button--secondary' onClick={this.handleModalClose.bind(this)}>Back</button>
          </div>
          <div className='list-row--view'>
            {this.renderViewList()}
          </div>
          {this.renderViewRows()}
        </Modal>
      </div>
    );
  }
}

