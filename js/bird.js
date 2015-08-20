google.maps.event.addDomListener(window, 'load', initialize);

//GLOBAL VARIABLES
//---------------------------//
var curRot = 0; //the current angle of rotation
var mapOptions; //googleMaps built in options
var gmap; // the actual google map
var gmap2;//duplicate map;
var mapDiv; //the div containing the google map
var mapDiv2; //duplicate mapDiv;
var zoomLvl = 16; //current zoom level
var windowW=0; //width of window
var windowH=0; //height of window
var degUnit = 1; //unit of change for rotation on satellite map, in degrees.
var headUnit = 90; //unit of change for aerial view rotation, in degrees. 
var mapLon = -6.258239//longitude;
var mapLat = 53.343278//latitude;
var destinationMarker; //Variable for map marker
var markerNo = 1; //Markers numbered
var icon; //creates variable for the marker image, filled in selectCrow/Dove functions
var markerCrow = 'img/crowFrames/crowFeather.png'; //Images for respective markers
var markerDove = 'img/doveFrames/doveFeather.png';
var momentum = 0;
var momentumLimit = 500;
var flightHasBegun = false; //boolean indicating if the player has started flying yet
var svoverlay; // street view overlay
var flockContainer; // bird flock overlay
var numberOfBirdsInFlock = 200;
var notStreetView = true; 
var panorama; //street view object
var bird; //will store the variety of bird
var birdImg;//animated flying bird
var birdDiv; //holds bird image
var startOverlay; //div containing start selector buttons
var currPath = []; // stores the current path coordinates of the bird
var currPoints=[];// stores current flights markers
var curBirdPath = new google.maps.Polyline();
var loopCount = 0;
var lVal = 0; //left value from arduino
var rVal = 0; //right value from arduino
var lDeg = 0;
var rDeg = 0;
var wingUp = 800;
var crowSongs = ['../music/crow_sample_1.mp3', '../music/dove_sample1.mp3']; //Song arrays in progress
var doveSongs = ['../music/dove_sample1.mp3', '../music/crow_sample_1.mp3']; //To be replaced with full length songs from Sophie


//wing position variables 
var lwingUp = false; //current position of left wing
var rwingUp = false; // current position of right wing
var lwingPrev = false; // previous position of left wing
var rwingPrev = false; // previous position of left wing

//control buttons for testing
var crl01;
var crl11;
var crl00;
var crl10;
var selCrow;
var selDove;
var resetButton;
var squawkButton;
//---------------------------//


function initialize() {
//setup function, mostly created by google api//
	mapOptions = {
	//setting initial map parameters//
		center: { lat: mapLat, lng: mapLon},
		zoom: zoomLvl,
		disableDefaultUI: true,
		scrollwheel: false,
		navigationControl: false,
		mapTypeControl: false,
		scaleControl: false,
		draggable: false,
		disableDoubleClickZoom:true,
		keyboardShortcuts: false,
		tilt:0, //remove this line if we want the 45 degree aerial view 
		mapTypeId: google.maps.MapTypeId.SATELLITE
    };
	//creating the actual map
    gmap = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);
	gmap2 = new google.maps.Map(document.getElementById('map-canvas2'),
		mapOptions);
		
	//assigning street view div;
	svoverlay = document.getElementById("svoverlay");
	//assigning bird flock div
	flockContainer = document.getElementById("flockContainer");
	birdDiv = document.getElementById("birdy");
	//calling various other setup functions
	centerMap();
	setButtons();
	initLocStor();
	//Start bird path at origin position
	currPath.push([mapLon,mapLat]);
	startOverlay = document.getElementById("startHere");
	
}

function start(){
	// triggers the action loop to begin
	setInterval(actionLoop, 20);
}

function actionLoop(){
	ardValToDeg();
	checkFlap();
	checkFall();
	moveForward();
	pointToPath();
	drawCurrPath();
	loopCount++;
}

// listen for arduino values
var socket = io.connect();
socket.on('message', function(data){
	var msg = data.message;
	if (msg.slice(0,1)== "R"){
		rVal = parseInt(msg.slice(1,4));
	} else if (msg.slice(0,1) == "L"){
		lVal = parseInt(msg.slice(1,4));
	}
});


//CONVENIENCE FUNCTIONS
//---------------------------//
function toRad(deg){
//converts degrees to radians
	return deg * (Math.PI/180);
}

function normaliseDeg(){
// converts any number into an angle between 0 and 359
// basically just prevents issues that could occur by providing
// a degree value of 365 instead of 5
	while (curRot >= 360){	
		curRot = curRot - 360;
	} 
	while (curRot < 0){
		curRot = curRot + 360;
	}
}

