
var maxBirds = 900;
var birdsContainerWidth = window.innerWidth;
var birdsContainerHeight = window.innerHeight;
var animationRequestID = 1;


var Bird = function () {

	var scope = this;

	THREE.Geometry.call( this );

	v(   5,   0,   0 );
	v( - 5, - 2,   1 );
	v( - 5,   0,   0 );
	v( - 5, - 2, - 1 );

	v(   0,   2, - 6 );
	v(   0,   2,   6 );
	v(   2,   0,   0 );
	v( - 3,   0,   0 );

	f3( 0, 2, 1 );
	// f3( 0, 3, 2 );

	f3( 4, 7, 6 );
	f3( 5, 6, 7 );

	this.computeFaceNormals();

	function v( x, y, z ) {

		scope.vertices.push( new THREE.Vector3( x, y, z ) );

	}

	function f3( a, b, c ) {

		scope.faces.push( new THREE.Face3( a, b, c ) );

	}

}

Bird.prototype = Object.create( THREE.Geometry.prototype );



// Based on http://www.openprocessing.org/visuals/?visualID=6910

var Boid = function() {
	var vector = new THREE.Vector3(),
	_acceleration,
	_width = 500,
	_height = 500,
	_depth = 200,
	_goal,
	_neighborhoodRadius = 100,
	_maxSpeed = 4,
	_maxSteerForce = 0.1,
	_avoidWalls = false;

	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	_acceleration = new THREE.Vector3();

	this.setGoal = function ( target ) {
		_goal = target;
	}

	this.setAvoidWalls = function ( value ) {
		_avoidWalls = value;
	}

	this.setWorldSize = function ( width, height, depth ) {
		_width = width;
		_height = height;
		_depth = depth;
	}

	this.run = function ( boids ) {
		if ( _avoidWalls ) {
			vector.set( - _width, this.position.y, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( _width, this.position.y, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, - _height, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, _height, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, this.position.y, - _depth );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, this.position.y, _depth );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );
		}

		if ( Math.random() > 0.5 ) this.flock( boids );

		this.move();
	}

	this.flock = function ( boids ) {
		if ( _goal ) _acceleration.add( this.reach( _goal, 0.005 ) );

		_acceleration.add( this.alignment( boids ) );
		_acceleration.add( this.cohesion( boids ) );
		_acceleration.add( this.separation( boids ) );
	}

	this.move = function () {
		this.velocity.add( _acceleration );

		var l = this.velocity.length();

		if ( l > _maxSpeed ) this.velocity.divideScalar( l / _maxSpeed );

		this.position.add( this.velocity );
		_acceleration.set( 0, 0, 0 );
	}

	this.checkBounds = function () {
		if ( this.position.x >   _width ) this.position.x = - _width;
		if ( this.position.x < - _width ) this.position.x =   _width;
		if ( this.position.y >   _height ) this.position.y = - _height;
		if ( this.position.y < - _height ) this.position.y =  _height;
		if ( this.position.z >  _depth ) this.position.z = - _depth;
		if ( this.position.z < - _depth ) this.position.z =  _depth;
	}

	this.avoid = function ( target ) {
		var steer = new THREE.Vector3();
		steer.copy( this.position );
		steer.sub( target );

		steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

		return steer;
	}

	this.repulse = function ( target ) {
		var distance = this.position.distanceTo( target );

		if ( distance < 150 ) {
			var steer = new THREE.Vector3();

			steer.subVectors( this.position, target );
			steer.multiplyScalar( 0.5 / distance );

			_acceleration.add( steer );

		}
	}

	this.reach = function ( target, amount ) {
		var steer = new THREE.Vector3();

		steer.subVectors( target, this.position );
		steer.multiplyScalar( amount );

		return steer;
	}

	this.alignment = function ( boids ) {

		var boid, velSum = new THREE.Vector3(),
		count = 0;

		for ( var i = 0, il = boids.length; i < il; i++ ) {
			if ( Math.random() > 0.6 ) continue;
			boid = boids[ i ];

			distance = boid.position.distanceTo( this.position );

			if ( distance > 0 && distance <= _neighborhoodRadius ) {
				velSum.add( boid.velocity );
				count++;
			}
		}

		if ( count > 0 ) {
			velSum.divideScalar( count );
			var l = velSum.length();
			if ( l > _maxSteerForce ) velSum.divideScalar( l / _maxSteerForce );
		}

		return velSum;
	}

	this.cohesion = function ( boids ) {
		var boid, distance,
		posSum = new THREE.Vector3(),
		steer = new THREE.Vector3(),
		count = 0;

		for ( var i = 0, il = boids.length; i < il; i ++ ) {
			if ( Math.random() > 0.6 ) continue;
			boid = boids[ i ];
			distance = boid.position.distanceTo( this.position );
			if ( distance > 0 && distance <= _neighborhoodRadius ) {
				posSum.add( boid.position );
				count++;
			}
		}

		if ( count > 0 ) {
			posSum.divideScalar( count );
		}

		steer.subVectors( posSum, this.position );

		var l = steer.length();

		if ( l > _maxSteerForce ) steer.divideScalar( l / _maxSteerForce );

		return steer;

	}

	this.separation = function ( boids ) {
		var boid, distance,
		posSum = new THREE.Vector3(),
		repulse = new THREE.Vector3();
		for ( var i = 0, il = boids.length; i < il; i ++ ) {
			if ( Math.random() > 0.6 ) continue;
			boid = boids[ i ];
			distance = boid.position.distanceTo( this.position );
			if ( distance > 0 && distance <= _neighborhoodRadius ) {
				repulse.subVectors( this.position, boid.position );
				repulse.normalize();
				repulse.divideScalar( distance );
				posSum.add( repulse );
			}
		}

		return posSum;
	}
}




