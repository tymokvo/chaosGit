var socket = new WebSocket("ws://localhost:8081");

var stat;		// text tiem
var dataDisplay; // text item

var lineIn;

var dataPoints = new Array(); // array of our datapoint objects

function setup() {
	// createCanvas must be the first statement
	var canvas = createCanvas(1600, 1060, WEBGL);  
	canvas.position(10,10);
	frameRate(24);

	// Camera
	var fov = 15 / 180 * PI;
	var cameraZ = 180;
	perspective(fov, width/height, cameraZ * 0.01, cameraZ * 100);

	// SOCKET
	socket.onopen = openSocket;
	socket.onclose = closeSocket;
	socket.onmessage = newData;
	
	// Status Div
	stat = createDiv("Awaiting Status... ");
	stat.position(1620, 970);

	// Data Div
	dataDisplay = createDiv("data placeholder");
	dataDisplay.position(1620, 50);

	// INPUT
	lineIn = createInput();
	lineIn.position(1620,10);
}

function draw() {
	background(245);   // Set the background to black

	orbitControl();
	translate(0,10,zoom);
	//rotateX(rotate);

	if (dataPoints.length > 0){
		for(instance in dataPoints){
			thePoint = dataPoints[instance];
			stat.html("dataPoints length: " + dataPoints.length + 
				"<br> radiant: " + thePoint.radiant + 
				"<br> position X: " + thePoint.pos.x +
				"<br> position Y: " + thePoint.pos.y +
				"<br> position Z: " + thePoint.pos.z);
			push();
			translate(thePoint.pos.x, thePoint.pos.y, thePoint.pos.z); // in proc, z goes into screen
			fill(thePoint.tc.r,thePoint.tc.g,thePoint.tc.b);
			sphere(abs(0.001*zoom), 6, 6); //radius, numSegs, numSegs
			pop();
		} // add points in this loop, check for dead / outdated points, or fade based on time
	}
}

function openSocket() {
	socket.send("p5: hello websocket");
	stat.html("Socket Open");
}

function closeSocket() {
	stat.html("Socket Closed")
}

function newData(result) {  
	dataDisplay.html(result.data);
	if(result.data[0] == "M"){
		stat.html("Data in...");
		var dtp = dataPoint(result.data); // dataPoint returns object
		dataPoints.push(dtp); // puts object in array of objects
	}
}

var zoom = -1200;
var rotate = 0;

function keyPressed(){
	if(keyCode == ENTER || keyCode == RETURN){
		socket.send(lineIn.value());
		lineIn.value("");
	} else if(keyCode == UP_ARROW){
		zoom += 100;
	} else if (keyCode == DOWN_ARROW){
		zoom -= 100;
	} else if (keyCode == LEFT_ARROW){
		rotate += 0.1;
	} else if (keyCode == RIGHT_ARROW){
		rotate -= 0.1;
	}
}

function dataPoint(data){

	var a = parseFloat(data.slice(data.indexOf("A")+1, data.indexOf("B")));
	var b = parseFloat(data.slice(data.indexOf("B")+1, data.indexOf("D")));
	var distance = parseFloat(data.slice(data.indexOf("D")+1, data.indexOf("R")));
	var radiant = parseFloat(data.slice(data.indexOf("R")+1, data.length));

	var x = sin(radians(b))*cos(radians(-a));
	var y = sin(radians(b))*sin(radians(-a));
	var z = cos(radians(b));

	var pos = {
		"x": -distance*x*100,
		"y": -distance*z*100,
		"z": distance*y*100
	};

	var tempColour = mapTemp(radiant);

	var theDataPoint = {
		"a": a,
		"b": b,
		"distance": distance,
		"radiant": radiant,
		"pos": pos,
		"tc": tempColour
	};

	return theDataPoint;
}

function mapTemp(temp) {

	var tempMid = 26.5;
	var tempLow = 24.0;
	var tempHigh = 29.0;

	var r, g, b; // for colours

	r = map(temp, tempLow, tempHigh, 0, 255);

    if (temp > tempMid) { 
		g = map(temp, tempMid, tempHigh, 255, 0);
	} else if (temp < tempMid) {
		g = map(temp, tempLow, tempMid, 0, 255);
	} else {
		g = 0;
	}

	b = map(temp, tempLow, tempHigh, 255, 0);

	var tempColour = {
		"r": r,
		"b": b,
		"g": g
	};

	return tempColour;
}