import d3 from 'd3';
import './d3-tip';
import React from 'react';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Tracker} from 'meteor/tracker';
import {Mongo} from 'meteor/mongo';
import moment from 'moment';

import {Bodies} from '../api/bodies';

const GraphBods = new Mongo.Collection('GraphBods');

export default class GraphBodies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredBodies: {}, // post-filtered bodies in group query format
      error: '',
      lowerDateBound: Session.get('lowerDate'),
      upperDateBound: Session.get('upperDate')
    };
  }
  componentDidMount() {
    this.filterTracker = Tracker.autorun(() => {
      // console.log('this.state');
      // console.log(this.state);
      // if-statements to determine what graph should be rendered based off of Session variables
      if (Session.get('lowerDate') > Session.get('upperDate')) {
        // throw new Meteor.error('The Lower Date field canot be greater than the Upper Date field.');
        alert('The Lower Date field canot be greater than the Upper Date field.');
        window.location.reload();
      } else {
        if (Session.get('lowerDate')) {
          this.setState({'lowerDateBound': Session.get('lowerDate')})
        }
        if (Session.get('upperDate')) {
          this.setState({'upperDateBound': Session.get('upperDate')})
        }
      }
      this.clearD3();
      this.setState({filteredBodies: this.readBodies()});
      // sessionInput = {
      //   lowerDate: Session.get('lowerDate'),
      //   upperDate: Session.get('upperDate'),
      //   queryEthnicity: Session.get('queryEthnicity'),
      //   queryRank: Session.get('queryRank')
      // }
      // console.log('sessionInput');
      // console.log(sessionInput);
      let theData = []
      if (!!Session.get('queryEthnicity') && !Session.get('queryRank')) {
        for (let key in this.state.filteredBodies) {
        	theData = theData.concat({label: key, value: this.state.filteredBodies[key]});
        };
        this.renderGraph_bar('#d3-container', theData);
      } else if (!Session.get('queryEthnicity') && !!Session.get('queryRank')) {
        for (let key in this.state.filteredBodies) {
        	theData = theData.concat({label: key, value: this.state.filteredBodies[key]});
        };
        this.renderGraph_bar('#d3-container', theData);
      } else if (!!Session.get('queryEthnicity') && !!Session.get('queryRank')) {
        let l = ['White American', 'White European', 'Asian', 'South Asian', 'Middle Eastern', 'African', 'African American', 'Jewish', 'Latinx'];
        // let rows = ['ytAm.', 'ytEuro', 'Asian', 'S.Asian', 'M.East', 'African', 'Af.Am.', 'Jewish', 'Latinx'];
        for (let key in this.state.filteredBodies) {
          newKey = key.split('+');
        	theData = theData.concat({col: parseInt(newKey[1]), row: l.indexOf(newKey[0])+1, value: this.state.filteredBodies[key]});
        };

        this.renderGraph_heat2('#d3-container', theData);
        // this.renderGraph_all('#d3-container');
      }
    });
  }
  componentWillUnmount() {
    this.filterTracker.stop();
  }
  group2(l, field1, field2=null) {
    return l.reduce(
      (vals, el) => {
        let temp = `${el[field1]}`;
        if (!!field2) {
          temp += `+${el[field2]}`
        }
        if (temp in vals) {
          vals[temp] += 1;
          return vals
        } else {
          let e = {};
          e[temp] = 1;
          return Object.assign(vals, e);
        }
      },
      {}
    );
  }
  readBodies() {
    let filteredBodies = {};
    let l1 = Bodies.find({
      date: {
        $gte: moment(Session.get('lowerDate')).toDate(),
        $lte: moment(Session.get('upperDate')).toDate()
      }
      // Credit:
      //   https://stackoverflow.com/questions/24170746/meteorjs-mongodb-how-to-query-a-date-with-momentjs
    }).fetch();
    if (!!Session.get('queryEthnicity') && !Session.get('queryRank')) {
      filteredBodies = this.group2(l1, 'ethnicity');
    } else if (!Session.get('queryEthnicity') && !!Session.get('queryRank')) {
      filteredBodies = this.group2(l1, 'rating');
    } else if (!!Session.get('queryEthnicity') && !!Session.get('queryRank')) {
      filteredBodies = this.group2(l1, 'ethnicity', 'rating');
    } else {
      filteredBodies = Bodies.find({
        date: {
          $gte: moment(Session.get('lowerDate')).toDate(),
          $lte: moment(Session.get('upperDate')).toDate()
        }
      }).fetch();
    }
    return filteredBodies;
  }
  clearD3() {
    let parent1 = d3.select('#d3-container');
    parent1.selectAll("*").remove();
  }
  renderGraph_heat2(div_id, theDataset) {
    // Source:
    //   http://bl.ocks.org/tjdecke/5558084
    // toolTip Source:
    //   https://github.com/Caged/d3-tip
    let size = d3.select(div_id).node().getBoundingClientRect();
    var margin = { top: 15, right: 0, bottom: 100, left: 30 },
          width = 960 - margin.left - margin.right,
          height = 430 - margin.top - margin.bottom,
          gridSize = Math.floor(width / 24),
          legendElementWidth = gridSize*2,
          colors = ['#7a0177', '#c51b8a', '#f768a1', '#fbb4b9', '#feebe2'], // alternatively colorbrewer.YlGnBu[9] OR http://colorbrewer2.org/#type=sequential&scheme=RdPu&n=5 (but the color list needs to be reversed)
          buckets = colors.length, // how many different colors to show
          rows = ['ytAm.', 'ytEuro', 'Asian', 'S.Asian', 'M.East', 'African', 'Af.Am.', 'Jewish', 'Latinx'],
          cols = ['1','2','3','4','5'];

      var svg = d3.select(div_id).append("svg")
          .attr("width", size.width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var dayLabels = svg.selectAll(".dayLabel")
          .data(rows)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", -16)
            .attr("y", function (d, i) { return i * gridSize + gridSize; })
            .style("text-anchor", "end")
            .attr('style', 'text-anchor: end;')
            // .attr('style', 'text-anchor: end;')
            .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
            .attr("class", d => "dayLabel mono axis");

      var timeLabels = svg.selectAll(".timeLabel")
          .data(cols)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize + gridSize; })
            .attr("y", 25)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + gridSize / 2 + ", -6)")
            .attr("class", d => "timeLabel mono axis");
            // .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

      const tip = d3.tip()
          .attr('class', 'd3-tip')
          .style("visibility","visible")
          .offset([-5, 0])
          .html(function(d) {
            return "Bodies:  <span style='color:red'>" + d.value;
          });
      // tip(svg.append("g"));
      svg.call(tip);

      // var heatmapChart = function(data) {
      // var colorScale = d3.scaleQuantile()
      //     .domain([0, buckets - 1, d3.max(theDataset, function (d) { return d.value; })])
      //     .range(colors);
      const colorScale = d3.scaleQuantile()
            .domain([0, buckets - 1, d3.max(theDataset, (d) => d.value)])
            .range(colors);

      var cards = svg.selectAll(".col")
          .data(theDataset, function(d) {return d.row+':'+d.col;});

      cards.append("title");

      cards.enter()
          .append("rect")
          .attr("x", function(d) { return (d.col-1) * gridSize + margin.left + 15; })
          .attr("y", function(d) { return d.row * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "col bordered")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", colors[0])
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
      .merge(cards)
          .transition()
          .duration(1000)
          .style("fill", (d) => colorScale(d.value));

      cards.transition().duration(1000)
          .style("fill", function(d) { console.log(d.value); console.log(colorScale(d.value)); return colorScale(d.value); });

      cards.select("title").text(function(d) { return d.value; });

      cards.exit().remove();

      // found in the original style header section of source file
      d3.selectAll('rect.bordered')
          .attr('style', 'stroke: "#969696";') // #E6E6E6
          .attr('style', 'stroke-width: 2px;');
      d3.selectAll('text.mono')
          .attr('style', 'font-size: 9pt;')
          .attr('style', 'font-family: Consolas, courier;')
          .attr('style', 'font-style: italic;')
          .attr('style', 'fill: #6A6A6A;');
      d3.selectAll('text.axis-workweek')
          .attr('style', 'fill: #000;');
      d3.selectAll('text.axis-worktime')
          .attr('style', 'fill: #000;');
      d3.selectAll('rect:hover')
          .attr('style', 'opacity: 0.5;');
      d3.selectAll('.d3-tip')
          .attr('style', 'font-family: Verdana; background: rgba(0, 0, 0, 0.8); padding: 8px; color: #fff; z-index: 5070;');
  }
  renderGraph_bar(div_id, data) {
    // (upperTime OR lowerTime) AND (Ethnicity XOR Rank)
    // Source:
    //   http://bl.ocks.org/juan-cb/faf62e91e3c70a99a306
    var axisMargin = 20,
            margin = 10,
            valueMargin = 4,
            width = parseInt(d3.select(div_id).style('width'), 10),
            height = parseInt(d3.select(div_id).style('height'), 10)+60,
            barHeight = (height-axisMargin-margin*2)* 0.4/data.length,
            barPadding = (height-axisMargin-margin*2)*0.6/data.length,
            data, bar, svg, scale, xAxis, labelWidth = 0;

    max = d3.max(data, function(d) { return d.value; });

    svg = d3.select(div_id)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");

    bar.attr("class", "bar")
            .attr("cx",0)
            .attr("transform", function(d, i) {
                return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
            });

    bar.append("text")
            .attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function(d){
                return d.label;
            }).each(function() {
        labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
    });

    scale = d3.scaleLinear()
            .domain([0, max])
            .range([0, width - margin*2 - labelWidth]);

    // xAxis = d3.svg.axis()
    //         .scale(scale)
    //         .tickSize(-height + 2*margin + axisMargin)
    //         .orient("bottom");
    // xAxis = d3.axisBottom(scale).tickSize(-height + 2*margin + axisMargin).orient("bottom");//.tickFormat(function(d){ return d.x;});
    xAxis = d3.axisBottom(scale);//.tickFormat(function(d){ return d.x;});
    // See this:
    //   https://stackoverflow.com/questions/40465283/what-is-d3-svg-axis-in-d3-version-4
    // var yAxis = d3.axisLeft(yRange);

    bar.append("rect")
            .attr("transform", "translate("+labelWidth+", 0)")
            .attr('fill', '#b2b4b7')
            .attr("height", barHeight)
            .attr('width', 0)
            .transition()
              .duration(1000)
              .attr('width', d => scale(d.value));

    bar.append("text")
            .attr("class", "value")
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return (Math.round(100*d.value/data.length)+"%");
            })
            .attr("x", function(d){
                var width = this.getBBox().width;
                return Math.max(width + valueMargin, scale(d.value));
            });

    svg.insert("g",":first-child")
            .attr("class", "axisHorizontal")
            .attr("transform", "translate(" + (margin + labelWidth) + ","+ (height - axisMargin - margin)+")")
            .call(xAxis);
  }
  render() {
    return (
      <div className='boxed-view__box'>
        <div className='graph-box'>
          <h2 className='boxed-view__form__form-item-solo lower'>Analytics</h2>
          <div id='d3-container' className='d3'></div>
          {/* <div id='d3-2' className='d3'></div> */}
        </div>
      </div>
    );
  }
};

