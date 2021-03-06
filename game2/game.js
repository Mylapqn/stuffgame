function Player(id, object) {
	this.ID = id;
	this.velocity = { x: 0, y: 0 };
	this.pos = { x: 50, y: 50 };
	this.oldPos = { x: 50, y: 50 };
	this.playerObject = object;
	this.oldSpeed = 0.3;
	this.speed = 0.3;
	this.initialised = false;
	this.color = { r: 0, g: 0, b: 0 };
	this.drawing = true;
};

var gameArea = document.getElementById("gameArea");
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var joystick = document.getElementById("joystick");
var joystickKnob = document.getElementById("joystickKnob");
var joystickRadius = 100;
var joystickBorderWidth = 10;
var joystickKnobRadius;

var touching=false;

var themeCheckbox = document.getElementById("themeSwitch").children[0];

var loadingScreen = document.getElementById("loadingScreen");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gameArea.style.height = window.innerHeight + "px";
document.body.style.height = window.innerHeight + "px";

var players = [];

var userID;

var fps = 60;

var pingTimeout = 0;	
var maxPingTimeout = 5;

var connected = false;
var running = false;

var connection;
connect();
		
setInterval(update, 1000 / fps);
setInterval(sendPing,1000);

var touchStartPos;

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
document.addEventListener("wheel", wheel, false);

function addJoystickListeners() {
	gameArea.addEventListener("touchstart", mouseDown);
	document.addEventListener("touchmove", mouseMove);
	document.addEventListener("touchend", mouseUp);
	gameArea.addEventListener("mousedown", mouseDown);
	document.addEventListener("mousemove", mouseMove);
	document.addEventListener("mouseup", mouseUp);
}


function wheel(event) {
	if (event.deltaY < 0) players[0].speed += 0.1;
	if (event.deltaY > 0) {
		if (players[0].speed > 0.1) players[0].speed -= 0.1;
	}
}

function connect(){
	connection = new WebSocket('wss://all-we-ever-want-is-indecision.herokuapp.com');
	connection.onopen = onConnectionOpen;
	connection.onmessage = onConnectionMessage;
	connection.onclose = function(){
		connected = false;
		running = false;
		loadingScreen.style.display = "flex";
		loadingScreen.style.animation = "startGame 1s cubic-bezier(0.9, 0, 0.7, 1) 0s 1 reverse both";
		loadingScreen.style.animationPlayState = "running";
		setTimeout(function () {
			loadingScreen.style.animationPlayState = "paused";
			removeAllPlayers();
		}, 1000);
	}
}

function onConnectionOpen(){
	pingTimeout = 0;
	console.log("Connection opened");
	connected = true;
}


function keyDown(event) {
	var key = event.key.toUpperCase();
	//console.log("key down: " + key);
	if (key == "W") {
		input("y", 1);
	}
	else if (key == "D") {
		input("x", 1);
	}
	else if (key == "S") {
		input("y", -1);
	}
	else if (key == "A") {
		input("x", -1);
	}
	else if (key == " ") {
		players[0].drawing = !players[0].drawing;
	}
}
function keyUp(event) {
	var key = event.key.toUpperCase();
	if (key == "W") {
		input("y", 0);
	}
	else if (key == "D") {
		input("x", 0);
	}
	else if (key == "S") {
		input("y", 0);
	}
	else if (key == "A") {
		input("x", 0);
	}
}

