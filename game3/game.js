//#region OBJECT DEFS


function Player(id) {
	this.name = "unnamed";
	this.ai = false;
	this.id = id;
	this.pos = { x: 200, y: 200 };
	this.rot = 0;
	this.speed = 850;
	this.thrust = 1000;
	this.velocity = { x: 0, y: 0 };
	this.rotationSpeed = 4;
	this.color = { r: 100, g: 80, b: 200 };
	this.hitbox = [];
	this.hp = 10;
	this.maxHp = 10;
	this.trails = [new Trail(this, { x: -20, y: 0 })];
	this.team = 1;
	this.level = 0;
	this.size = 100;
	this.energy = 100;
	this.maxEnergy = 100;
	this.energyRecharge = 15;
	this.shield = 3;
	this.maxShield = 3;
	this.shieldRecharge = .4;
	this.shieldEnergyCost = 20;
	this.shieldEnabled = true;
	this.engineEnergyCost = 5;
	this.shipID = 0;
	this.score = 0;
	this.initialised = false;
	//this.ship = ships[0];
};

function Ship() {
	this.name = "shipName";
	this.id = 0;
	this.speed = 850;
	this.thrust = 1000;
	this.rotationSpeed = 4;
	this.maxHp = 10;
	this.trailPositions = [{ x: -20, y: -10 }, { x: -20, y: 10 }];
	this.size = 100;
	this.maxEnergy = 100;
	this.energyRecharge = 10;
};

function Trail(player, rp) {
	this.points = [];
	this.parent = player;
	this.relativePos = rp;
	this.color = this.parent.color;
	this.thickness = 1;

	//TODO RESET
	//this.maxLength = 1000;

	this.updateInterval = 1 / fps;
	this.maxLength = 4 / this.updateInterval;
	this.lastUpdate = 0;
	this.update = function () {
		var newPos = rotateAroundPoint(this.relativePos, { x: 0, y: 0 }, -this.parent.rot);
		newPos.x += this.parent.pos.x;
		newPos.y += this.parent.pos.y;

		this.lastUpdate += deltaTime;
		//if(this.lastUpdate >= this.updateInterval){
		if (this.points.length < this.maxLength) {
			this.points.push(new TrailPoint(newPos.x, newPos.y, this.maxLength * this.updateInterval));
			//this.points.push(new TrailPoint(this.parent.pos.x,this.parent.pos.y, 5));
		}
		else {
			for (var i = 0; i < this.points.length - 1; i++) {
				this.points[i] = this.points[i + 1];

			}
			this.points[this.points.length - 1] = new TrailPoint(newPos.x, newPos.y, this.maxLength * this.updateInterval);
			//this.points[this.points.length-1] = new TrailPoint(this.parent.pos.x,this.parent.pos.y, 5);
		}
		for (var i = 0; i < this.points.length; i++) {
			this.points[i].age += this.lastUpdate;
			if (this.points[i].age >= this.points[i].maxAge) {

			}
		}
		this.lastUpdate = 0;

		//}
	};
}
function TrailPoint(x, y, maxAge) {
	this.pos = { x: x, y: y };
	this.age = 0;
	this.maxAge = maxAge;
}

function Projectile(shooter) {
	this.id = 0;
	this.guided = false;
	this.shooter = shooter;
	this.target = null;
	this.target;
	this.pos = { x: 50, y: 50 };
	this.velocity = { x: 0, y: 0 };
	this.rot = 0;
	this.speed = 2000;
	this.color = { r: 255, g: 255, b: 255 };
	this.age = 0;
	this.lifetime = 1;
	this.randomSpread = .04;
	this.rotationSpeed = 1;
	this.trail = null;
	this.damage = 1;
}



function Explosion(x, y) {
	this.id = 0;
	this.pos = { x: x, y: y };
	this.lifetime = .3;
	this.age = 0;
	this.radius = 40;
	this.color = { r: 255, g: 255, b: 150 };
}

function Particle(x, y, fadeOpacity, fadeSize, fadeDirection, duration, radius, color, opacity) {
	this.fadeOpacity = fadeOpacity;
	this.fadeSize = fadeSize;
	this.sizeFadeDirection = fadeDirection;
	this.id = frameIndex * 100 + particles.length;
	this.pos = { x: x, y: y };
	this.lifetime = duration;
	this.age = 0;
	this.radius = radius;
	this.opacity = opacity;
	this.color = color;
}

function Sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function (volume) {
		this.sound.currentTime = 0;
		this.sound.volume = volume;
		this.sound.play();
	}
	this.stop = function () {
		this.sound.pause();
	}
}
//#endregion

//#region INIT VARIABLES

var keyAssignVars = { waiting: false, screenOpen: false };
var keySettingsHTML = document.getElementById("keySettings");

var sliderEngine = document.getElementById("sliderEngine");
var sliderWeapons = document.getElementById("sliderWeapons");
var sliderShields = document.getElementById("sliderShields");

var sliderStars = document.getElementById("sliderStars");
var tempStarsAmount = document.getElementById("tempStarsAmount");
var tempFpsCounter = document.getElementById("tempFps");


var shieldColor = { r: 30, g: 150, b: 200 };

var running = false;
var connection;

var soundExplosion = new Sound("sound/explosion.wav");
var soundLaser = new Sound("sound/laser.wav");
var soundHit = new Sound("sound/hit.ogg");
var soundShieldHit = new Sound("sound/shieldHit.mp3");

var frameIndex = 0;

var lastFrame = 0;

var constantDeltaTime = false;

var projectiles = [];
var explosions = [];
var particles = [];

var nextProjectileID = 0;
var nextExplosionID = 0;

var playerHeight = 100;
var playerWidth = 100;

var backgroundImage = new Image();
backgroundImage.src = "images/bg2.png";

var icons = new Array(3);
for (var i = 0; i < icons.length; i++) {
	icons[i] = new Image();
}
icons[0].src = "images/icons/inertialDampening.png";
icons[1].src = "images/icons/shieldEnabled.png";
icons[2].src = "images/icons/alternativeControls.png";


var keyIDs = {};
keyIDs.inertialDampening = 0;
keyIDs.shieldEnabled = 1;
keyIDs.alternativeControls = 2;

var shipName = [
	"Training Ship",
	"Fighter",
	"Interceptor",
	"Bomber",
	"Gunship",
	"Frigate",
	"Light Fighter",
	"Chaser",
	"Photon"
];
var ships = [
	{
		name: "shipOne",
		id: 0,
		trails: [new Trail(this, { x: -20, y: 0 })],
		size: 200,
		image: 0
	},
	{
		name: "shipTwo",
		id: 1,
		trails: [new Trail(this, { x: -20, y: -10 }), new Trail(this, { x: -20, y: 10 })],
		size: 200,
		image: 9
	},
]

loadJSON("ships/trainingShip.json");

var playerImage = [];
var playerImageCount = 9;

for (var i = 0; i < playerImageCount; i++) {
	var img = new Image();
	img.src = 'images/player' + i + '.png';
	playerImage.push(img);
}
console.log(playerImage);

var gameArea = document.getElementById("gameArea");
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d", { alpha: false });

var menu = document.getElementById("menu");
var scoreDisplay = document.getElementById("scoreDisplay");
var costDisplay = document.getElementById("costDisplay");
var shipNameDisplay = document.getElementById("shipNameDisplay");
var nextShipNameDisplay = document.getElementById("nextShipNameDisplay");

var chatMessageArea = document.getElementById("chatMessageContainer");
var chatInput = document.getElementById("chatInput");
var chatSend = document.getElementById("chatSend");

var leaderboardElement = document.getElementById("leaderboard");

var menuOpen = false;

var leaderboardOpen = false;

var upgradeCost = 1;

var localPlayer;
var players = [];

var playerCount = 0;


var loadingScreen = document.getElementById("loadingScreen");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gameArea.style.height = window.innerHeight + "px";
document.body.style.height = window.innerHeight + "px";

var fps = 60;

var fpsCounterFrames = 10;
var fpsCurrentCount = 0;
var fpsCurrentTime = 0;
var currentFps = 60;
var showFps = false;



var shooting = false;
var shootingSecondary = false;

var alternativeControls = false;
var inertialDampening = true;

var shieldEnabled = true;

var enemyCount = 0;
var maxEnemyCount = 0;

var enemySpawnTimer = 0;

var imageData;

var trueDeltaTime = 1 / fps;
var slowMotion = false;
var timeMultiplier = 1;
var deltaTime = trueDeltaTime * timeMultiplier;

var maxCooldown = .2;
var cooldownStart = .1;
var weaponCooldown = maxCooldown;

var enemyCooldown = .2;


var maxVelocityMagnitude;
var velocityMagnitude = 0;
var velocityNormalised = { x: 0, y: 0 };

var lastPos = { x: 0, y: 0 };

var gameOverScreenTimeout = 2;

var pointerDistance = 300;

var zoom = 1;
var maxZoom = 3;
var minZoom = 0.2;
var startZoom = 1;
var targetZoom = 1;
var zoomDuration = 0;
var zoomMaxDuration = .1;
var zoomStep = 1.2;

var screenWorldspace = {
	width: 0,
	height: 0
}

var screenEdges = {
	xmin: 0,
	xmax: 0,
	ymin: 0,
	ymax: 0
}

var hitboxSize = .7;

var colors = {
	white: {
		r: 255,
		g: 255,
		b: 255
	},
	black: {
		r: 0,
		g: 0,
		b: 0
	}

}




var starCount = 20000;
var starsRatio = 2000/starCount;
var starSpeed = 1;
var starSize = 1;
var minStarSize = 1;
var starMargin = {
	x: 4 * screen.width,
	y: 4 * screen.height
};
var stars = new Array(starCount);

for (var i = 0; i < stars.length; i++) {
	stars[i] = {
		x: randomInt(-screen.width / 2 - starMargin.x, screen.width / 2 + starMargin.x),
		y: randomInt(-screen.height / 2 - starMargin.y, screen.height / 2 + starMargin.y),
		z: randomFloat(0.25, 6),
		alpha: randomFloat(0.5, 0.9),
	};
	stars[i].oldX = stars[i].x;
	stars[i].oldX = stars[i].y;


}
for (var i = 0; i < stars.length; i++) {
	if (stars[i].z < 1) stars[i].alpha *= 0.3;
	stars[i].z = 1 / stars[i].z;
	if (stars[i].z < 0.8) stars[i].alpha *= 0.3 + 0.3 * stars[i].z;
}

var cameraPos = { x: 0, y: 0 };
var oldCameraPos = { x: 0, y: 0 };
var cameraDelta = { x: 0, y: 0 };
var cameraMoved = false;

var screenShake = 0;
var screenShakeDecay = 0;



/*var pingSendInterval = 1;
var lastPingSent = 0;
var pingTimeout = 0;
var maxPingTimeout = 15;*/
//#endregion

//#region INIT FUNCTION CALLS


window.onbeforeunload = onGameExit;

var playerName = getQueryVariable("name");
var playerColor = JSON.parse(getQueryVariable("color"));

//setInterval(update, 1000 / fps);
update();

//gameStart();

/*for(var i = 0; i < 3000; i++){
	particles.push(new Particle(randomInt(-canvas.width*3,canvas.width*3),randomInt(-canvas.height*3,canvas.height*3),true,false,1,10,1,{r:255,g:255,b:255},randomFloat(0.2,1)));
}*/

connect();



//#endregion

//#region INPUT

var keyBindings = {
	forward: "W",
	backward: "S",
	left: "A",
	right: "D",
	shoot: " ",
	shootSecondary: "SHIFT",
	switchControls: "E",
	inertialDampening: "Q",
	switchShield: "R",
	constantDeltaTime: "T",
	chat: "ENTER",
	leaderboard: "TAB",
	spawnEnemy: "M",
};

