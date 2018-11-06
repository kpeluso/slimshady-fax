import d3 from 'd3';
import React from 'react';
import {Session} from 'meteor/session';
import {Tracker} from 'meteor/tracker';
import d3ForceBounce from 'd3-force-bounce';
import d3ForceSurface from 'd3-force-surface';

import {Bodies} from '../api/bodies';

export default class BrownianSplash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bodies: [],
      width: window.innerWidth,
      height: window.innerHeight,
      error: ''
    };
  }
  onSubmit(e) {
    let username = this.refs.username.value.trim();
    let password = this.refs.password.value.trim();
    e.preventDefault(); // prevent page refresh
    Meteor.loginWithPassword({username}, password, (err) => {
      if (err) {
        console.log('Login callback', err);
        this.setState({error: err.reason});
      } else {
        this.setState({error: ''});
        window.location.reload();
      }
    });
  }
  componentDidMount() {
    window.addEventListener("resize", this.onResize.bind(this));
    this.bodyNamesTracker = Tracker.autorun(() => {
      Meteor.subscribe('bodies_names');
      const bodies = Bodies.find({}).fetch();
      this.setState({bodies});
      this.renderAnimation();
    });
  }
  onResize() {
    // Inspiration:
    //   https://www.hawatel.com/blog/handle-window-resize-in-react/
    this.setState({width: window.innerWidth, height: window.innerHeight});
    this.renderAnimation();
  }
  componentWillUnmount() {
    this.bodyNamesTracker.stop(); // we don't want to set the state every time the page is loaded
    window.removeEventListener("resize", this.onResize.bind(this));
  }
  renderAnimation() {
	  const PARTICLE_RADIUS = 20,
  	  PARTICLE_VELOCITY_RANGE = [0, 4];
    bodies = this.state.bodies;

    const canvasWidth = this.state.width,//window.innerWidth,
    	canvasHeight = this.state.height,//window.innerHeight,
    	svgCanvas = d3.select('svg#canvas')
    		.attr('width', canvasWidth)
    		.attr('height', canvasHeight);

    const forceSim = d3.forceSimulation()
    	.alphaDecay(0)
    	.velocityDecay(0)
    	.on('tick', particleDigest)
    	.force('bounce', d3ForceBounce.forceBounce()
    		.radius(d => d.r)
    	)
    	.force('container', d3ForceSurface.forceSurface()
    		.surfaces([
    			{from: {x:0,y:0}, to: {x:0,y:canvasHeight}},
    			{from: {x:0,y:canvasHeight}, to: {x:canvasWidth,y:canvasHeight}},
    			{from: {x:canvasWidth,y:canvasHeight}, to: {x:canvasWidth,y:0}},
    			{from: {x:canvasWidth,y:0}, to: {x:0,y:0}}
    		])
    		.oneWay(true)
    		.radius(d => d.r)
    	);

    // Init particles
    // onDensityChange(INIT_DENSITY);
    onDensityChange(bodies.length);

    // Event handlers
    function onDensityChange(len) {
    	const newNodes = genNodes(len);
    	forceSim.nodes(newNodes);
    }

    //

    function genNodes(len) {
    	// const numParticles = Math.round(canvasWidth * canvasHeight * density),
    	// 	existingParticles = forceSim.nodes();
      const numParticles = len,
    		existingParticles = forceSim.nodes();

    	// Trim
    	if (numParticles < existingParticles.length) {
    		return existingParticles.slice(0, numParticles);
    	}

    	// Append
    	return [...existingParticles, ...d3.range(numParticles - existingParticles.length).map((el, idx) => {
    		const angle = Math.random() * 2 * Math.PI,
    			velocity = Math.random() * (PARTICLE_VELOCITY_RANGE[1] - PARTICLE_VELOCITY_RANGE[0]) + PARTICLE_VELOCITY_RANGE[0];
        // console.log(bodies[idx].firstName);
    		return {
    			x: Math.random() * canvasWidth,
    			y: Math.random() * canvasHeight,
    			vx: Math.cos(angle) * velocity,
    			vy: Math.sin(angle) * velocity,
    			r: Math.round(PARTICLE_RADIUS),
          body: bodies[idx].firstName
    		}
    	})];
    }

    function particleDigest() {
    	let particle = svgCanvas.selectAll('g.particle').data(forceSim.nodes().map(hardLimit));

    	particle.exit().remove();

      var part = particle.enter()
        .append('g')
        .classed('particle', true)
        .attr('x', d => d.x)
        .attr('y', d => d.y);

      part.append('circle')
        .attr('r', d => d.r)
        .attr('fill', '#dddddd')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      part.append('text')
        .text(d => d.body)
        .attr('fill', 'black')
        .style('font-size', '24px')
        .style('text-anchor', 'middle')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .text(d => d.body);
    }

    function hardLimit(node) {
    	// Keep in canvas
    	node.x = Math.max(node.r, Math.min(canvasWidth-node.r, node.x));
    	node.y = Math.max(node.r, Math.min(canvasHeight-node.r, node.y));
    	return node;
    }
  }
  render() {
    return (
      <div className='boxed-view'>
        <div className='boxed-view__box'>
          <h1>Login</h1>
          {this.state.error ? <p>{this.state.error}</p> : undefined}
          <form onSubmit={this.onSubmit.bind(this)} className='boxed-view__form'>
            <input type="text" name='username' placeholder="Josiah Carberry" ref='username'/>
            <input type="password" name='password' ref='password'/>
            <button className='button'>Let's Go</button>
          </form>
        </div>
        <svg id="canvas"></svg>
        {/* {this.renderAnimation(this.state.bodies)} */}
    </div>
    );
  }
}

