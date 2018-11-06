import {Meteor} from 'meteor/meteor';
import React from 'react';
import {Session} from 'meteor/session';
import d3 from 'd3'
import moment from 'moment';

import {Bodies} from '../api/bodies';

export default class QueryInput extends React.Component {
  constructor(props) {
    super(props);
    Meteor.subscribe('bodies_all');
    this.state = {
      totalBods: Bodies.find({}).fetch().length, // lowerDate: '', upperDate: ''
      changed: false
    };
  }
  componentDidMount() {
    this.setState({changed: false});
    this.bodsTracker = Tracker.autorun(() => {
      Meteor.subscribe('bodies_all');
      // data to send to GraphBodies.js
      if (!this.state.changed) {
        Session.set('queryEthnicity', false);
        Session.set('queryRank', false);
        const low = Bodies.find({}, {sort: {date: 1}, limit: 1}).fetch()[0];
        const up = Bodies.find({}, {sort: {date: -1}, limit: 1}).fetch()[0];
        Session.set('lowerDate', !!low ? moment(new Date(low.date)).format() : '');
        Session.set('upperDate', !!up ? moment(new Date(up.date)).add(1, 'day').format() : '' );
      }
      // render total bodies count
      let parent1 = d3.select('#d3');
      this.setState({totalBods: Bodies.find({}).fetch().length});
      parent1.selectAll("*").remove();
      this.renderGraph_null();
    });
  }
  componentWillUnmount() {
    this.bodsTracker.stop();
  }
  renderGraph_null() {
    let theD = d3.select('#d3')
    theD.html("<div class='buttons-container'><h2>Total Bodies Fucked:</h2><h2>" + this.state.totalBods + "</h2></div>")
        .attr('style', 'margin-top: 10px;');
    d3.selectAll('.buttons-container')
        .attr('style', 'display: flex;')
        .attr('style', 'justify-content: space-between;');
  }
  onChange_lowerDate(e) {
    this.setState({changed: true});
    Session.set('lowerDate', new Date(e.target.value.trim()));
  }
  onChange_upperDate(e) {
    this.setState({changed: true});
    Session.set('upperDate', moment(new Date(e.target.value.trim())).add(1, 'day').format());
  }
  onChange_ranking(e) {
    this.setState({changed: true});
    Session.set('queryRank', e.target.checked);
  }
  onChange_ethnicity(e) {
    this.setState({changed: true});
    Session.set('queryEthnicity', e.target.checked);
  }
  render() {
    return (
      <div className='boxed-view__box boxed-view__box__query'>
        <button id='reset_button' className='button' onClick={() => window.location.reload()}>Reset</button>
        <form className='boxed-view__form'>

          <div className='boxed-view__form__form-item'>
            <h2>Lower Time:</h2>
            <input type="date" name='date_lower' onChange={(e) => this.onChange_lowerDate(e)} ref='date_lower' />
          </div>

          <div className='boxed-view__form__form-item'>
            <h2>Upper Time:</h2>
            <input type="date" name='date_upper' onChange={(e) => this.onChange_upperDate(e)} ref='date_upper' />
          </div>

          <div className='boxed-view__form__form-item'>
            <h2>Ethnicity:</h2>
            <label className="switch">
              <input
                type="checkbox"
                //checked={Session.get('queryEthnicity')}
                onChange={(e) => this.onChange_ethnicity(e)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className='boxed-view__form__form-item'>
            <h2>Rank:</h2>
            <label className="switch">
              <input
                type="checkbox"
                //checked={Session.get('queryRank')}
                onChange={(e) => this.onChange_ranking(e)}
              />
              <span className="slider round"></span>
            </label>
          </div>

        </form>
        <div id='d3'></div>
      </div>
    );
  }
}