var keyBindNames = {
	forward: "Forward",
	backward: "Backward",
	left: "Left",
	right: "Right",
	shoot: "Shoot",
	shootSecondary: "Shoot Missile",
	switchControls: "Alternative Controls",
	inertialDampening: "Inertial Dampening",
	switchShield: "Turn Shield On/Off",
	constantDeltaTime: "[DEV] Constant Delta Time",
	chat: "Chat",
	leaderboard: "Show Leaderboard",
	spawnEnemy: "[DEV] Spawn Enemy",
};

var mousePos = { x: 0, y: 0 };

gameArea.onmousemove = mouseMove;
gameArea.onmousedown = mouseDown;
document.onmouseup = mouseUp;

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
gameArea.addEventListener("wheel", wheel, false);

chatInput.addEventListener("keydown", chatKeyDown, false);

gameArea.addEventListener('contextmenu', function (evt) {
	if (!alternativeControls) evt.preventDefault();
}, false);



function wheel(event) {
	var oldTargetZoom = targetZoom;
	if (event.deltaY < 0) {
		if (targetZoom <= maxZoom) targetZoom *= zoomStep;
	}
	if (event.deltaY > 0) {
		if (targetZoom >= minZoom) targetZoom /= zoomStep;
	}
	if (targetZoom != oldTargetZoom) {
		zoomDuration = 0;
		startZoom = zoom;
	}
	//console.log("targetZoom:"+targetZoom);
}


inputVelocity = 0;
inputRotation = 0;


function keyDown(event) {
	var key = event.key.toUpperCase();
	//console.log("key down: " + key);
	if (keyAssignVars.waiting) {
		event.preventDefault();
		if (key == "ESCAPE" || key == keyBindings[keyAssignVars.key]) {
			finishKeyAssign();
		}
		else if (Object.values(keyBindings).indexOf(key) < 0) {
			keyBindings[keyAssignVars.key] = key;
			finishKeyAssign();
		}
	}
	else if (document.activeElement != chatInput) {
		if (key == "TAB") {
			event.preventDefault();
		}
		if (!menuOpen) {
			switch (key) {
				case keyBindings.forward:
					inputVelocity = 1;
					break;
				case keyBindings.backward:
					inputVelocity = -1;
					break;
				case keyBindings.left:
					inputRotation = -1;
					break;
				case keyBindings.right:
					inputRotation = 1;
					break;
				case keyBindings.shoot:
					shooting = true;
					break;
				case keyBindings.shootSecondary:
					shootingSecondary = true;
					break;
				case keyBindings.switchControls:
					if (shooting && !alternativeControls) shooting = false;
					alternativeControls = !alternativeControls;
					break;
				case keyBindings.inertialDampening:
					console.log("wetwetwertwet");
					inertialDampening = !inertialDampening;
					break;
				case keyBindings.switchShield:
					shieldEnabled = !shieldEnabled;
					localPlayer.shieldEnabled = shieldEnabled;
					break;
				case keyBindings.constantDeltaTime:
					constantDeltaTime = !constantDeltaTime;
					break;
				case keyBindings.chat:
					chatInput.focus();
					var chatMessageList = chatMessageArea.children;
					for (var i = 0; i < chatMessageList.length; i++) {
						chatMessageList[i].style.display = "block";
						chatMessageList[i].style.animation = "none";
					}
					break;
				case keyBindings.leaderboard:
					leaderboardOpen = !leaderboardOpen;
					if (leaderboardOpen) {
						refreshLeaderboard();
					}
					else {
						leaderboardElement.style.maxHeight = "30px";
						leaderboardElement.style.opacity = ".2";
					}
					break;
				case keyBindings.spawnEnemy:
					maxEnemyCount++;
					enemySpawnTimer = 5;
					break;
			}
		}
		switch (key) {
			case "ESCAPE":
				if (keyAssignVars.screenOpen) closeKeySettings();
				else {
					menuOpen = !menuOpen;
					if (menuOpen) {
						menu.style.display = "flex";
						scoreDisplay.innerHTML = localPlayer.score;
						costDisplay.innerHTML = upgradeCost;
						if (localPlayer.shipID < playerImageCount) {
							shipNameDisplay.innerHTML = shipName[localPlayer.shipID];
							if (localPlayer.shipID < playerImageCount - 1) {
								nextShipNameDisplay.innerHTML = shipName[localPlayer.shipID + 1];
								document.getElementById("nextShipImage").src = playerImage[localPlayer.shipID + 1].src;
							}
						}
					}
					else {
						menu.style.display = "none";
					}
				}
				break;
		}

		if (key == "ESCAPE") {

		}
	}

	/*else if (key == "F") {
		slowMotion = !slowMotion;
		if(slowMotion) timeMultiplier = 1/4;
		else timeMultiplier = 1;
	}*/
}
function keyUp(event) {
	var key = event.key.toUpperCase();
	if (key == keyBindings.forward) {
		if (inputVelocity == 1)
			inputVelocity = 0;
	}
	else if (key == keyBindings.right) {
		if (inputRotation == 1)
			inputRotation = 0;
	}
	else if (key == keyBindings.backward) {
		if (inputVelocity == -1)
			inputVelocity = 0;
	}
	else if (key == keyBindings.left) {
		if (inputRotation == -1)
			inputRotation = 0;
	}
	else if (key == keyBindings.shoot) {
		shooting = false;
	}
	else if (key == keyBindings.shootSecondary) {
		shootingSecondary = false;
	}
}

function mouseDown(event) {
	if (!menuOpen) {
		if (event.button == 0) {
			if (!alternativeControls) shooting = true;
		}
		if (event.button == 2) {
			if (!alternativeControls) inputVelocity = 1;
		}
	}

}
function mouseMove(event) {
	mousePos.x = event.pageX;
	mousePos.y = event.pageY;
}


function mouseUp(event) {
	if (keyAssignVars.waiting) {
		keyAssignVars.waiting = false;
		keyAssignVars.button.innerHTML = keyBindings[keyAssignVars.key];
		keyAssignVars.button.blur();
	}
	if (!menuOpen) {
		if (event.button == 0) {
			if (!alternativeControls) shooting = false;
		}
		if (event.button == 2) {
			if (!alternativeControls) inputVelocity = 0;
		}
	}
}

function chatKeyDown(event) {
	var key = event.key.toUpperCase();
	if (key == keyBindings.chat) {
		if (chatInput == document.activeElement) {
			sendChat();
		}
	}
	if (key == keyBindings.chat) {
		/*var messages = document.getElementsByClassName('chatMessage');
		for (var i = 0; i < messages.length; i++) {
			messages[i].style.display = ""; 
		}*/
		event.stopPropagation();
		chatInput.blur();
		gameArea.focus();


	}
}

chatInput.addEventListener("blur", function (e) {
	var chatMessageList = chatMessageArea.children;
	for (var i = 0; i < chatMessageList.length; i++) {
		chatMessageList[i].style.display = "";
		chatMessageList[i].style.animation = "";
		chatMessageList[i].style.animationDuration = "1s";
	}
});

//#endregion

//#region NETWORK FUNCTIONS

function connect() {
	connection = new WebSocket('wss://all-we-ever-want-is-indecision.herokuapp.com');
	connection.onopen = onConnectionOpen;
	connection.onmessage = onConnectionMessage;
	connection.onclose = function (e) {
		//console.log("Connection closed, last ping sent " + lastPingSent + " s ago.");
		console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
		connected = false;
		running = false;
		loadingScreen.style.display = "flex";
		loadingScreen.style.animation = "startGame 1s cubic-bezier(0.9, 0, 0.7, 1) 0s 1 reverse both";
		loadingScreen.style.animationPlayState = "running";
		/*setTimeout(function () {
			loadingScreen.style.animationPlayState = "paused";
			removeAllPlayers();
		}, 1000);*/
	}
}

function onConnectionOpen() {
	pingTimeout = 0;
	console.log("Connection opened");
	connected = true;
}

function onConnectionMessage(messageRaw) {
	//console.log("message:" + messageRaw.data);
	var message = JSON.parse(messageRaw.data);
	if (message.type == "technical") {
		if (message.subtype == "init") {
			if (!running) {
				console.log("Init message received");
				//addPlayer(message.data);
				localPlayer = addPlayer(false);
				localPlayer.initialised = true;
				console.log(localPlayer.color);

				var cookie = document.cookie;
				if (cookie != "") {
					console.log("Found Cookie: " + cookie);
					//alert(cookie);
				}

				if (playerColor)
					localPlayer.color = playerColor;

				if (playerName) {
					localPlayer.name = playerName;
					connection.send(JSON.stringify({ type: "technical", subtype: "initData", name: playerName, color: localPlayer.color }));
				}
				else if (cookie != "") {
					var n = getCookie("playerName");
					if (n != "") {
						playerName = n;
						localPlayer.name = playerName;
						connection.send(JSON.stringify({ type: "technical", subtype: "initData", name: playerName, color: localPlayer.color }));
					}

				}
				else {
					connection.send(JSON.stringify({ type: "technical", subtype: "initData", name: localPlayer.name, color: localPlayer.color }));
				}

				if (cookie != "") {
					var cookieScore = getCookie("playerScore");
					var cookieLevel = getCookie("playerLevel");
					if (cookieScore != "") {
						localPlayer.score = parseInt(cookieScore);
					}
					if (cookieLevel != "") {
						localPlayer.level = parseInt(cookieLevel);
					}
				}


				document.documentElement.style.setProperty('--playerColor', CSScolor(localPlayer.color));

				if (colorLuminance(localPlayer.color) > 128) {
					document.documentElement.style.setProperty('--textColor', "black");
					document.documentElement.style.setProperty('--invertedTextColor', "white");
				}
				else {
					document.documentElement.style.setProperty('--textColor', "white");
					document.documentElement.style.setProperty('--invertedTextColor', "black");
				}

				console.log("Added Local Player with ID " + localPlayer.id);
				/*sendPos();
				sendColor();
				sendSpeed();*/



			}
		}
		if (message.subtype == "start") {
			sendPlayerData();
			gameStart();
		}
		if (message.subtype == "playerIDs") {
			var ids = message.data.split(',');
			console.log("PlayerIDs message. Content: " + message.data);
			if (ids.length > 1) {
				for (i = 0; i < ids.length; i++) {
					if (ids[i] != localPlayer.id) {
						console.log("Adding previously present player with UserID: " + ids[i]);
						var newP = addPlayer(false);
						newP.id = ids[i];
					}
				}
			}
		}
		if (message.subtype == "newUser") {

			if (message.data != localPlayer.id) {
				console.log("New player: " + message.data + ", UserID: " + message.data);
				var newPlayer = addPlayer(false);

				newPlayer.id = message.data;
				newPlayer.team = message.data;
				newPlayer.name = message.name;
				newPlayer.color = message.color;
				console.log("Assigned ID: " + newPlayer.id);
				addChatMessage("Player " + message.name + " joined the game.", null, newPlayer.color);

				sendPlayerData();
				if (leaderboardOpen)
					refreshLeaderboard();
			}
		}
		if (message.subtype == "leaveUser") {
			if (message.data != localPlayer.id) {
				var leftPlayer = findPlayerWithID(message.data);
				addChatMessage("Player " + leftPlayer.name + " left the game.", null, leftPlayer.color);
				console.log("Leave player: " + message.data + ", UserID: " + localPlayer.id);
				//removePlayer(message.data);
				removeIDFromArray(players, message.data);
				if (leaderboardOpen)
					refreshLeaderboard();
			}
		}
		if (message.subtype == "userID") {
			console.log("New local ID: " + message.data);
			localPlayer.id = message.data;
			localPlayer.team = message.data;
		}
		if (message.subtype == "userCount") {
			console.log("New user Count: " + message.data);
			playerCount = message.data;
			if (message.data > 2)
				chatInput.placeholder = "Chat with " + (playerCount - 1) + " other players";
			else if (message.data > 1)
				chatInput.placeholder = "Chat with " + (playerCount - 1) + " other player";
			else if (message.data == 1)
				chatInput.placeholder = "Chat with yourself. You're alone here.";
		}
		/*if(message.subtype == "ping"){
			console.log("Received ping after " + pingTimeout + " s");
			pingTimeout = 0;
			if(message.requestReply){
				//sendPing();
				//Temporary: Disabled due to possible looping pings
			}
		}*/
	}
	if (message.type == "message") {
		var messageContent = JSON.parse(message.data);
		var messageData = JSON.parse(messageContent.data);
		if (message.userID != localPlayer.id) {
			player = findPlayerWithID(message.userID);

			if (player != null) {
				if (messageContent.type == "coordinates") {
					var oldPos = { x: player.pos.x, y: player.pos.y };
					player.pos = JSON.parse(messageData.pos);
					player.rot = messageData.rot;
					player.velocity = { x: player.pos.x - oldPos.x, y: player.pos.y - oldPos.y };
					player.velocity.x *= 60;
					player.velocity.y *= 60;
					player.initialised = true;

					/*if (!players[playerIndex].initialised) {
						players[playerIndex].oldPos.x = players[playerIndex].pos.x;
						players[playerIndex].oldPos.y = players[playerIndex].pos.y;
						players[playerIndex].initialised = true;
					}*/
				}
				if (messageContent.type == "velocity") {
					player.velocity = JSON.parse(messageData.velocity);
					player.rot = messageData.rot;
					/*if (!players[playerIndex].initialised) {
						players[playerIndex].oldPos.x = players[playerIndex].pos.x;
						players[playerIndex].oldPos.y = players[playerIndex].pos.y;
						players[playerIndex].initialised = true;
					}*/
				}
				/*if (messageContent.type == "speed") {
					players[playerIndex].speed = messageContent.data;
				}*/
				if (messageContent.type == "color") {
					var receivedColor = JSON.parse(messageData.color);
					player.color = receivedColor;
				}
				if (messageContent.type == "death") {
					player.hp = 0;
					//PLAYER DEATH
					createExplosion(player.pos.x, player.pos.y, 20);
					player.speed = 0;
					console.log("team of dead: " + player.team + " team of local: " + localPlayer.team);
					if (messageData.killer == localPlayer.id) {
						localPlayer.score += player.level + 1;
						sendScore();
					}
					if (leaderboardOpen)
						refreshLeaderboard();
					addChatMessage(player.name + " was killed by " + findPlayerWithID(messageData.killer).name, null, localPlayer.color);
					removeIDFromArray(players, player.id);

				}
				if (messageContent.type == "hit") {
					removeIDFromArray(projectiles, messageData.projectileID);
					if (messageData.shield) {
						soundShieldHit.play(.15);
					}
					else {
						player.hp -= 1;
						soundHit.play(.15);
					}
					createExplosion(player.pos.x, player.pos.y, 1);
					console.log("team of hit: " + player.team + " team of local: " + localPlayer.team);

				}
				if (messageContent.type == "hp") {
					player.hp = messageData.hp;
					player.maxHp = messageData.maxHp;
					player.shield = messageData.shield;
					player.maxShield = messageData.maxShield;
					player.shieldEnabled = messageData.shieldEnabled;
					//player.level = messageData.level;


				}
				if (messageContent.type == "level") {
					player.level = messageData.level;
					player.size = messageData.size;
					player.shipID = messageData.shipID;


				}
				if (messageContent.type == "name") {

					player.name = messageData.name;


				}
				if (messageContent.type == "score") {

					player.score = messageData.score;


				}



			}

		}
		if (messageContent.type == "chat") {
			player = findPlayerWithID(message.userID);
			if (player != null)
				addChatMessage(messageData.text, player);


		}
		if (messageContent.type == "shoot") {
			var shootPos = JSON.parse(messageData.pos);
			var shooterID = messageData.shooter;
			var shootVelocity = JSON.parse(messageData.velocity);
			var shootRot = messageData.rot;
			var damage = messageData.dmg;
			console.log("receiving shoot from ID " + shooterID);
			spawnProjectile(shootPos, shootRot, shootVelocity, shooterID, damage);
		}
	}

}