function ardValToDeg(){
// this function converts arduino sensor values to degrees
//	can be manually calibrated with variables
	var zero = 700;
	var ninety = 850;
	
	var diff = ninety-zero;
	var perDeg = diff/270;
	
	lDeg = (lVal-700)/perDeg;
	if (lDeg < 28){
		lDeg = 28;
	}
	rDeg = (rVal-zero)/perDeg;
	if (rDeg < 28){
		rDeg = 28;
	}
	
}

function setWinDimensions(){
	//gets window inner dimensions and sets to global variables
	//used for ensuring map is centred around correct point
	
	windowW = window.innerWidth;
	windowH = window.innerHeight;
}

function checkAerial(){
//checks to see if the map is in aerial or satellite view.
//returns boolean
	var isAerial = false;
	if (gmap.getTilt() !== 0 ){
		isAerial = true;
	}
	return (isAerial);
}

//---------------------------//
	

//CALCULATION FUNCTIONS
//---------------------------//
function calcLonLat(unit){
//this function will return the change in longitude and latitude based on 
//a specific unit of movement and the angle trajectory
	//first determine the quadrant of movement
	if (momentum !== 0){
		var quad;
		normaliseDeg();
		if (0 <= curRot && curRot < 90 ){
			quad = 4;
		} else if (90 <= curRot && curRot < 180 ){
			quad = 3;
		} else if (180 <= curRot && curRot < 270 ){
			quad = 2;
		} else if (270 <= curRot && curRot < 360 ){
			quad = 1;
		}
		
		
		//using trigonometry and Pythagorean theorem to calculate change in lon & lat
		var uSq = Math.pow(unit,2); //unit squared
		var degRad = toRad(curRot); //angle of trajectory 
		var sA = Math.sin(degRad); //sine of trajectory angle
		var saSq = Math.pow(sA,2); //square of sine of angle
		var delLat = Math.sqrt(Math.abs((saSq*uSq)-uSq));//change in latitude
		var dlSq = Math.pow(delLat,2)//change in latitude squared
		var delLon = Math.sqrt(uSq - dlSq);//change in longitude
		
	
	
		//use quadrant information to determine signs of lon and lat changes
		if (quad == 2){
	
			delLat = (-delLat);
		} else if (quad == 3){
			delLat = (-delLat);
			delLon = (-delLon);
		} else if (quad == 4){
			delLon = (-delLon);
		}
		return ([delLon, delLat]);
	}
}

function movementMomentum(){
//this function will calculate how much the user will move forward based on momentum 
	//limit momentum to momentumLimit
	if (momentum > momentumLimit){
		momentum = momentumLimit;
	}
	
	var zoomDiff =  Math.pow(2,Math.abs(16 - zoomLvl));//getting relative change amount dependent on zoom level
	var unit = ((.00000015)* momentum)/zoomDiff;
	
	return (unit);
}

function rotateMomentum(){
//this function determines how much the bird can turn on zoomed out levels based on momentum
	//limit momentum to momentum limit
	if (momentum > momentumLimit){
		momentum = momentumLimit;
	}
	var unit = (1 / momentumLimit)*momentum;
	return (unit);

}
//---------------------------//


//VARIOUS SETUP FUNCTIONS
//---------------------------//
function setButtons(){
//assigns button dom elements to global variables
//assigns onclick properties
//this is just for testing and will not exist in final program
	crl01 = document.getElementById("01");
	crl11 = document.getElementById("11");
	crl00 = document.getElementById("00");
	crl10 = document.getElementById("10");
	selCrow = document.getElementById("crow");
	selDove = document.getElementById("dove");
	resetButton = document.getElementById("reset");
	squawkButton = document.getElementById("squawk");
	
	crl01.onclick = rightUp;
	crl10.onclick = leftUp;
	crl00.onclick = bothDown;
	crl11.onclick = bothUp;
	selDove.onclick = selectDove;
	selCrow.onclick = selectCrow;
	resetButton.onclick = reset;
	squawkButton.onclick = squawk;
	
}

function reset(){
	storePath();
	storePoints();
	location.reload();
}

function squawk(){
	if(!notStreetView) flockVisible(200);
	var streetPos = new google.maps.LatLng(mapLat, mapLon);
	leaveMark(streetPos);
}