var camera, scene, renderer;
var birds, halpBird;

var boid, boids;

init();
//animateFlock();

function init() {
	camera = new THREE.PerspectiveCamera( 75, birdsContainerWidth / birdsContainerHeight, 1, 10000 );
	camera.position.z = 450;

	scene = new THREE.Scene();

	birds = [];
	boids = [];

	for ( var i = 0; i < maxBirds; i ++ ) {
		boid = boids[ i ] = new Boid();
		boid.position.x = Math.random() * maxBirds*2 - maxBirds;
		boid.position.y = Math.random() * maxBirds*2 - maxBirds;
		boid.position.z = Math.random() * maxBirds*2 - maxBirds;
		boid.velocity.x = Math.random() * 2 - 1;
		boid.velocity.y = Math.random() * 2 - 1;
		boid.velocity.z = Math.random() * 2 - 1;
		boid.setAvoidWalls( true );
		boid.setWorldSize( 500, 500, 400 );

		halpBird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color: 0xff4772, side: THREE.DoubleSide } ) );
		halpBird.phase = Math.floor( Math.random() * 62.83 );
		scene.add( halpBird );
	}

	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize( birdsContainerWidth, birdsContainerHeight );

	var canvas = renderer.domElement;
	document.getElementById("flockContainer").appendChild(canvas);

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function updatePositionsToNumberOfBirdsInFlock(){
	for ( var i = 0; i < numberOfBirdsInFlock; i ++ ) {
		boid = boids[i];
		boid.position.x = Math.random() * numberOfBirdsInFlock*2 - numberOfBirdsInFlock;
		boid.position.y = Math.random() * numberOfBirdsInFlock*2 - numberOfBirdsInFlock;
		boid.position.z = Math.random() * numberOfBirdsInFlock*2 - numberOfBirdsInFlock;
	}
}

function stopFlockAnimation(){
	window.cancelAnimationFrame(animationRequestID);
}

function animateFlock() {
	animationRequestID = window.requestAnimationFrame( animateFlock );
	renderFlock();
}

function renderFlock() {
	for ( var i = 0, il = numberOfBirdsInFlock; i < il; i++ ) {
		boid = boids[ i ];
		boid.run( boids );

		halpBird = birds[ i ];
		halpBird.position.copy( boids[ i ].position );

		color = halpBird.material.color;
		color.r = color.g = color.b = ( 500 - halpBird.position.z ) / 1000;

		halpBird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
		halpBird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

		halpBird.phase = ( halpBird.phase + ( Math.max( 0, halpBird.rotation.z ) + 0.1 )  ) % 62.83;
		halpBird.geometry.vertices[ 5 ].y = halpBird.geometry.vertices[ 4 ].y = Math.sin( halpBird.phase ) * 5;
	}

	renderer.render( scene, camera );
}