//#region SEND FUNCTIONS

function sendPos() {
	connection.send(JSON.stringify({ type: "coordinates", data: JSON.stringify({ pos: JSON.stringify(localPlayer.pos), rot: localPlayer.rot }) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendSpeed() {
	connection.send(JSON.stringify({ type: "velocity", data: JSON.stringify({ velocity: JSON.stringify(localPlayer.velocity), rot: localPlayer.rot }) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendColor() {
	connection.send(JSON.stringify({ type: "color", data: JSON.stringify({ color: JSON.stringify(localPlayer.color) }) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendPlayerData() {
	sendPos();
	sendSpeed();
	sendColor();
	sendHP();
	sendName();
	sendLevel();
	sendScore();
}

function sendProjectile(pos, rot, velocity, shooter, dmg) {
	connection.send(JSON.stringify({ type: "shoot", data: JSON.stringify({ pos: JSON.stringify(pos), rot: rot, velocity: JSON.stringify(velocity), shooter: shooter, dmg: dmg }) }));
	//console.log("sending shoot from ID " + shooter);
}

function sendDeath(id, killer) {
	connection.send(JSON.stringify({ type: "death", data: JSON.stringify({ id: id, killer: killer }) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}
function sendScore() {
	connection.send(JSON.stringify({ type: "score", data: JSON.stringify({ score: localPlayer.score }) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}
function sendHit(id, pid, shield) {
	connection.send(JSON.stringify({ type: "hit", data: JSON.stringify({ id: id, projectileID: pid, shield: shield }) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}
function sendHP() {
	connection.send(JSON.stringify({ type: "hp", data: JSON.stringify({ hp: localPlayer.hp, maxHp: localPlayer.maxHp, shield: localPlayer.shield, maxShield: localPlayer.maxShield, shieldEnabled: shieldEnabled }) }));
}
function sendLevel() {
	connection.send(JSON.stringify({ type: "level", data: JSON.stringify({ level: localPlayer.level, size: localPlayer.size, shipID: localPlayer.shipID }) }));
}
function sendName() {
	connection.send(JSON.stringify({ type: "name", data: JSON.stringify({ name: localPlayer.name }) }));
}
/*function sendPing(){
	pingTimeout+=trueDeltaTime;
	lastPingSent+=trueDeltaTime;
	//console.log("pingTimeout: " + pingTimeout);

	if(connected && lastPingSent >= pingSendInterval) {
		connection.send(JSON.stringify({type:"technical",subtype:"ping",requestReply:true}));
		console.log("Sending ping after " + pingTimeout + " s");
		lastPingSent = 0;

		if(pingTimeout > maxPingTimeout){
			console.log("Disconnecting after " + pingTimeout + " s of no response");
			connection.close();
		}
	}

	if(!connected && pingTimeout % 1 <= 0.1){
		console.log("attempting new connection");
		connect();
	}
}*/
function sendChat() {
	var msg = chatInput.value;
	if (msg.trim() != "") {
		chatInput.value = null;
		connection.send(JSON.stringify({ type: "chat", data: JSON.stringify({ text: msg }) }));
	}

}
//#endregion

//#endregion

//#region GAME FUNCTIONS

function addPlayer(ai) {
	var p = new Player(players.length);
	//p.id = players.length;
	p.ai = ai;
	p.color = { r: randomInt(50, 255), g: randomInt(50, 255), b: randomInt(50, 255) };


	if (ai) {
		p.color = { r: 250, g: 0, b: 0 };
		p.speed = 400;
		p.rotationSpeed = 3;
		p.hp = 4;
		p.maxHp = 4;
		p.name = "AI"
		console.log("Added AI player with ID" + p.id);
	}
	players.push(p);

	return p;
}

function createExplosion(x, y, size) {
	var e = new Explosion(x, y);
	e.id = explosions.push(e) - 1;
	e.id = nextExplosionID;
	nextExplosionID++;
	e.color = { r: randomInt(200, 255), g: randomInt(40, 200), b: randomInt(0, 80) };
	e.radius = 40 * size;
	e.lifetime = 0.3 * Math.sqrt(size);
	if (size > 1) {
		soundExplosion.play(1);
		//shakeScreen(10, 2);
	}

	while (size > 2) {
		createExplosion(x + randomInt(-100, 100), y + randomInt(-100, 100), randomFloat(0.5, 2.5));
		//setTimeout(function(){createExplosion(x + randomInt(-100,100),y + randomInt(-100,100),randomFloat(0.5,2.5));},randomInt(0,100));
		size -= 1;
	}
}

function createParticle(x, y, size) {
	var e = new Explosion(x, y);
	e.id = explosions.push(e) - 1;
	e.id = nextExplosionID;
	nextExplosionID++;
	e.color = { r: randomInt(200, 255), g: randomInt(40, 200), b: randomInt(0, 80) };
	e.radius = 40 * size;
	e.lifetime = 0.3 * Math.sqrt(size);
	while (size > 2) {
		createExplosion(x + randomInt(-100, 100), y + randomInt(-100, 100), randomFloat(0.5, 2.5));
		//setTimeout(function(){createExplosion(x + randomInt(-100,100),y + randomInt(-100,100),randomFloat(0.5,2.5));},randomInt(0,100));
		size -= 1;
	}
}

function shootProjectile(shooter) {
	/*var p = new Projectile(shooter);
	p.pos.x=shooter.pos.x;
	p.pos.y=shooter.pos.y;
	p.rot=shooter.rot;

	

	p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = shooter.color;
	p.id = projectiles.push(p)-1;
	p.id = nextProjectileID;
	nextProjectileID++;
	p.lifetime = randomFloat(0.9,1,1);
	soundLaser.play(.3);*/

	var pv = { x: shooter.velocity.x, y: shooter.velocity.y };
	if (shooter.ai) console.log("pv", pv);

	pv.x += Math.cos(shooter.rot) * 1500;
	pv.y += Math.sin(shooter.rot) * 1500;
	sendProjectile(shooter.pos, shooter.rot, pv, shooter.id, 1);

}


function spawnProjectile(pos, rot, velocity, shooterID, dmg) {
	var shooter = findPlayerWithID(shooterID);
	var p = new Projectile(shooter);
	p.pos.x = pos.x;
	p.pos.y = pos.y;
	p.rot = rot;
	p.guided = false;
	p.velocity.x = velocity.x;
	p.velocity.y = velocity.y;
	p.damage = dmg;
	//console.log("shooting",velocity);



	//p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = shooter.color;
	p.id = projectiles.push(p) - 1;
	p.id = nextProjectileID;
	nextProjectileID++;
	p.lifetime = randomFloat(0.9, 1, 1);
	soundLaser.play(.3);
}

function shootGuidedProjectile(shooter, target) {
	var p = new Projectile(shooter);
	p.pos.x = shooter.pos.x;
	p.pos.y = shooter.pos.y;
	p.rot = shooter.rot;
	p.guided = true;
	p.speed = 100;
	p.target = target;
	p.rotationSpeed = 2.5;



	p.rot += (Math.random() * 2 - 1) * p.randomSpread;
	p.color = shooter.color;
	p.id = projectiles.push(p) - 1;
	p.id = nextProjectileID;
	nextProjectileID++;
	p.lifetime = 2;
	p.trail = new Trail(p);
	p.trail.thickness = .5;
	p.trail.maxLength = 50;
	p.trail.color = { r: 230, g: 100, b: 0 };
}

function shootAtTarget(shooter, target) {
	var p = new Projectile(shooter);
	p.rot = shooter.rot;
	p.pos.x = shooter.pos.x;
	p.pos.y = shooter.pos.y;

	//p.speed = 1000;
	var distanceToTarget = distancePos(target, p);
	var timeToTarget = distanceToTarget / p.speed;

	var predictedTargetPos = { x: target.pos.x + target.velocity.x / deltaTime * timeToTarget, y: target.pos.y + target.velocity.y / deltaTime * timeToTarget };

	//p.rot = Math.atan2(target.pos.y-p.pos.y,target.pos.x-p.pos.x);

	//p.rot = Math.atan2(predictedTargetPos.y-p.pos.y,predictedTargetPos.x-p.pos.x);

	p.randomSpread = 0.2;

	p.rot += (Math.random() * 2 - 1) * p.randomSpread;
	p.color = { r: 255, g: 0, b: 0 };
	p.color = shooter.color;
	p.lifetime = randomFloat(1.4, 1.6);
	if (p.lifetime >= timeToTarget) {
		p.id = projectiles.push(p) - 1;
		p.id = nextProjectileID;
		nextProjectileID++;
		soundLaser.play(.3);
	}
}

function addChatMessage(text, player, color) {
	var newMsg = document.createElement("div");
	newMsg.classList.add("chatMessage");
	if (player != null) {
		var msgName = document.createElement("span");
		newMsg.appendChild(msgName);
		msgName.innerHTML = player.name;
		msgName.style.color = CSScolor(player.color);
		newMsg.innerHTML += ": ";
	}
	else {
		if (color != null) {
			newMsg.style.color = CSScolor(color);
		}
		else {
			newMsg.style.color = CSScolor(localPlayer.color);
		}
	}
	newMsg.appendChild(document.createTextNode(text));
	chatMessageArea.appendChild(newMsg);
	newMsg.setAttribute("animation-finished", "0");
	newMsg.addEventListener('animationend', function (e) {
		newMsg.style.display = "none";
	}, {
		capture: false,
		once: false,
		passive: false
	});
}

function upgrade(choice) {
	if (localPlayer.score >= upgradeCost) {
		if (localPlayer.shipID == 0 || (localPlayer.shipID <= 5 && choice == 1) || (localPlayer.shipID > 5 && choice == 2)) {
			localPlayer.score -= upgradeCost;
			upgradeCost++;
			localPlayer.thrust += 200;
			localPlayer.rotationSpeed += 0.5;
			maxCooldown *= .9;
			localPlayer.maxHp++;
			localPlayer.hp++;
			localPlayer.level++;
			localPlayer.maxEnergy += 20;
			localPlayer.energyRecharge += 2;
			localPlayer.maxShield += 1;
			localPlayer.shield += 1;
			localPlayer.shieldRecharge += .1;
			localPlayer.shieldEnergyCost += 3;
			scoreDisplay.innerHTML = localPlayer.score;
			costDisplay.innerHTML = upgradeCost;


			var max = playerImageCount - 1;
			if (choice == 1) {
				localPlayer.shipID = 0 + localPlayer.level;
				var max = 5;
			}
			if (choice == 2) {
				localPlayer.shipID = 5 + localPlayer.level;
				var max = 8;
			}


			if (localPlayer.shipID < playerImageCount) {
				shipNameDisplay.innerHTML = shipName[localPlayer.shipID];
				if (localPlayer.shipID < playerImageCount - 1) {
					nextShipNameDisplay.innerHTML = shipName[localPlayer.shipID + 1];
					document.getElementById("nextShipImage").src = playerImage[localPlayer.shipID + 1].src;
				}
			}



			var pImg = playerImage[localPlayer.shipID];
			if (localPlayer.shipID > max) {
				var pImg = playerImage[max];
				localPlayer.shipID = max;
			}
			document.getElementById("shipImage").src = pImg.src;
			if (localPlayer.shipID == 3) {
				localPlayer.trails = [new Trail(localPlayer, { x: -28, y: 0 })];
			}
			if (localPlayer.shipID == 5) {
				localPlayer.trails = [new Trail(localPlayer, { x: -70, y: 0 })];
				localPlayer.size = 200;
			}
			if (localPlayer.shipID == 6) {
				localPlayer.trails = [new Trail(localPlayer, { x: -20, y: 0 }), new Trail(localPlayer, { x: -20, y: -33 }), new Trail(localPlayer, { x: -20, y: 33 })];
			}
			if (localPlayer.shipID == 7) {
				localPlayer.trails = [new Trail(localPlayer, { x: -22, y: 0 }), new Trail(localPlayer, { x: -22, y: -33 }), new Trail(localPlayer, { x: -22, y: 33 }), new Trail(localPlayer, { x: 13, y: -18 }), new Trail(localPlayer, { x: 13, y: 18 })];
			}
			if (localPlayer.shipID == 8) {
				localPlayer.trails = [new Trail(localPlayer, { x: -20, y: 0 }), new Trail(localPlayer, { x: -16, y: -20 }), new Trail(localPlayer, { x: -16, y: 20 }), new Trail(localPlayer, { x: -23, y: -47 }), new Trail(localPlayer, { x: -23, y: 47 })];
			}
			sendLevel();
			sendScore();
		}
	}
}

function shakeScreen(strength, duration) {
	screenShake = strength;
	screenShakeDecay = strength / duration;
}


//#endregion

//#region UPDATE
function update(timestamp) {
	//console.log("frame");
	if (running) {


		//#region INIT

		//TODO: DELTATIME
		if (frameIndex == 0) lastFrame = Date.now();
		trueDeltaTime = (Date.now() - lastFrame) / 1000;

		if (constantDeltaTime) trueDeltaTime = 1 / 60;

		deltaTime = trueDeltaTime * timeMultiplier;

		lastFrame = Date.now();
		//TODO: DELTATIME
		frameIndex++;
		fpsCurrentCount++;
		fpsCurrentTime += trueDeltaTime;
		if (fpsCurrentCount >= fpsCounterFrames) {
			fpsCurrentCount = 0;
			currentFps = fpsCurrentTime;
			fpsCurrentTime = 0;

		}

		if (connected) {
			//sendPing();
			sendHP();
			if (localPlayer.hp > 0)
				sendPos();
		}

		mouseWorldPos = screenToWorldCoords(mousePos);

		ctx.translate(lastPos.x, lastPos.y);


		//#endregion


		//#region LOCAL PLAYER MOVEMENT

		updateLocalMovement();

		//#endregion

		//#region CAMERA MOVEMENT
		if (zoom != targetZoom && zoomDuration < zoomMaxDuration) {
			zoomDuration += deltaTime;
			if (zoomDuration > zoomMaxDuration) zoomDuration = zoomMaxDuration;
			zoom = startZoom + (targetZoom - startZoom) * zoomDuration / zoomMaxDuration;
			//console.log(zoomDuration / zoomMaxDuration);
		}

		oldCameraPos.x = cameraPos.x;
		oldCameraPos.y = cameraPos.y;
		cameraPos.x = localPlayer.pos.x;
		cameraPos.y = localPlayer.pos.y;
		if (screenShake > 0) {
			cameraPos.x += randomFloat(-screenShake, screenShake);
			cameraPos.y += randomFloat(-screenShake, screenShake);
			screenShake -= screenShakeDecay * deltaTime;
			if (screenShake < 0) screenShake = 0;
		}
		cameraDelta.x = cameraPos.x - oldCameraPos.x;
		cameraDelta.y = cameraPos.y - oldCameraPos.y;
		//#endregion

		//#region HITBOX CALCULATION
		updateCalcHitboxes();
		//#endregion


		//#region SCREEN SPACE BG FX
		updateScreenspaceBg();
		//#endregion

		//#region WORLD SPACE BG FX
		updateWorldspaceBg();
		//#endregion


		//#region ENEMY SPAWNING

		if (enemyCount < maxEnemyCount) {
			enemySpawnTimer += deltaTime;
			if (enemySpawnTimer > 5) {
				var aip = addPlayer(true);
				aip.team = 2;
				enemyCount++;
				enemySpawnTimer = 0;
			}
		}

		enemyCooldown -= deltaTime;


		//#endregion


		//#region LOCAL SHOOTING
		updateShooting();
		//#endregion

		//#region PLAYERS AI
		for (var i = 0; i < players.length; i++) {
			var p = players[i];
			if (p.ai && p.hp > 0) {
				rotateToTarget(p, { pos: predictTargetPos(p, localPlayer, 1000) });

				var distance = distancePos(localPlayer, p);

				var slowingDistance = 700;
				var stoppingDistance = 400;
				var targetThrust = 0;

				if (distance > slowingDistance) {
					targetThrust = 1;
				}
				else if (distance < stoppingDistance) {
					targetThrust = 0;
				}
				else {
					targetThrust = (distance - stoppingDistance) / (slowingDistance - stoppingDistance);
				}

				p.pos.x += Math.cos(p.rot) * 1 * p.speed * deltaTime * targetThrust;
				p.pos.y += Math.sin(p.rot) * 1 * p.speed * deltaTime * targetThrust;
				if (enemyCooldown <= 0 && distance < 2000) {
					shootProjectile(p);
				}
			}
		}

		if (enemyCooldown <= 0) {
			enemyCooldown = .2;
		}
		//#endregion


		//#region DRAW PLAYERS
		updateDrawPlayers();

		//#endregion

		//#region DRAW HITBOXES
		
		//updateDrawHitboxes();

		//#endregion

		//#region PROJECTILES LOOP
		updateProjectiles();
		//#endregion

		//#region EXPLOSIONS LOOP
		updateExplosions();
		//#endregion

		//#region PARTICLES LOOP
		updateParticles();
		//#endregion


		//#region DRAW HUD

		ctx.translate(lastPos.x, lastPos.y);

		ctx.scale(1 / zoom, 1 / zoom);
		/*
		ctx.lineWidth = 1;
		ctx.strokeStyle="gray";
		ctx.beginPath();
		ctx.moveTo(80, 50);
		ctx.lineTo(80 + 300, 50);
		ctx.stroke();
		ctx.lineWidth = 4;
		ctx.strokeStyle=CSScolor(localPlayer.color);
		ctx.beginPath();
		ctx.arc(50, 50,30,-Math.PI/2,(weaponCooldown/cooldownStart*2*Math.PI)-Math.PI/2);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(80, 50);
		ctx.lineTo(80 + localPlayer.hp*30, 50);
		ctx.stroke();
		ctx.lineWidth = 1;
		*/


		//#region DEATH SCREEN
		if (localPlayer.hp <= 0) {
			if (gameOverScreenTimeout <= 0) {
				console.log("HP: ", localPlayer.hp);
				ctx.fillStyle = CSScolor({ r: 0, g: 0, b: 0 });
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = CSScolor({ r: 80, g: 80, b: 80 });
				ctx.fillText("Game over. No restart button yet. Sorry.", canvas.width / 2, canvas.height / 2);
				ctx.fillStyle = CSScolor({ r: 80, g: 80, b: 80 });
				ctx.fillText("Score: " + localPlayer.score, canvas.width / 2, canvas.height / 2 + 40);
				running = false;
			}
			else gameOverScreenTimeout -= deltaTime;

		}
		//#endregion

		//#endregion

		ctx.translate(-lastPos.x, -lastPos.y);

	}
	window.requestAnimationFrame(update);
}
//#endregion

//#region UPDATE FUNCTIONS

function updateStars() {
	ctx.scale(zoom, zoom);
	ctx.translate(-lastPos.x, -lastPos.y);

	ctx.lineCap = "round";
	tempStarsAmount.innerHTML = stars.length * sliderStars.value * starsRatio;

	var starMarginWorldspace = {
		x: starMargin.x / zoom,
		y: starMargin.y / zoom
	};

	var starEdges = {
		xmin: -screen.width / 2 - starMargin.x + cameraPos.x,
		xmax: screen.width / 2 + starMargin.x + cameraPos.x,
		ymin: -screen.height / 2 - starMargin.y + cameraPos.y,
		ymax: screen.height / 2 + starMargin.y + cameraPos.y
	}

	var starFieldSize = {
		x: screen.width + 2 * starMargin.x,
		y: screen.height + 2 * starMargin.y
	}

	ctx.fillStyle = "white";
	ctx.strokeStyle = "white";

	var starsOnScreen = 0;
	//for (var i = 0; i < stars.length * min(zoom * zoom * 10, sliderStars.value); i++) {
	for (var i = 0; i < stars.length && starsOnScreen < stars.length*sliderStars.value*starsRatio; i++) {
		var star = stars[i];

		if (cameraMoved) {
			star.oldX = star.x + cameraDelta.x;
			star.oldY = star.y + cameraDelta.y;
			
			star.x -= cameraDelta.x * (star.z * starSpeed - 1);
			star.y -= cameraDelta.y * (star.z * starSpeed - 1);
			

			if (testIfOnScreen({ x: star.x, y: star.y }, 0)) {
				ctx.globalAlpha = star.alpha;
				starsOnScreen++;


				ctx.beginPath();
				ctx.moveTo(star.oldX, star.oldY);
				ctx.lineTo(star.x, star.y);

				ctx.lineWidth = (star.z * starSize + minStarSize) / zoom;
				ctx.stroke();
			}

			if (star.x < starEdges.xmin) star.x += starFieldSize.x;
			if (star.x > starEdges.xmax) star.x -= starFieldSize.x;
			if (star.y < starEdges.ymin) star.y += starFieldSize.y;
			if (star.y > starEdges.ymax) star.y -= starFieldSize.y;

		}
		else {
			if (testIfOnScreen({ x: star.x, y: star.y }, 0)) {
				starsOnScreen++;
				ctx.globalAlpha = star.alpha;
				ctx.beginPath();
				ctx.arc(star.x, star.y, 0.5 * (star.z * starSize + minStarSize) / zoom, 0, 2 * Math.PI);
				ctx.fill();
			}
		}

	}
	//console.log(starsOnScreen);
	ctx.globalAlpha = 1;
	ctx.lineCap = "butt";
}

function updateDrawPlayers() {
	for (var i = 0; i < players.length; i++) {
		var p = players[i];
		if (p.hp > 0) {

			//TEST IF ON SCREEN
			if (testIfOnScreen(p.pos, 5000)) {
				//DRAW TRAIL
				if (p.initialised) {
					p.trails.forEach(trail => {
						trail.update();
						renderTrail(trail);

					});
				}
			}


			if (testIfOnScreen(p.pos, 50)) {
				//DRAW PLAYER

				ctx.lineWidth = 3;
				ctx.strokeStyle = CSScolorAlpha({ r: 255, g: 255, b: 255 }, .1);
				ctx.beginPath();
				ctx.arc(p.pos.x, p.pos.y, p.size / 2, 0, Math.PI * 2);
				ctx.stroke();
				ctx.strokeStyle = CSScolorAlpha(p.color, .5);
				ctx.beginPath();
				ctx.arc(p.pos.x, p.pos.y, p.size / 2, 0, Math.PI * 2 * (p.hp / p.maxHp));
				ctx.stroke();


				//PREDICT POS
				if (p.id != localPlayer.id) {
					var predictedPos = predictTargetPos(localPlayer, p, 1500);
					ctx.strokeStyle = CSScolorAlpha({ r: 255, g: 255, b: 255 }, .2);
					ctx.beginPath();
					ctx.arc(predictedPos.x, predictedPos.y, 10, 0, Math.PI * 2);
					ctx.stroke();
					ctx.setLineDash([10, 15]);
					ctx.beginPath();
					ctx.moveTo(p.pos.x, p.pos.y);
					ctx.lineTo(predictedPos.x, predictedPos.y);
					ctx.stroke();
					ctx.setLineDash([]);
				}



				ctx.fillStyle = CSScolorAlpha(p.color, .5);
				ctx.fillText(p.name, p.pos.x, p.pos.y + (p.size * .5) + 30);

				ctx.save();
				ctx.translate(p.pos.x, p.pos.y);
				ctx.rotate(p.rot);
				ctx.translate(-p.pos.x, -p.pos.y);
				ctx.fillStyle = CSScolor(p.color);
				//ctx.fillRect(0, 0, canvas.width, canvas.height);
				//ctx.globalCompositeOperation="destination-in";
				var pImg = playerImage[p.shipID];
				if (p.shipID >= playerImageCount)
					var pImg = playerImage[playerImageCount - 1];
				ctx.drawImage(pImg, p.pos.x - p.size / 2, p.pos.y - p.size / 2, p.size, p.size);
				ctx.restore();

				if (p.shieldEnabled) {

					var shieldRatio = p.shield / p.maxShield;
					ctx.lineWidth = 3 * (shieldRatio);
					ctx.strokeStyle = CSScolorAlpha(shieldColor, .8 * (shieldRatio));
					ctx.fillStyle = CSScolorAlpha(shieldColor, .2 * (shieldRatio));
					ctx.beginPath();
					ctx.arc(p.pos.x, p.pos.y, p.size / 2 + 10, 0, Math.PI * 2);
					ctx.stroke();
					ctx.fill();
				}

				/*ctx.fillStyle = CSScolor(p.color);
				ctx.fillText(p.rot,p.pos.x,p.pos.y+30);*/
				//DRAW SMOKE
				if (p.hp <= p.maxHp / 2) {
					if (p.hp <= p.maxHp / 3 && p.hp >= p.maxHp / 5 && frameIndex % 4 == 0) {
						particles.push(new Particle(p.pos.x + randomFloat(-15, 15), p.pos.y + randomFloat(-15, 15), true, true, -1, 1, 40, { r: 0, g: 0, b: 0 }, .3));
					}
					if (p.hp <= p.maxHp / 5 && frameIndex % 3 == 0) {
						particles.push(new Particle(p.pos.x + randomFloat(-15, 15), p.pos.y + randomFloat(-15, 15), true, true, -1, 1.5, 50, { r: 0, g: 0, b: 0 }, 1));
					}
					if (p.hp <= p.maxHp / 10 && frameIndex % 5 == 0) {
						particles.push(new Particle(p.pos.x + randomFloat(-25, 25), p.pos.y + randomFloat(-25, 25), true, true, -1, 1.2, 10, { r: 200, g: 80, b: 0 }, 1));
					}
				}
			}
			else {
				//DRAW POINTER

				ctx.translate(lastPos.x, lastPos.y);
				ctx.scale(1 / zoom, 1 / zoom);
				ctx.fillStyle = CSScolor(p.color);
				var rotToPlayer = objectRot(localPlayer, p);
				ctx.save();
				rotateCtx(canvas.width / 2, canvas.height / 2, rotToPlayer);
				//ctx.fillRect(canvas.width/2 + pointerPos.x - 10,canvas.height/2 + pointerPos.y - 10,20,20);
				//ctx.fillRect(canvas.width/2 + pointerDistance,canvas.height/2,20,2);

				ctx.beginPath();
				ctx.moveTo(canvas.width / 2 + pointerDistance + 12, canvas.height / 2);
				ctx.lineTo(canvas.width / 2 + pointerDistance, canvas.height / 2 - 6);
				ctx.lineTo(canvas.width / 2 + pointerDistance, canvas.height / 2 + 6);
				ctx.fill();

				ctx.restore();
				ctx.scale(zoom, zoom);
				ctx.translate(-lastPos.x, -lastPos.y);
			}
		}
	}
}

function updateProjectiles() {
	for (var i = 0; i < projectiles.length; i++) {

		var p = projectiles[i];

		p.age += deltaTime;

		//#region MOVE PROJECTILE
		if (!p.guided) {
			p.pos.x += p.velocity.x * deltaTime;
			p.pos.y += p.velocity.y * deltaTime;
		}
		else {
			rotateToTarget(p, p.target);
			p.speed += 800 * deltaTime;
			p.pos.x += Math.cos(p.rot) * p.speed * deltaTime;
			p.pos.y += Math.sin(p.rot) * p.speed * deltaTime;
			p.trail.update();
			renderTrail(p.trail);
		}
		//#endregion

		//#region KILL IF TOO OLD
		if (p.age > p.lifetime) {
			/*ctx.fillStyle="white";
			ctx.beginPath();
			ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
			ctx.fill();*/
			createExplosion(p.pos.x, p.pos.y, .5);
			removeIDFromArray(projectiles, p.id);
			continue;
		}
		//#endregion

		//#region DRAW PROJECTILE


		ctx.save();
		ctx.fillStyle = CSScolor(p.color);
		rotateCtx(p.pos.x, p.pos.y, p.rot);
		if (!p.guided) {
			ctx.fillRect(p.pos.x - 10, p.pos.y - 1.5, 20, 3);
			ctx.fillStyle = CSScolorAlpha(p.color, 0.5);
			ctx.fillRect(p.pos.x - 30, p.pos.y - 1.5, 30, 3);
			ctx.fillStyle = CSScolorAlpha(p.color, 0.3);
			ctx.fillRect(p.pos.x - 60, p.pos.y - 1.5, 40, 3);
			ctx.fillStyle = CSScolorAlpha(p.color, 0.2);
			ctx.fillRect(p.pos.x - 100, p.pos.y - 1.5, 100, 3);
		}
		else {
			ctx.fillRect(p.pos.x - 10, p.pos.y - 2.5, 20, 5);

		}
		ctx.restore();


		//#endregion

		//#region DETECT COLLISION

		//#region SINGLEPLAYER VARIANT

		if (p.shooter == localPlayer) {
			for (var ii = 0; ii < players.length; ii++) {
				var player = players[ii];
				if (player.ai) {
					if (player.hp > 0 && player.team != p.shooter.team) {
						if (p.pos.x < player.hitbox[1].x && p.pos.x > player.hitbox[0].x) {
							if (p.pos.y < player.hitbox[3].y && p.pos.y > player.hitbox[0].y) {
								if (player.shieldEnabled && player.shield >= 1) {
									player.shield -= 1;
									soundShieldHit.play(.2);
									/*weaponCooldown=.5;
									cooldownStart=.5;*/
								}
								else {
									player.hp -= 1;
									soundHit.play(.15);
								}
								if (player.hp <= 0) {
									player.hp = 0;
									//PLAYER DEATH
									createExplosion(p.pos.x, p.pos.y, 20);
									player.speed = 0;
									enemyCount--;
									localPlayer.score++;
									removeIDFromArray(players, player.id);
								}
								createExplosion(p.pos.x, p.pos.y, 1);
								removeIDFromArray(projectiles, p.id);
							}
						}
					}
				}
			}
		}

		//#endregion

		//MULTIPLAYER VARIANT
		var player = localPlayer
		if (player.hp > 0 && player.id != p.shooter.id) {
			if (p.pos.x < player.hitbox[1].x && p.pos.x > player.hitbox[0].x) {
				if (p.pos.y < player.hitbox[3].y && p.pos.y > player.hitbox[0].y) {
					if (player.shieldEnabled && player.shield >= 1) {
						player.shield -= 1;
						soundShieldHit.play(.2);
						sendHit(player.id, p.id, true);
						/*weaponCooldown=.5;
						cooldownStart=.5;*/
					}
					else {
						player.hp -= 1;
						soundHit.play(.2);
						sendHit(player.id, p.id, false);
					}
					if (player == localPlayer) {
						particles.push(new Particle(player.pos.x, player.pos.y, true, false, 1, .12, 10000, { r: 230, g: 20, b: 0 }, .1));
					}
					if (player.hp <= 0) {
						player.hp = 0;
						shakeScreen(20, 2);
						sendDeath(player.id, p.shooter.id);
						//PLAYER DEATH
						createExplosion(p.pos.x, p.pos.y, 20);
						player.speed = 0;
						/*if(player.team == 2){
							enemyCount--;
							score++;
						}*/
						removeIDFromArray(players, player.id);
					}
					else {

						shakeScreen(5, 0.3);
					}
					createExplosion(p.pos.x, p.pos.y, 1);
					removeIDFromArray(projectiles, p.id);
				}
			}


		}
		//#endregion
	}
}

function updateDrawHitboxes() {
	{
		
		ctx.strokeStyle="red";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(localPlayer.hitbox[0].x,localPlayer.hitbox[0].y);
		for(var i = 0; i < localPlayer.hitbox.length;i++){
			var p = localPlayer.hitbox[i];
			ctx.lineTo(p.x,p.y);
			//console.log(i, p.x,p.y);
			
		}
		ctx.closePath();
		ctx.stroke();
		
		}
}

function updateExplosions() {
	for (var i = 0; i < explosions.length; i++) {
		var e = explosions[i];
		e.age += deltaTime;

		//DRAW EXPLOSION
		var lifetimeRatio = (e.lifetime - e.age) / e.lifetime;
		ctx.fillStyle = CSScolorAlpha(e.color, lifetimeRatio);
		ctx.beginPath();
		ctx.arc(e.pos.x, e.pos.y, (1 - lifetimeRatio) * e.radius, 0, 2 * Math.PI);
		ctx.fill();

		//KILL IF TOO OLD
		if (e.age > e.lifetime) {
			/*ctx.fillStyle="white";
			ctx.beginPath();
			ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
			ctx.fill();*/
			removeIDFromArray(explosions, e.id);
			continue;
		}
		/*
		ctx.save();
		//ctx.fillStyle=CSScolor(p.color);
		ctx.fillStyle="red";
		rotateCtx(p.pos.x,p.pos.y,p.rot);
		ctx.fillRect(p.pos.x-10,p.pos.y-2,20,4);
		ctx.restore();
		*/
	}
}

function updateParticles() {
	for (var i = 0; i < particles.length; i++) {
		var p = particles[i];

		p.age += deltaTime;
		//KILL IF TOO OLD
		if (p.age > p.lifetime) {
			/*ctx.fillStyle="white";
			ctx.beginPath();
			ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
			ctx.fill();*/
			removeIDFromArray(particles, p.id);
			continue;
		}

		var lifetimeRatio = (p.age) / p.lifetime;
		var tempOpacity = p.opacity;
		var tempRadius = p.radius;
		if (p.fadeSize) {
			tempRadius = p.radius * (1 + (lifetimeRatio * p.sizeFadeDirection));
			if (tempRadius < 0) {
				console.log("Invalid particle radius:", p.radius, lifetimeRatio, p.age, p.lifetime);
			}
		}
		if (p.fadeOpacity) {
			tempOpacity = p.opacity * (1 - Math.abs(2 * (lifetimeRatio - 0.5)));
		}

		//DRAW PARTICLE

		ctx.fillStyle = CSScolorAlpha(p.color, tempOpacity);
		ctx.beginPath();
		ctx.arc(p.pos.x, p.pos.y, tempRadius, 0, 2 * Math.PI);
		ctx.fill();

		/*
		ctx.save();
		//ctx.fillStyle=CSScolor(p.color);
		ctx.fillStyle="red";
		rotateCtx(p.pos.x,p.pos.y,p.rot);
		ctx.fillRect(p.pos.x-10,p.pos.y-2,20,4);
		ctx.restore();
		*/
	}
}

function updateShooting() {
	
		//if(weaponCooldown == 0){
			localPlayer.energy += localPlayer.energyRecharge * deltaTime;
			if (localPlayer.energy > localPlayer.maxEnergy) localPlayer.energy = localPlayer.maxEnergy;
			if (localPlayer.hp > 0) localPlayer.hp += .01 * deltaTime;
			if (localPlayer.hp > localPlayer.maxHp) localPlayer.hp = localPlayer.maxHp;
			//}
	
			if (weaponCooldown > 0 && localPlayer.energy >= 30 * deltaTime * sliderWeapons.value) {
				weaponCooldown -= deltaTime * sliderWeapons.value;
				localPlayer.energy -= 30 * deltaTime * sliderWeapons.value;
			}
	
			if (weaponCooldown < 0) {
				weaponCooldown = 0;
			}
	
	
			if (localPlayer.hp > 0) {
				if (shooting) {
					if (weaponCooldown <= 0/* && localPlayer.energy >= 5*sliderWeapons.value*/) {
						//SHOOTING LAG MITIGATION
						var lagNegation = 3;
						localPlayer.pos.x += lagNegation * localPlayer.velocity.x * deltaTime;
						localPlayer.pos.y += lagNegation * localPlayer.velocity.y * deltaTime;
	
						shootProjectile(localPlayer);
	
						//SHOOTING LAG MITIGATION
	
						//localPlayer.energy-=5*sliderWeapons.value;
						localPlayer.pos.x -= lagNegation * localPlayer.velocity.x * deltaTime;
						localPlayer.pos.y -= lagNegation * localPlayer.velocity.y * deltaTime;
						weaponCooldown = maxCooldown;
						cooldownStart = weaponCooldown;
					}
				}
				if (shootingSecondary) {
					if (weaponCooldown <= 0) {
	
						if (enemyCount > 0) {
							var tgt = null;
							var lowestDist = 2 * distancePos(localPlayer, players[1]);
							for (var t = 0; t < players.length; t++) {
								if (players[t] != localPlayer) {
									if (players[t].hp > 0) {
										d = distancePos(localPlayer, players[t]);
										if (lowestDist > d) {
											lowestDist = d;
											tgt = players[t];
										}
									}
								}
							}
							if (tgt != null) {
								shootGuidedProjectile(localPlayer, tgt);
								weaponCooldown = 2;
								cooldownStart = weaponCooldown;
							}
						}
					}
				}
	
				if (shieldEnabled && localPlayer.shield < localPlayer.maxShield && localPlayer.energy >= (localPlayer.shieldEnergyCost * deltaTime * sliderShields.value)) {
					localPlayer.energy -= localPlayer.shieldEnergyCost * deltaTime * sliderShields.value;
					localPlayer.shield += localPlayer.shieldRecharge * deltaTime * sliderShields.value;
					if (localPlayer.shield > localPlayer.maxShield) localPlayer.shield = localPlayer.maxShield;
	
				}
				localPlayer.energy -= localPlayer.engineEnergyCost * sliderEngine.value * deltaTime;
	
				if (localPlayer.energy < 0) localPlayer.energy = 0;
			}
}

function updateCalcHitboxes() {
	for (var i = 0; i < players.length; i++) {
		var p = players[i];






		p.hitbox = [{ x: p.pos.x - hitboxSize * p.size / 2, y: p.pos.y - hitboxSize * p.size / 2 }, { x: p.pos.x + hitboxSize * p.size / 2, y: p.pos.y - hitboxSize * p.size / 2 }, { x: p.pos.x + hitboxSize * p.size / 2, y: p.pos.y + hitboxSize * p.size / 2 }, { x: p.pos.x - hitboxSize * p.size / 2, y: p.pos.y + hitboxSize * p.size / 2 }]
	}
}

function updateWorldspaceBg() {
	
	screenWorldspace.width = screen.width / zoom;
	screenWorldspace.height = screen.height / zoom;

	screenEdges.xmin = cameraPos.x - screenWorldspace.width / 2;
	screenEdges.xmax = cameraPos.x + screenWorldspace.width / 2;
	screenEdges.ymin = cameraPos.y - screenWorldspace.height / 2;
	screenEdges.ymax = cameraPos.y + screenWorldspace.height / 2;



	cameraMoved = false;
	if (cameraDelta.x != 0 || cameraDelta.y != 0) {
		cameraMoved = true;
	}

	//#region STARS
	updateStars();

	//#endregion

	//#region SPAWN
	ctx.lineWidth = 3;
	ctx.strokeStyle = CSScolorAlpha({ r: 255, g: 255, b: 255 }, .1);
	ctx.fillStyle = ctx.strokeStyle;
	ctx.beginPath();
	ctx.arc(200, 200, 100, 0, Math.PI * 2);
	ctx.arc(200, 200, 110, 0, Math.PI * 2);
	ctx.stroke();
	ctx.fillText("SPAWN", 200, 210);
	//#endregion

	//#region BG IMG
	/*
	var bgPos = [];
	bgPos[0] = screenToWorldCoords({ x: 0, y: 0 });
	bgPos[1] = screenToWorldCoords({ x: canvas.width, y: 0 });
	bgPos[2] = screenToWorldCoords({ x: canvas.width, y: canvas.height });
	bgPos[3] = screenToWorldCoords({ x: 0, y: canvas.height });



	for (var x = bgPos[0].x - backgroundImage.width - (bgPos[0].x % backgroundImage.width); x < bgPos[1].x; x += backgroundImage.width) {
		for (var y = bgPos[0].y - backgroundImage.height - (bgPos[0].y % backgroundImage.height); y < bgPos[3].y; y += backgroundImage.height) {
			//if((x >= bgPos[0].x && x <= bgPos[1].x)||(y >= bgPos[0].y && y <= bgPos[3].y)){
			//ctx.fillStyle="gray";
			//ctx.fillRect(x,y,backgroundImage.width, backgroundImage.height);
			ctx.drawImage(backgroundImage, x, y, backgroundImage.width, backgroundImage.height);
			//ctx.fillStyle="red";
			//ctx.fillRect(x,y,10, 10);
			//}
		}
	}
	
	*/

	/*
	ctx.fillStyle="gray";
	for(var b=0;b<4;b++){
		bgPos[b].x -= bgPos[b].x % backgroundImage.width;
		bgPos[b].y -= bgPos[b].y % backgroundImage.height;
		ctx.fillRect(bgPos[b].x-5,bgPos[b].y-5,10,10);
		ctx.drawImage(backgroundImage,bgPos[b].x,bgPos[b].y,backgroundImage.width,backgroundImage.height);
	}*/
	/*
	bgPos.x -= bgPos.x % backgroundImage.width;
	bgPos.x -= backgroundImage.width;
	bgPos.y -= bgPos.y % backgroundImage.height;
	bgPos.y -= backgroundImage.height;
	ctx.drawImage(backgroundImage,bgPos.x,bgPos.y,backgroundImage.width*4,backgroundImage.height*4);*/
	//#endregion

}

function updateScreenspaceBg() {
	
	lastPos.x = cameraPos.x - canvas.width / 2 / zoom;
	lastPos.y = cameraPos.y - canvas.height / 2 / zoom;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = CSScolor({ r: 19, g: 22, b: 25 });
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "white";
	ctx.textAlign = "left";


	/*REMOVE THIS*/tempFpsCounter.innerHTML = (fpsCounterFrames / currentFps).toFixed(0);

	if (showFps) {
		ctx.fillText("DeltaTime: " + trueDeltaTime.toFixed(3), 30, 30);
		ctx.fillText("True FPS: " + (1 / trueDeltaTime).toFixed(0), 30, 60);
		ctx.fillText("Avg FPS: " + (fpsCounterFrames / currentFps).toFixed(0), 30, 90);
	}

	//AIMING CURSOR
	/*ctx.strokeStyle = CSScolor({r:80,g:80,b:80});
	ctx.beginPath();
	ctx.arc(mousePos.x, mousePos.y,10,0,Math.PI*2);
	ctx.stroke();
	*/
	ctx.font = "20px Century Gothic";
	ctx.textAlign = "left";


	ctx.fillStyle = CSScolor({ r: 80, g: 80, b: 80 });

	ctx.textAlign = "center";
	//#region CONTROLS PROMPT


	/*if(!alternativeControls){
		ctx.fillStyle = CSScolor({r:80,g:80,b:80});
		ctx.fillText("press E for alternative controls", canvas.width/2, canvas.height - 320);
	}
	else {
		ctx.fillStyle = CSScolor({r:50,g:50,b:50});
		ctx.fillText("press E for normal controls", canvas.width/2, canvas.height - 320);
	}*/
	/*if(inertialDampening){
		ctx.fillStyle = CSScolor({r:80,g:80,b:80});
		ctx.fillText("press Q to turn off inertial dampening", canvas.width/2, canvas.height - 260);
		
	}
	else {
		ctx.fillStyle = CSScolor({r:50,g:50,b:50});
		ctx.fillText("press Q to turn on inertial dampening", canvas.width/2, canvas.height - 260);
	}*/

	if (!menuOpen) {
		ctx.fillStyle = CSScolor({ r: 80, g: 80, b: 80 });
		ctx.fillText("(ESC) shop", canvas.width / 2, canvas.height - 100);

	}
	/*if(shieldEnabled){
		ctx.fillStyle = CSScolor({r:80,g:80,b:80});
		ctx.fillText("(R) turn off shields", canvas.width/2, canvas.height - 140);
		
	}
	else{
		ctx.fillStyle = CSScolor({r:50,g:50,b:50});
		ctx.fillText("(R) turn on shields", canvas.width/2, canvas.height - 140);
	}*/
	ctx.fillStyle = CSScolor({ r: 80, g: 80, b: 80 });
	ctx.fillText("Kills: " + localPlayer.score, canvas.width / 2, canvas.height - 60);

	drawKeyPrompt(keyBindings.inertialDampening, keyIDs.inertialDampening, 150, 450, inertialDampening);
	drawKeyPrompt(keyBindings.switchControls, keyIDs.alternativeControls, 285, 480, !alternativeControls);
	drawKeyPrompt(keyBindings.switchShield, keyIDs.shieldEnabled, 420, 450, shieldEnabled);

	drawWarning("Losing Energy", 80, 230, (localPlayer.energyRecharge < localPlayer.shieldEnergyCost && shieldEnabled && localPlayer.shield < localPlayer.maxShield));
	drawWarning("Low Energy", 80, 290, (localPlayer.energy < localPlayer.maxEnergy / 5));

	drawWarning("Low Shield", 500, 230, (localPlayer.shield < 2 && shieldEnabled));
	drawWarning("Low HP", 500, 290, (localPlayer.hp < 3));




	//#endregion

	//#region PLAYER CIRCLE HUD

	ctx.lineWidth = 3;
	ctx.strokeStyle = CSScolorAlpha({ r: 255, g: 255, b: 255 }, .1);
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance + 6, 0, Math.PI * 2);
	ctx.stroke();
	ctx.strokeStyle = CSScolorAlpha({ r: 255, g: 255, b: 255 }, .2);
	ctx.beginPath();
	ctx.arc(canvas.width / 2 + localPlayer.velocity.x * pointerDistance / 900, canvas.height / 2 + localPlayer.velocity.y * pointerDistance / 900, 5, 0, Math.PI * 2);
	ctx.stroke();

	//#region GAUGES

	//HP BG
	if (localPlayer.maxHp < 200)
		ctx.setLineDash([(2 * (pointerDistance - 5) * Math.PI / 4) / (localPlayer.maxHp) - 5, 5]);
	else
		ctx.setLineDash([]);
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance - 15, Math.PI * (0.25), Math.PI * (1.75), true);
	ctx.stroke();

	//COOLDOWN BG
	ctx.setLineDash([]);
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance - 5, Math.PI * (0.75), Math.PI * (1.25));
	ctx.stroke();

	//ENERGY BG
	if (localPlayer.maxEnergy < 300)
		ctx.setLineDash([(2 * (pointerDistance - 15) * Math.PI / 4) / (localPlayer.maxEnergy / 5) - 5, 5]);
	else
		ctx.setLineDash([]);
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance - 15, Math.PI * (0.75), Math.PI * (1.25));
	ctx.stroke();
	ctx.setLineDash([]);

	//HP

	if (localPlayer.maxHp < 40)
		ctx.setLineDash([(2 * (pointerDistance - 5) * Math.PI / 4) / (localPlayer.maxHp) - 5, 5]);
	else
		ctx.setLineDash([]);
	ctx.strokeStyle = CSScolor(localPlayer.color);

	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance - 15, Math.PI * (0.25), Math.PI * (1.75 - 0.001 + 0.5 * (1 - (localPlayer.hp / localPlayer.maxHp))), true);
	ctx.stroke();
	ctx.setLineDash([]);

	//SHIELD

	if (shieldEnabled) {
		if (localPlayer.maxShield < 40)
			ctx.setLineDash([(2 * (pointerDistance - 5) * Math.PI / 4) / (localPlayer.maxShield), 5]);
		else
			ctx.setLineDash([]);

		ctx.strokeStyle = CSScolorAlpha(shieldColor, .8);
		ctx.beginPath();
		ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance - 5, Math.PI * (0.25), Math.PI * (1.75 - 0.001 + 0.5 * (1 - (localPlayer.shield / localPlayer.maxShield))), true);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	//COOLDOWN

	ctx.strokeStyle = CSScolor({ r: 180, g: 30, b: 30 });

	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance - 5, Math.PI * (0.75), Math.PI * (1.25 - 0.5 * ((weaponCooldown / cooldownStart))));
	ctx.stroke();

	ctx.strokeStyle = CSScolor({ r: 170, g: 110, b: 40 });
	if (localPlayer.maxEnergy < 300)
		ctx.setLineDash([(2 * (pointerDistance - 15) * Math.PI / 4) / (localPlayer.maxEnergy / 5) - 5, 5]);
	else
		ctx.setLineDash([]);
	ctx.beginPath();
	ctx.arc(canvas.width / 2, canvas.height / 2, pointerDistance - 15, Math.PI * (0.75), Math.PI * (1.25 - 0.5 * (1 - (localPlayer.energy / localPlayer.maxEnergy))));
	ctx.stroke();
	ctx.setLineDash([]);
	//#endregion

	//#endregion

}

function updateLocalMovement() {
	maxVelocityMagnitude = localPlayer.speed;

		if (alternativeControls) {
			localPlayer.rot += inputRotation * localPlayer.rotationSpeed * deltaTime;
			if (inputVelocity != 0 && localPlayer.hp > 0) {
				localPlayer.velocity.x += Math.cos(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime;
				localPlayer.velocity.y += Math.sin(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime;
			}
			if (inputVelocity == 0 && inertialDampening) {

				localPlayer.velocity.x *= 1 - .3 * deltaTime;
				localPlayer.velocity.y *= 1 - .3 * deltaTime;
			}
			velocityMagnitude = Math.sqrt(Math.abs(Math.pow(localPlayer.velocity.x, 2) + Math.pow(localPlayer.velocity.y, 2)));

			if (Math.abs(velocityMagnitude) > maxVelocityMagnitude) {
				velocityNormalised.x = localPlayer.velocity.x / velocityMagnitude;
				velocityNormalised.y = localPlayer.velocity.y / velocityMagnitude;
				velocityMagnitude = Math.sign(velocityMagnitude) * maxVelocityMagnitude;
				localPlayer.velocity.x = velocityNormalised.x * velocityMagnitude;
				localPlayer.velocity.y = velocityNormalised.y * velocityMagnitude;
				localPlayer.velocity.x = velocityNormalised.x * velocityMagnitude;
				localPlayer.velocity.y = velocityNormalised.y * velocityMagnitude;
			}



		}
		else {
			rotateToTarget(localPlayer, { pos: mouseWorldPos });

			//if(localPlayer.energy > localPlayer.engineEnergyCost * deltaTime * sliderEngine.value){
			if (inputVelocity != 0 && localPlayer.hp > 0) {
				localPlayer.velocity.x += Math.cos(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime * sliderEngine.value;
				localPlayer.velocity.y += Math.sin(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime * sliderEngine.value;
			}
			if (inputRotation != 0 && localPlayer.hp > 0) {
				localPlayer.velocity.x -= Math.sin(localPlayer.rot) * inputRotation * localPlayer.thrust * deltaTime * sliderEngine.value;
				localPlayer.velocity.y += Math.cos(localPlayer.rot) * inputRotation * localPlayer.thrust * deltaTime * sliderEngine.value;
			}
			//}
			if (inputVelocity == 0 && inputRotation == 0 && inertialDampening) {
				localPlayer.velocity.x *= 1 - .5 * deltaTime;
				localPlayer.velocity.y *= 1 - .5 * deltaTime;
			}
			velocityMagnitude = Math.sqrt(Math.abs(Math.pow(localPlayer.velocity.x, 2) + Math.pow(localPlayer.velocity.y, 2)));

			if (Math.abs(velocityMagnitude) > maxVelocityMagnitude) {
				velocityNormalised.x = localPlayer.velocity.x / velocityMagnitude;
				velocityNormalised.y = localPlayer.velocity.y / velocityMagnitude;
				velocityMagnitude = Math.sign(velocityMagnitude) * maxVelocityMagnitude;
				localPlayer.velocity.x = velocityNormalised.x * velocityMagnitude;
				localPlayer.velocity.y = velocityNormalised.y * velocityMagnitude;
				localPlayer.velocity.x = velocityNormalised.x * velocityMagnitude;
				localPlayer.velocity.y = velocityNormalised.y * velocityMagnitude;
			}



			/*
			velocityMagnitude = Math.sign(velocityMagnitude) * Math.sqrt(Math.abs(Math.pow(localPlayer.velocity.x,2)+Math.pow(localPlayer.velocity.y,2)));

			if(inputVelocity != 0 && localPlayer.hp > 0){
				
				velocityMagnitude += inputVelocity * localPlayer.thrust * deltaTime * deltaTime;
				
			}
			else if (inertialDampening) {
				velocityMagnitude *= 1 - .5 * deltaTime;
			}

			if(Math.abs(velocityMagnitude) > maxVelocityMagnitude*deltaTime){
				velocityMagnitude = Math.sign(velocityMagnitude) * maxVelocityMagnitude*deltaTime;
			}
			if(inputVelocity < 0){
				//velocityMagnitude *= -1;
			}

			localPlayer.velocity.x = Math.cos(localPlayer.rot) * velocityMagnitude;
			localPlayer.velocity.y = Math.sin(localPlayer.rot) * velocityMagnitude;
			*/


		}

		if (inputVelocity == 0 && inputRotation == 0 && Math.abs(velocityMagnitude) < 150) {
			localPlayer.velocity.x *= 1 - 2.2 * deltaTime;
			localPlayer.velocity.y *= 1 - 2.2 * deltaTime;
			if (Math.abs(localPlayer.velocity.x) < 10 && Math.abs(localPlayer.velocity.y) < 10) {
				localPlayer.velocity.x = 0;
				localPlayer.velocity.y = 0;
			}
		}

		localPlayer.pos.x += localPlayer.velocity.x * deltaTime;
		localPlayer.pos.y += localPlayer.velocity.y * deltaTime;
}
//#endregion

//#region GAME UTLITY FUNCTIONS

function openKeySettings() {
	keyAssignVars.screenOpen = true;
	keySettingsHTML.style.display = "flex";
	var keySettingsList = document.getElementById("keySettingsList");
	keySettingsList.innerHTML = "";
	for (var key in keyBindings) {
		keySettingsList.appendChild(generateKeySettingsItem(key));
	}
}

function closeKeySettings() {
	keyAssignVars.screenOpen = false;
	keySettingsHTML.style.display = "none";
}

function generateKeySettingsItem(key) {
	var result = document.createElement("div");
	result.classList.add("keySettingsItem");
	var keyName = document.createElement("h1");
	keyName.innerHTML = keyBindNames[key];
	result.appendChild(keyName);
	var buttonContainer = document.createElement("div");
	buttonContainer.classList.add("keySettingsLine");
	result.appendChild(buttonContainer);
	var buttonContainer = document.createElement("div");
	buttonContainer.classList.add("buttonContainer");
	result.appendChild(buttonContainer);
	var keyButton = document.createElement("button");
	keyButton.onclick = "keyAssign(" + key + ")";
	keyButton.setAttribute("onclick", "keyAssign(this)");
	keyButton.setAttribute("keyAssignID", key);
	/*keyButton.onclick = function () {
		keyAssign(key);
	}*/
	keyButton.classList.add("keyAssign");
	keyButton.innerHTML = keyToDisplay(keyBindings[key]);
	buttonContainer.appendChild(keyButton);
	return result;
}

function keyAssign(button) {
	if (!keyAssignVars.waiting || button != keyAssignVars.button) {
		button.focus();
		button.innerHTML = " "
		keyAssignVars.waiting = true;
		keyAssignVars.key = button.getAttribute("keyAssignID");
		keyAssignVars.button = button;
	}
}
function finishKeyAssign() {
	keyAssignVars.waiting = false;
	keyAssignVars.button.innerHTML = keyToDisplay(keyBindings[keyAssignVars.key]);
	keyAssignVars.button.blur();
}
function keyToDisplay(key) {
	var result = key;
	if (key == " ") result = "SPACE";
	return result;
}

function generateLeaderboard() {
	var tempScores = new Array(10);
	tempScores.fill(-1);

	var usedIDs = new Array(10);
	usedIDs.fill(-1);

	var con = true;

	for (var t = 0; t < tempScores.length; t++) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].score > tempScores[t]) {
				con = true;
				for (var u = 0; u < t; u++) {
					if (usedIDs[u] == players[i].id) {
						con = false;
					}
				}
				if (con) {
					tempScores[t] = players[i].score;
					usedIDs[t] = players[i].id;
				}
			}
		}
	}
	return usedIDs;
}

function refreshLeaderboard() {
	var h = 20 * (players.length) + 50;
	if (h > 300) h = 300;
	leaderboardElement.style.maxHeight = (h + "px");
	leaderboardElement.style.opacity = ".6";
	var list = document.getElementById("leaderboardList");
	var lb = generateLeaderboard();
	list.innerHTML = null;
	for (var i = 0; i < lb.length; i++) {
		if (lb[i] != -1) {
			var li = list.appendChild(document.createElement("LI"));
			var p = findPlayerWithID(lb[i])
			li.innerHTML = p.name + " - " + p.score;
			li.style.color = CSScolor(p.color);
		}
	}
}

function screenToWorldCoords(screenPos) {
	var worldPos = { x: screenPos.x, y: screenPos.y };
	worldPos.x -= canvas.width / 2;
	worldPos.y -= canvas.height / 2;
	worldPos.x *= 1 * 1 / zoom;
	worldPos.y *= 1 * 1 / zoom;
	worldPos.x += localPlayer.pos.x;
	worldPos.y += localPlayer.pos.y;
	return worldPos;
}

function rotateToTarget(object, target) {
	if (Math.abs(object.rot) > Math.PI * 2) {
		object.rot = object.rot % (Math.PI * 2);
	}
	var targetRot = objectRot(object, target);
	var rotDiff = Math.abs(targetRot - object.rot);
	if (rotDiff > Math.PI) {
		targetRot = Math.sign(object.rot) * 2 * Math.PI + targetRot;
		rotDiff = Math.abs(targetRot - object.rot);
	}
	if (Math.abs(targetRot - object.rot) <= object.rotationSpeed * deltaTime) {
		object.rot = targetRot;
	}
	else {
		object.rot += Math.sign(targetRot - object.rot) * object.rotationSpeed * deltaTime;
	}
}

function objectRot(from, to) {
	return Math.atan2(to.pos.y - from.pos.y, to.pos.x - from.pos.x);
}

function rotateCtx(x, y, angle) {
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.translate(-x, -y);
}


function removeIDFromArray(array, id) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].id == id) {
			array.splice(i, 1);
		}
	}
}


function findPlayerWithID(playerID) {
	for (var i = 0; i < players.length; i++) {
		//console.log("Player index from id: scanning index " + i + " for ID " + playerID + ". Found ID: " + players[i].ID);
		if (players[i].id == playerID) {
			return players[i];
		}
	}
	return null;
}

function findArrayElementWithID(array, ID) {
	for (var i = 0; i < array.length; i++) {
		//console.log("Player index from id: scanning index " + i + " for ID " + playerID + ". Found ID: " + players[i].ID);
		if (array[i].id == ID) {
			return array[i];
		}
	}
	return null;
}

function renderTrail(trail) {
	if (trail.points.length > 0) {
		for (var t = 0; t < trail.points.length - 1; t++) {
			ctx.beginPath();
			ctx.moveTo(trail.points[t].pos.x, trail.points[t].pos.y);
			ctx.lineTo(trail.points[t + 1].pos.x, trail.points[t + 1].pos.y);
			ctx.strokeStyle = CSScolorAlpha(trail.parent.color, 1 - (trail.points[t].age / trail.points[t].maxAge));
			ctx.lineWidth = trail.thickness * 5 * (1 - (trail.points[t].age / trail.points[t].maxAge));
			ctx.stroke();
		}
		/*ctx.beginPath();
		ctx.moveTo(trail.points[trail.points.length-1].pos.x,trail.points[trail.points.length-1].pos.y);
		ctx.lineTo(trail.parent.pos.x,trail.parent.pos.y);
		ctx.strokeStyle=CSScolorAlpha(trail.color,1-(trail.points[t].age/trail.points[t].maxAge));
		ctx.lineWidth = trail.thickness * 5*(1-(trail.points[t].age/trail.points[t].maxAge));
		ctx.stroke();*/
	}
	else {
		console.log("Trail has no points");
	}
}

function predictTargetPos(shooter, target, projectileSpeed) {
	var distanceToTarget = distancePos(target, shooter);
	var timeToTarget = distanceToTarget / projectileSpeed;
	var velocityDiff = {
		x: target.velocity.x - shooter.velocity.x,
		y: target.velocity.y - shooter.velocity.y

	}
	var predictedTargetPos = { x: target.pos.x + velocityDiff.x * timeToTarget, y: target.pos.y + velocityDiff.y * timeToTarget };
	return predictedTargetPos;
}

function gameStart() {

	console.log("Game start");

	loadingScreen.style.animation = "startGame 1s cubic-bezier(0.3, 0, 0.1, 1) 0s 2 normal both";
	loadingScreen.style.animationPlayState = "running";
	setTimeout(function () {
		loadingScreen.style.display = "none";
		loadingScreen.style.animationPlayState = "paused";
	}, 1000);

	running = true;
}

function drawKeyPrompt(keyCode, id, x, y, toggle) {
	var pos = {
		x: canvas.width / 2 - pointerDistance + x,
		y: canvas.height / 2 - pointerDistance + y
	}
	ctx.font = "bold 20px Century Gothic";
	ctx.strokeStyle = "white";
	ctx.fillStyle = "white";
	ctx.globalAlpha = .5;
	ctx.lineWidth = 2;
	ctx.drawImage(icons[id], pos.x - 10, pos.y, 50, 50);

	if (toggle != null && toggle) {
		ctx.fillRect(pos.x, pos.y + 50, 30, 30);
		ctx.fillStyle = "black";
		ctx.globalAlpha = 1;

	}
	else {
		ctx.strokeRect(pos.x, pos.y + 50, 30, 30);
	}
	ctx.fillText(keyCode, pos.x + 15, pos.y + 71);
	ctx.globalAlpha = 1;
	ctx.font = "20px Century Gothic";
}

function drawWarning(text, x, y, toggle) {
	var pos = {
		x: canvas.width / 2 - pointerDistance + x,
		y: canvas.height / 2 - pointerDistance + y
	}
	ctx.font = "bold 20px Century Gothic";
	ctx.strokeStyle = "red";
	ctx.fillStyle = "red";
	ctx.globalAlpha = .5;
	ctx.lineWidth = 2;
	//ctx.drawImage(icons[id],pos.x-10,pos.y,50,50);

	if (toggle != null && toggle) {
		//ctx.fillRect(pos.x,pos.y,30,30);
		ctx.fillStyle = "black";
		ctx.globalAlpha = 1;

		//ctx.strokeRect(pos.x,pos.y,30,30);
		ctx.fillStyle = "red";
		ctx.fillText(text, pos.x + 15, pos.y + 45);
		ctx.font = "30px Century Gothic";
		ctx.fillText("⚠", pos.x + 15, pos.y + 20);
	}
	ctx.globalAlpha = 1;
	ctx.font = "20px Century Gothic";
}

function testIfOnScreen(object, margin) {
	return (object.x > screenEdges.xmin - margin && object.x < screenEdges.xmax + margin && object.y > screenEdges.ymin - margin && object.y < screenEdges.ymax + margin);
}

function testIfOnScreenScreenspace(object, margin) {
	object.x += cameraPos.x;
	object.y += cameraPos.y;
	return (object.x > screenEdges.xmin - margin && object.x < screenEdges.xmax + margin && object.y > screenEdges.ymin - margin && object.y < screenEdges.ymax + margin);
}

//#endregion

//#region GENERAL UTILITY FUNCTIONS




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

function colorLuminance(color) {
	return (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b);
}

function randomInt(min, max) {
	return (Math.floor(Math.random() * (max - min)) + min);
}
function randomFloat(min, max) {
	return (Math.random() * (max - min) + min);
}

function distancePos(a, b) {
	return Math.sqrt(Math.abs(Math.pow(a.pos.y - b.pos.y, 2) + Math.pow(a.pos.x - b.pos.x, 2)));
}


function detectCollision(a, b) {
	var polygons = [a, b];
	var minA, maxA, projected, i, i1, j, minB, maxB;

	for (i = 0; i < polygons.length; i++) {

		// for each polygon, look at each edge of the polygon, and determine if it separates
		// the two shapes
		var polygon = polygons[i];
		for (i1 = 0; i1 < polygon.length; i1++) {

			// grab 2 vertices to create an edge
			var i2 = (i1 + 1) % polygon.length;
			var p1 = polygon[i1];
			var p2 = polygon[i2];

			// find the line perpendicular to this edge
			var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

			minA = maxA = undefined;
			// for each vertex in the first shape, project it onto the line perpendicular to the edge
			// and keep track of the min and max of these values
			for (j = 0; j < a.length; j++) {
				projected = normal.x * a[j].x + normal.y * a[j].y;
				if (isUndefined(minA) || projected < minA) {
					minA = projected;
				}
				if (isUndefined(maxA) || projected > maxA) {
					maxA = projected;
				}
			}

			// for each vertex in the second shape, project it onto the line perpendicular to the edge
			// and keep track of the min and max of these values
			minB = maxB = undefined;
			for (j = 0; j < b.length; j++) {
				projected = normal.x * b[j].x + normal.y * b[j].y;
				if (isUndefined(minB) || projected < minB) {
					minB = projected;
				}
				if (isUndefined(maxB) || projected > maxB) {
					maxB = projected;
				}
			}

			// if there is no overlap between the projects, the edge we are looking at separates the two
			// polygons, and we know there is no overlap
			if (maxA < minB || maxB < minA) {
				console.log("polygons don't intersect!");
				return false;
			}
		}
	}
	return true;
}

function rotateAroundPoint(pos, center, rot) {
	var sin = Math.sin(rot);
	var cos = Math.cos(rot);
	var newPos = {
		x: (cos * (pos.x - center.x)) + (sin * (pos.y - center.y)) + center.x,
		y: (cos * (pos.y - center.y)) - (sin * (pos.x - center.x)) + center.y
	}
	return newPos;
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		if (pair[0] == variable) { return decodeURI(pair[1]); }
	}
	return (false);
}

function loadJSON(path) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4 && xhr.status == "200") {
			console.log(xhr.responseText);
		}

	};
	xhr.open("GET", path, true);
	xhr.send();
}

function onGameExit() {
	console.log("er");
	if (running) {
		connection.send(JSON.stringify({ type: "chat", data: JSON.stringify({ text: "Bye" }) }));
		setCookie("playerScore", localPlayer.score, 90);
		setCookie("playerLevel", localPlayer.level, 90);
		setCookie("playerName", localPlayer.name, 90);
	}
	return null;
}

function setCookie(name, value, duration) {
	var d = new Date();
	d.setTime(d.getTime() + (duration * 24 * 60 * 60 * 1000));
	var expires = "expires=" + d.toUTCString();
	document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
	var fname = name + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(fname) == 0) {
			return c.substring(fname.length, c.length);
		}
	}
	return "";
}

function min(a, b) {
	if (a > b) return b;
	else return a;
}
function max(a, b) {
	if (a > b) return a;
	else return b;
}

//#endregion