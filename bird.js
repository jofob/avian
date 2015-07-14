//George test comment for git hub

google.maps.event.addDomListener(window, 'load', initialize);

//GLOBAL VARIABLES
//---------------------------//
var curRot = 0; //the current angle of rotation
var mapOptions; //googleMaps built in options
var gmap; // the actual google map
var mapDiv; //the div containing the google map
var zoomLvl = 16; //current zoom level
var winWidth; //width of window
var winHeight; //height of window
var degUnit = 1; //unit of change for rotation on satellite map, in degrees.
var headUnit = 90; //unit of change for aerial view rotation, in degrees. 
var mapLon = -6.2774888 //longitude;
var mapLat = 53.3390956 //latitude;
var momentum = 0;
var momentumLimit = 500;
var flightHasBegun = false;


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
	
	//calling various other setup functions
	centerMap();
	setButtons();
	setInterval(actionLoop, 20);
}

function actionLoop(){
	checkFlap();
	checkFall();
	moveForward();
	
}

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

function getWinDimensions(){
	//gets window inner dimensions and sets to global variables
	//used for ensuring map is centred around correct point
	
	winWidth = window.innerWidth;
	winHeight= window.innerHeight;
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
	
	crl01.onclick = rightUp;
	crl10.onclick = leftUp;
	crl00.onclick = bothDown;
	crl11.onclick = bothUp;
}

function centerMap(){
// sets map to visually correct centre by using window dimensions
// and CSS transformation
	getWinDimensions();
	mapDiv=document.getElementById('map-canvas'); 
	mapDiv.style.transform ="translate("+(-winWidth)+"px,"+(-winHeight)+"px)"
	}
//---------------------------//

	
//BASIC CONTROL FUNCTIONS
//---------------------------//
//these functions supply different parameters to the real control functions//
function rightUp(){
	rwingUp = true;
	lwingUp = false;
}

function leftUp(){
	rwingUp = false;
	lwingUp = true;
}

function bothUp(){
	rwingUp = true;
	lwingUp = true;
}

function bothDown(){
	rwingUp = false;
	lwingUp = false;
}

//---------------------------//

function checkFlap(){
//thus function checks the position of the wings and sets momentum variables 
	var rWingChange = false;
	var lWingChange = false;
	
	if (rwingUp !== rwingPrev){
		rWingChange = true;
	}
	if (lwingUp !== lwingPrev){
		lWingChange = true;
	}
	
	if (rWingChange && lWingChange && (rwingUp == lwingUp)){
	//for each successful flap, add to momentum
		flightHasBegun = true; //marks that the flight has begun
		momentum = momentum + 30;
	} else if (rwingUp && !lwingUp){
		rotateMap("L");
	} else if (lwingUp && !rwingUp){
		rotateMap("R");
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
	}
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
	mapDiv.style.transform="translate("+(-winWidth)+"px,"+(-winHeight)+"px) rotate("+curRot+"deg)";
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
	
	if (zoomLvl > 17){
		curRot = 0;
		mapDiv.style.transform="translate("+(-winWidth)+"px,"+(-winHeight)+"px) rotate(0deg)";
	}
	
	gmap.setZoom(zoomLvl);
		
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
		momentum = momentum -1;
		
	}
}