function mouseDown(event) {
	touching=true;
	//players[0].playerObject.style.backgroundColor="black";
	if (event.touches) {
		touchStartPos = {
			x: event.touches[0].clientX,
			y: event.touches[0].clientY
		}
	}
	else {
		touchStartPos = {
			x: event.clientX,
			y: event.clientY
		};
	}
	joystickRadius=60;
	joystickBorderWidth=10;
	joystickKnobRadius=50;
	if(themeCheckbox.checked){

		joystick.style.borderColor = "rgb(255,255,255,.2)";
		joystickKnob.style.backgroundColor = "rgb(255,255,255,.2)";
	}
	else {
		joystick.style.borderColor = "rgb(0,0,0,.2)";
		joystickKnob.style.backgroundColor = "rgb(0,0,0,.2)";
	}
	joystick.style.display = "block";
	joystick.style.borderWidth = joystickBorderWidth + "px";
	joystick.style.width = joystickRadius*2 + "px";
	joystick.style.height = joystickRadius*2 + "px";
	joystick.style.top = touchStartPos.y - joystickRadius - joystickBorderWidth + "px";
	joystick.style.left = touchStartPos.x - joystickRadius - joystickBorderWidth + "px";
	joystickKnob.style.width = joystickKnobRadius*2 + "px";
	joystickKnob.style.height = joystickKnobRadius*2 + "px";
	joystickKnob.style.top = joystickRadius - joystickKnobRadius + "px";
	joystickKnob.style.left = joystickRadius - joystickKnobRadius + "px";

	joystick.style.opacity="1";
	joystickKnob.style.transition="none";
	joystick.style.transition="none";

}
function mouseMove(event) {
	if (touchStartPos != null) {
		event.preventDefault();

		var touchMove;
		if (event.touches) {
			touchMove = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY
			}
		}
		else {
			touchMove = {
				x: event.clientX,
				y: event.clientY
			};
		}
		var xMove = touchMove.x - touchStartPos.x;
		var yMove = touchMove.y - touchStartPos.y;
		var moveDistance = Math.hypot(xMove, yMove);
		var angle = Math.atan2(xMove, yMove);
		var xNormalized = Math.sin(angle);
		var yNormalized = Math.cos(angle);


		/*joystick.style.width = moveDistance * 2 + "px";
		joystick.style.height = moveDistance * 2 + "px";
		joystick.style.top = touchStartPos.y - moveDistance + "px";
		joystick.style.left = touchStartPos.x - moveDistance + "px";
		joystickKnob.style.top = yMove + moveDistance - 20 + "px";
		joystickKnob.style.left = xMove + moveDistance - 20 + "px";*/

		joystickKnob.style.top = yMove + joystickRadius - joystickKnobRadius + "px";
		joystickKnob.style.left = xMove + joystickRadius - joystickKnobRadius + "px";

		players[0].velocity.x = xNormalized;
		players[0].velocity.y = -yNormalized;
		players[0].speed = moveDistance / 200;

	}
}
function mouseUp(event) {
	touching=false;
	joystickKnob.style.transition="top .3s, left .3s";
	joystick.style.transition="opacity .4s";
	joystick.style.opacity="0";
	joystickKnob.style.top = joystickRadius - joystickKnobRadius + "px";
	joystickKnob.style.left = joystickRadius - joystickKnobRadius + "px";
	setTimeout(function(){
		if(!touching){
			joystickKnob.style.transition="none";
			joystick.style.transition="none";
			joystick.style.display="none";
		}
	},400);
	//joystick.style.display = "none";
	players[0].velocity.x = 0;
	players[0].velocity.y = 0;
	touchStartPos = null;

	//players[0].playerObject.style.backgroundColor="white";
}