function storePath(){
	var prevPaths;
	if (bird == "crow"){
		prevPaths = JSON.parse(localStorage.getItem("crowPaths"));
	} else if ( bird == "dove"){
		prevPaths = JSON.parse(localStorage.getItem("dovePaths"));
	}
	prevPaths = prevPaths.coords;
	
	while (prevPaths.length > 10){
		prevPaths.shift();
	}
	
	prevPaths.push(currPath);
	
	if (bird == "crow"){
		var prevPathsObj = {
			"coords" : prevPaths
			};
		localStorage.setItem("crowPaths", JSON.stringify(prevPathsObj));
	} else if (bird == "dove"){
		var prevPathsObj = {
			"coords" : prevPaths
			};
		localStorage.setItem("dovePaths", JSON.stringify(prevPathsObj));
	}
}

function storePoints(){
	var prevPoints;
	if (bird =="crow"){
		prevPoints = localStorage.crowPoints;
	} else if(bird == "dove"){
		prevPoints = localStorage.dovePoints;
	}
	prevPoints = JSON.parse(prevPoints);
	prevPoints = prevPoints.coords;
	idx = 0;
	while (idx < currPoints.length) {
		prevPoints.push(currPoints[idx])
		idx++;
	}
	var pointObj = {
		"coords": prevPoints
		};
		
	if (bird == "crow"){
		localStorage.setItem("crowPoints", JSON.stringify (pointObj));
	} else if (bird == "dove"){
		localStorage.setItem("dovePoints", JSON.stringify (pointObj));
	}

}

function centerMap(){
// sets map to visually correct centre by using window dimensions
// and CSS transformation
	setWinDimensions();
	mapDiv=document.getElementById('map-canvas'); 
	mapDiv2=document.getElementById('map-canvas2');
	
	mapDiv.style.transform ="translate("+(-windowW/3)+"px,"+(-windowH)+"px)";
	mapDiv2.style.transform ="translate("+(-windowW/3)+"px,"+(-windowH)+"px)";
	}

function initLocStor(){
//This function checks the local storage on the browser
//If the information contained within is not up to date, reset with starting values
	var avianStatus = localStorage.getItem("avianStatus");
	if ( avianStatus == null ) {
		localStorage.setItem("dovePaths", JSON.stringify(dovePaths));
		localStorage.setItem("crowPaths", JSON.stringify(crowPaths));
		localStorage.setItem("dovePoints", JSON.stringify(dovePoints));
		localStorage.setItem("crowPoints", JSON.stringify(crowPoints));
		localStorage.setItem("avianStatus", "initSet");
	}
	
}
	
function insertBird(){
	birdImg = document.createElement("img");
	birdImg.src = "img/"+ bird + "Frames/down.png";
	birdDiv.appendChild(birdImg);
}
	
function hideStart(){
	startOverlay.style.visibility = "hidden"
	drawPrevPoints();
	drawPrevPaths();
}

function drawPrevPaths(){
//This function draws the previous paths of birds
	var paths;
	if (bird == "crow"){
		var pathobj = JSON.parse(localStorage.getItem("crowPaths"));
	}else if (bird =="dove"){
		var pathobj = JSON.parse(localStorage.getItem("dovePaths"));
	}
	paths = pathobj.coords;
	var idx = (paths.length-1);
	console.log(paths.length);
	var opac = 1;
	while (idx >= 0) {
		var path = paths[idx];
		var pathPoints = [];
		var idx2 = 0;
		while (idx2 < path.length) {
			var coords = path[idx2];
			var cLon = coords[0];
			var cLat = coords[1];
			var point = new google.maps.LatLng(cLat, cLon);
			pathPoints.push(point);
			idx2++;
		}
		idx = idx-1;
		if (bird == "dove"){
			var pathColor="#000000";
		}else{
			var pathColor="#FFFFFF";
		}
		var birdPath = new google.maps.Polyline({
			path: pathPoints,
			geodesic: true,
			strokeColor: pathColor,
			strokeOpacity: opac,
			strokeWeight: 2 
		});
		opac = (opac - .1);
		birdPath.setMap(gmap2);
		
	}
		
}

function drawPrevPoints(){
	var points;
	if (bird == "crow"){
		var pointobj = JSON.parse(localStorage.getItem("crowPoints"));
	}else if (bird =="dove"){
		var pointobj = JSON.parse(localStorage.getItem("dovePoints"));
	}
	points = pointobj.coords;
	console.log(points);
	var idx=0;
	while (idx < points.length){
		var coord = points[idx];
		var lat = coord[0];
		var lon = coord[1];
		var streetPos = new google.maps.LatLng(lat, lon);
		
		destinationMarker = new google.maps.Marker({
		position: streetPos,
		map: gmap2,
		icon: icon,
		title: "marker " + markerNo
		});
		markerNo = markerNo ++;
		idx++;
	}
	
	
}

