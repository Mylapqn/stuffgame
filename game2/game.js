function Player(id, object) {
	this.ID = id;
	this.velocity = { x: 0, y: 0 };
	this.pos = { x: 0, y: 0 };
	this.oldPos = { x: 0, y: 0 };
	this.playerObject = object;
	this.oldSpeed = 0.3;
	this.speed = 0.3;
	this.initialised = false;
};


var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var players = [];

var userID;

var fps = 60;

var connected = false;
var running = false;

var connection = new WebSocket('wss://all-we-ever-want-is-indecision.herokuapp.com');

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
document.addEventListener("wheel", wheel, false);

function wheel(event) {
	if (event.deltaY < 0) players[0].speed += 0.1;
	if (event.deltaY > 0) {
		if (players[0].speed > 0.1) players[0].speed -= 0.1;
	}
}

connection.onopen = function () {
	console.log("oper");
	connected = true;

}

function keyDown(event) {
	var key = event.key.toUpperCase();
	console.log("key down: " + key);
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

function update() {
	if (running) {
		for (var i = 0; i < players.length; i++) {
			if(players[i].initialised){
				if(i == 0){
					players[i].pos.x = (players[i].pos.x + players[i].velocity.x * players[i].speed * 1000 / fps);
					players[i].pos.y = (players[i].pos.y - players[i].velocity.y * players[i].speed * 1000 / fps);
					if(players[i].oldSpeed != players[i].speed){
						sendSpeed();
						players[i].oldSpeed = players[i].speedoldSpeed;
					}
				}

				/*ctx.beginPath();
				ctx.lineWidth = 3;
				ctx.moveTo(players[i].pos.x + 32, players[i].pos.y + 32);
				ctx.lineTo(players[i].pos.x - 150, players[i].pos.y - 150);
				ctx.stroke();*/

				ctx.lineWidth = 6;
				ctx.strokeStyle = players[i].playerObject.style.backgroundColor;
				ctx.beginPath();
				ctx.moveTo(players[i].oldPos.x, players[i].oldPos.y);
				ctx.lineTo(players[i].pos.x, players[i].pos.y);
				ctx.stroke();

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
connection.onmessage = function (messageRaw) {
	//console.log("message:" + messageRaw.data);
	var message = JSON.parse(messageRaw.data);
	if (message.type == "technical") {
		if (message.subtype == "init") {
			if (!running) {
				addPlayer(message.data);
				sendPos();
				players[0].initialised = true;
				running = true;
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
		}
	}
	if (message.type == "message") {
		if (message.userID != userID) {

			var messageContent = JSON.parse(message.data);
			playerIndex = playerIndexFromID(message.userID);

			if(messageContent.type == "coordinates"){
				playerIndex = playerIndexFromID(message.userID);
				players[playerIndex].pos = JSON.parse(messageContent.data);
				if(!players[playerIndex].initialised){
					players[playerIndex].oldPos.x = players[playerIndex].pos.x;
					players[playerIndex].oldPos.y = players[playerIndex].pos.y;
					players[playerIndex].initialised = true;
				}
			}
			if(messageContent.type == "speed"){
				players[playerIndex].speed = messageContent.data;
			}

		}
	}

}

function sendPos() {
	connection.send(JSON.stringify({type:"coordinates", data:JSON.stringify(players[0].pos)}));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendSpeed() {
	connection.send(JSON.stringify({type:"speed", data:players[0].speed}));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function playerIndexFromID(playerID) {
	for (var i = 0; i < players.length; i++) {
		console.log("Player index from id: scanning index " + i + " for ID " + playerID + ". Found ID: " + players[i].ID);
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
	//npo.style.background = "black";
	var color = { r: (Math.random() * 255), g: (Math.random() * 255), b: (Math.random() * 255) };
	npo.style.backgroundColor = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
	npo.style.color = "rgb(" + (255 - color.r) + "," + (255 - color.g) + "," + (255 - color.b) + ")";
	npo.innerHTML = ID;
	document.getElementById("gameArea").appendChild(npo);
	players.push(new Player(ID, npo));
}
function removePlayer(ID) {
	var index = playerIndexFromID(ID);
	console.log("removing player with ID " + ID);
	document.getElementById("gameArea").removeChild(players[index].playerObject);
	players.splice(index, 1);
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

setInterval(update, 1000 / fps);