function update() {
	if (running) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].initialised) {
				if (i == 0) {
					players[i].pos.x = (players[i].pos.x + players[i].velocity.x * players[i].speed * 1000 / fps);
					players[i].pos.y = (players[i].pos.y - players[i].velocity.y * players[i].speed * 1000 / fps);
					if (players[i].oldSpeed != players[i].speed) {
						sendSpeed();
						players[i].oldSpeed = players[i].speed;
					}
				}

				/*ctx.beginPath();
				ctx.lineWidth = 3;
				ctx.moveTo(players[i].pos.x + 32, players[i].pos.y + 32);
				ctx.lineTo(players[i].pos.x - 150, players[i].pos.y - 150);
				ctx.stroke();*/

				if (players[i].drawing) {
					ctx.lineWidth = (players[i].speed * 5) + 2;
					ctx.strokeStyle = CSScolorAlpha(players[i].color, players[i].speed + 0.1);
					ctx.beginPath();
					ctx.moveTo(players[i].oldPos.x, players[i].oldPos.y);
					ctx.lineTo(players[i].pos.x, players[i].pos.y);
					ctx.stroke();
				}

				players[i].oldPos.x = players[i].pos.x;
				players[i].oldPos.y = players[i].pos.y;

				players[i].playerObject.style.borderWidth = players[i].speed / 0.3 * 10 + "px";

				players[i].playerObject.style.left = players[i].pos.x - 25 - players[i].speed / 0.03 + "px";
				players[i].playerObject.style.top = players[i].pos.y - 25 - players[i].speed / 0.03 + "px";

				/*ctx.beginPath();
				ctx.lineWidth = 3;
				ctx.moveTo(players[i].pos.x + 32, players[i].pos.y + 32);
				ctx.lineTo(players[i].pos.x + 150, players[i].pos.y + 150);
				ctx.stroke();*/
			}
		}
		if (connected) {
			if (players[0].velocity.x != 0 || players[0].velocity.y != 0) {
				sendPos();
			}
		}
	}
}

function onConnectionMessage(messageRaw) {
	//console.log("message:" + messageRaw.data);
	var message = JSON.parse(messageRaw.data);
	if (message.type == "technical") {
		if (message.subtype == "init") {
			if (!running) {
				console.log("Init message received");
				addPlayer(message.data);
				sendPos();
				sendColor();
				sendSpeed();
				gameStart();
				
			}
			if (message.data > 0) {
				for (i = message.data - 1; i >= 0; i--) {
					console.log("Adding previously present player: " + i + ", Current UserID: " + message.data);
					addPlayer(i);
				}
			}
		}
		if (message.subtype == "newUser") {
			if (message.data != userID) {
				console.log("New player: " + message.data + ", UserID: " + userID);
				addPlayer(message.data);
				sendPos();
				sendColor();
				sendSpeed();
			}
		}
		if (message.subtype == "leaveUser") {
			if (message.data != userID) {
				console.log("Leave player: " + message.data + ", UserID: " + userID);
				removePlayer(message.data);
			}
		}
		if (message.subtype == "userID") {
			userID = message.data;
			players[0].ID = userID;
			document.getElementById("userID").innerHTML = userID;
			players[0].playerObject.innerHTML = userID;
		}
		if(message.subtype == "ping"){
			pingTimeout = 0;
			if(message.requestReply){
				//sendPing();
				//Temporary: Disabled due to possible looping pings
			}
		}
	}
	if (message.type == "message") {
		if (message.userID != userID) {

			var messageContent = JSON.parse(message.data);
			playerIndex = playerIndexFromID(message.userID);
			if (players.length >= playerIndex) {
				if (messageContent.type == "coordinates") {
					players[playerIndex].pos = JSON.parse(messageContent.data);
					if (!players[playerIndex].initialised) {
						players[playerIndex].oldPos.x = players[playerIndex].pos.x;
						players[playerIndex].oldPos.y = players[playerIndex].pos.y;
						players[playerIndex].initialised = true;
					}
				}
				if (messageContent.type == "speed") {
					players[playerIndex].speed = messageContent.data;
				}
				if (messageContent.type == "color") {
					receivedColor = JSON.parse(messageContent.data);
					/*players[playerIndex].color.r = messageContent.data.r;
					players[playerIndex].color.g = messageContent.data.g;
					players[playerIndex].color.b = messageContent.data.b;*/
					players[playerIndex].color = receivedColor;
					players[playerIndex].playerObject.style.backgroundColor = CSScolor(players[playerIndex].color);
					players[playerIndex].playerObject.style.borderColor = CSScolorAlpha(players[playerIndex].color,.5);
					players[playerIndex].playerObject.style.color = CSScolor(invertColor(players[playerIndex].color));
				}
			}

		}
	}

}