function senseToWing(){
//This function converts sensor values to wing positions
	if (lVal < wingUp){
		lwingUp = false;
	} else {
		lwingUp = true;
	}
	if (rVal < wingUp){
		rwingUp = false;
	} else {
		rwingUp = true;
	}

}

function pointToPath(){
	if (loopCount % 30 == 0){
		var point = [mapLon, mapLat];
		currPath.push(point);
	}
}	

//---------------------------//

	
//BASIC CONTROL FUNCTIONS
//---------------------------//
//these functions supply different parameters to the real control functions//
function rightUp(){
	rwingUp = true;
	lwingUp = false;
	birdImg.src="img/"+bird+"frames/left.png";
}

function leftUp(){
	rwingUp = false;
	lwingUp = true;
	birdImg.src="img/"+bird+"frames/right.png";
}

function bothUp(){
	rwingUp = true;
	lwingUp = true;
	birdImg.src="img/"+bird+"frames/up.png";
}

function bothDown(){
	rwingUp = false;
	lwingUp = false;
	birdImg.src="img/"+bird+"frames/down.png";
}


function selectDove(){
	bird = "dove";
	icon = markerDove;
	startOverlay.style.opacity="0";
	mapDiv2.setAttribute("class","mapDivDove");
	svoverlay.setAttribute("class","mapDivDove");
	insertBird();
	setTimeout(hideStart, 1000);
	playMusic(doveSongs);
	document.getElementById("wingsLeft").style.backgroundColor = "#373737";
	start();
}

function selectCrow(){
	bird = "crow";
	icon = markerCrow;
	startOverlay.style.opacity="0";
	mapDiv2.setAttribute("class","mapDivCrow");
	svoverlay.setAttribute("class","mapDivCrow");
	insertBird();
	setTimeout(hideStart, 1000);
	playMusic(crowSongs);
	document.getElementById("wingsLeft").style.backgroundColor = "#d2d2d7";
	start();
}


function playMusic(x){
	for(i = 0; i < x.length; i++){
		audio = new Audio(x[i]);
		audio.play();
	};
};


//---------------------------//



function checkFlap(){
//thus function checks the position of the wings and sets momentum variables 
	senseToWing();
	
	var rWingChange = false;
	var lWingChange = false;
	
	if (rwingUp !== rwingPrev){
		rWingChange = true;
	}
	if (lwingUp !== lwingPrev){
		lWingChange = true;
	}
	if (rwingUp && lwingUp){
		birdImg.src="img/"+bird+"frames/up.png";
	}
	if (!rwingUp && !lwingUp){
		birdImg.src="img/"+bird+"frames/down.png";
	}
	if (rWingChange && lWingChange && (rwingUp == lwingUp)){
	//for each successful flap, add to momentum
		flightHasBegun = true; //marks that the flight has begun
		momentum = momentum + 30;
		
	} else if (rwingUp && !lwingUp){
		rotateMap("L");
		birdImg.src="img/"+bird+"frames/left.png";
	} else if (lwingUp && !rwingUp){
		rotateMap("R");
		birdImg.src="img/"+bird+"frames/right.png";
	}
	
	rwingPrev = rwingUp;
	lwingPrev = lwingUp;
}

function checkFall(){
//this function checks the bird's momentum
//if momentum is below lower limit, and the flight has begun, the bird will fall down to the next zoom level
//if momentum is above upper limit, the bird will rise to the next zoom level.
//moving down adds more momentum, moving up costs momentum
	if (momentum < 20 && flightHasBegun && zoomLvl <  20){
		zoomMap("IN");
		momentum = momentum + 200;
	} else if ( momentum > 350 && zoomLvl > 16 ){
		zoomMap("OUT");
		momentum = momentum - 200;
	} else if (momentum == 0 && zoomLvl == 20 && notStreetView){
		streetDrop();
	} else if ( notStreetView == false && momentum > 100){
		takeOff();
	}
}	

function takeOff(){
	svoverlay.style.opacity = "0";
	setTimeout(function(){svoverlay.style.visibility="hidden";},500);
	flockContainer.style.opacity = "0";
	setTimeout(function(){flockContainer.style.visibility="hidden";},500);
	stopFlockAnimation();
	notStreetView = true;
}

function streetDrop(){
//this function drops the user onto the nearest street view
//for now the street view is displayed in a div overlaying the original map
	var streetPos = new google.maps.LatLng(mapLat, mapLon);	
	
	var svOptions = { // Setting street view parameters
		position: streetPos,
		linksControl: false,
		addressControl: false,
		zoomControl: false,
		panControl: false,
		pov: {
			heading: -curRot,
			pitch: 10, 
			}
		};
	panorama = new google.maps.StreetViewPanorama(svoverlay, svOptions);
	if (typeof panorama.projection === 'undefined'){
		console.log("no street info");
	} else {
		gmap.setStreetView(panorama);
		setTimeout(streetViewVisible, 500); //delays making street view visible
		notStreetView = false;
	}
}

function leaveMark(streetPos){
//this function leaves the place mark
	destinationMarker = new google.maps.Marker({
		position: streetPos,
		map: gmap2,
		icon: icon,
		title: "marker " + markerNo
    });
	currPoints.push([mapLat,mapLon]);
	markerNo = markerNo ++;

}

function streetViewVisible(){
	svoverlay.style.visibility = "visible";
	svoverlay.style.opacity = "100"
}

function flockVisible(n){
	numberOfBirdsInFlock = n;
	//updatePositionsToNumberOfBirdsInFlock();
	flockContainer.style.visibility = "visible";
	flockContainer.style.opacity = "100";
	animateFlock();
}

function drawCurrPath(){
	curBirdPath.setMap(null);
	var idx = 0;
	var pathPoints=[];
	while (idx < currPath.length) {
		var coords = currPath[idx];
		var cLon = coords[0];
		var cLat = coords[1];
		var point = new google.maps.LatLng(cLat, cLon);
		pathPoints.push(point);
		idx++;
		}
	//Make current point the last point on the line
		var curPoint = new google.maps.LatLng(mapLat,mapLon);
		pathPoints.push(curPoint);
		curBirdPath = new google.maps.Polyline({
			path: pathPoints,
			geodesic: true,
			strokeColor: '#ffffff',
			strokeOpacity: 0,
			strokeWeight: 0 
		});
		curBirdPath.setMap(gmap);
}

//REAL CONTROL FUNCTIONS
//---------------------------//
function rotateMap(rot){
//this function rotates the map containing div by a specified degree amount
//takes rot rotation direction "L" or "R"
//calls the correct function for rotation based on zoom level
	var aerial = checkAerial();
	
	if (aerial){
		headingRotate(rot);
	} else {
		divRotate(rot);
	}	
}

function headingRotate(rot){
//this function rotates the heading parameter of the google maps
//used for more zoomed in, aerial view 
	var headNorth = 0;
	var headEast = 90;
	var headSouth = 180;
	var headWest = 270;
	
	var heading;
	var amt;
	
	if (rot=="R"){
		amt = -headUnit
	} else if (rot == "L"){
		amt = headUnit
	}
	
	curRot = curRot+amt;
	
	normaliseDeg();
	
	if ( (0 <= curRot && curRot< 45) || ( 315<= curRot)){
			heading = headNorth;
	} else if (45 <= curRot && curRot < 135 ){
		heading = headWest;
	} else if (135 <= curRot && curRot < 225 ){		
		heading = headSouth;
	} else if (225 <= curRot && curRot < 315 ){		
		heading = headEast;
	} 
	
	gmap.setHeading(heading);
}

function divRotate(rot){
//This function rotates the map by rotating the containing div
//used for the zoomed out, sattelite version
	var unit = rotateMomentum();
	var amt;
	if (rot=="R"){
		amt = -unit
	} else if (rot == "L"){
		amt = unit
	}
	curRot = curRot+amt;
	normaliseDeg();
	mapDiv.style.transform="translate("+(-windowW/3)+"px,"+(-windowH)+"px) rotate("+curRot+"deg)";
	mapDiv2.style.transform="translate("+(-windowW/3)+"px,"+(-windowH)+"px) rotate("+curRot+"deg)";
}

function zoomMap(zm){
//sets the zoom level of the map
//limits the zoom amount between 20 and 16 to ensure that the bird doesn't go too high
	var amt;
	if (zm == "IN"){
		amt = 1;
	} else if (zm == "OUT"){
		amt = -1;
	}
	
	zoomLvl = zoomLvl + amt;
	
	if (zoomLvl>20){
		zoomLvl = 20;
	} else if (zoomLvl < 16){
		zoomLvl = 16;
	}
	setTimeout(function(){ 
		gmap.setZoom(zoomLvl-1);
		gmap2.setZoom(zoomLvl)}, 10);
		

}
	
function moveForward(){
	var unit = movementMomentum();
	if (momentum !== 0){
		var lonlat = calcLonLat(unit);
		var delLon = lonlat[0];
		var delLat = lonlat[1];
		
		mapLon = mapLon + delLon;
		mapLat = mapLat + delLat;
		
		gmap.panTo({lat: mapLat, lng: mapLon});
		gmap2.panTo({lat: mapLat, lng: mapLon});
		momentum = momentum -1;	
	}
}