function themeChange() {
	if (!themeCheckbox.checked) {
		console.log("rer");
		gameArea.style.backgroundColor = "white";
		themeCheckbox.nextElementSibling.style.backgroundColor = "white";
		themeCheckbox.parentElement.style.backgroundColor = "black";
		document.documentElement.style.setProperty('--c', "black");

	}
	else {
		gameArea.style.backgroundColor = "black";
		themeCheckbox.nextElementSibling.style.backgroundColor = "black";
		themeCheckbox.parentElement.style.backgroundColor = "white";
		document.documentElement.style.setProperty('--c', "white");
	}
}

function gameStart() {
	console.log("Game start");

	loadingScreen.style.animation = "startGame 1s cubic-bezier(0.3, 0, 0.1, 1) 0s 2 normal both";
	loadingScreen.style.animationPlayState = "running";
	setTimeout(function () {
		loadingScreen.style.display = "none";
		loadingScreen.style.animationPlayState = "paused";
	}, 1000);
	
	addJoystickListeners();
	if (themeCheckbox.checked) {
		themeChange();
	}

	players[0].initialised = true;
	running = true;
}

function sendPing(){
	pingTimeout++;
	console.log("pingTimeout: " + pingTimeout);

	if(connected) {
		connection.send(JSON.stringify({type:"technical",subtype:"ping",requestReply:true}));
		if(pingTimeout > maxPingTimeout){
			connection.close();
		}
	}

	if(!connected && pingTimeout % 10 == 0){
		console.log("attempting new connection");
		connect();
	}
}

function sendPos() {
	connection.send(JSON.stringify({ type: "coordinates", data: JSON.stringify(players[0].pos) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendSpeed() {
	connection.send(JSON.stringify({ type: "speed", data: players[0].speed }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendColor() {
	connection.send(JSON.stringify({type: "color", data: JSON.stringify(players[0].color) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function playerIndexFromID(playerID) {
	for (var i = 0; i < players.length; i++) {
		//console.log("Player index from id: scanning index " + i + " for ID " + playerID + ". Found ID: " + players[i].ID);
		if (players[i].ID == playerID) {
			return i;
		}
	}
	return null;
}

function addPlayer(ID) {
	console.log("adding player with ID " + ID);
	var npo = document.createElement("div");
	npo.classList.add("player");
	var index = players.push(new Player(ID, npo)) - 1;
	//npo.style.background = "black";
	players[index].color = { r: (Math.random() * 255), g: (Math.random() * 255), b: (Math.random() * 255) };
	npo.style.backgroundColor = CSScolor(players[index].color);
	npo.style.color = CSScolor(invertColor(players[index].color));
	npo.style.borderColor = CSScolorAlpha(players[index].color,.5);
	npo.innerHTML = ID;
	document.getElementById("gameArea").appendChild(npo);
}

function invertColor(color) {
	var inverted = {
		r: 255 - color.r,
		g: 255 - color.g,
		b: 255 - color.b
	}
	return inverted;
}

function CSScolor(color) {
	return ("rgb(" + color.r + "," + color.g + "," + color.b + ")");
}

function CSScolorAlpha(color, alpha) {
	return ("rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")");
}


function removePlayer(ID) {
	var index = playerIndexFromID(ID);
	console.log("removing player with ID " + ID);
	if (index != null){
		if(index >= players.length){
			console.log("cannot find player with ID " + ID);
		}
		else{
			document.getElementById("gameArea").removeChild(players[index].playerObject);
			players.splice(index, 1);
		}
	}
}

function removeAllPlayers(){
	for(var i = 0; i < players.length; i++){
		document.getElementById("gameArea").removeChild(players[i].playerObject);
	}
	players.splice(0, players.length);
}
function input(axis, input) {
	if (axis == "x") {
		players[0].velocity.x = input;
		console.log("velocity X: " + players[0].velocity.x);

	}
	if (axis == "y") {
		players[0].velocity.y = input;
		console.log("velocity Y: " + players[0].velocity.y);
	}
}

