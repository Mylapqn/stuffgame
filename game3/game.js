//#region OBJECT DEFS


function Player(id) {
	this.name="unnamed";
	this.ai = false;
	this.id = id;
	this.pos = { x: 200, y: 200 };
	this.rot = 0;
	this.speed = 850;
	this.thrust = 1000;
	this.velocity = {x:0,y:0};
	this.rotationSpeed = 4;
	this.color = { r: 100, g: 80, b: 200 };
	this.hitbox = [];
	this.hp = 10;
	this.maxHp = 10;
	this.trail=new Trail(this);
	this.team = 1;
	this.level = 0;
	this.size = 100;
	this.energy=100;
	this.maxEnergy=100;
	this.energyRecharge=10;
	this.shieldEnabled= true;
};

function Trail(player){
	this.points=[];
	this.color = { r: 100, g: 80, b: 200 };
	this.parent = player;
	this.color = this.parent.color;
	this.thickness = 1;
	
	//TODO RESET
	//this.maxLength = 1000;
	
	this.updateInterval = 1/30;
	this.maxLength = 2/this.updateInterval;
	this.lastUpdate = 0;
	this.update = function(){
		this.lastUpdate+=deltaTime;
		if(this.lastUpdate >= this.updateInterval){
			if(this.points.length < this.maxLength){
				this.points.push(new TrailPoint(this.parent.pos.x,this.parent.pos.y, this.maxLength*this.updateInterval));
				//this.points.push(new TrailPoint(this.parent.pos.x,this.parent.pos.y, 5));
			}
			else {
				for(var i = 0; i < this.points.length-1;i++){
					this.points[i] = this.points[i+1];

				}
				this.points[this.points.length-1] = new TrailPoint(this.parent.pos.x,this.parent.pos.y, this.maxLength*this.updateInterval);
				//this.points[this.points.length-1] = new TrailPoint(this.parent.pos.x,this.parent.pos.y, 5);
			}
			for(var i = 0; i < this.points.length;i++){
				this.points[i].age+=this.lastUpdate;
				if(this.points[i].age >= this.points[i].maxAge){

				}
			}
			this.lastUpdate = 0;

		}
	};
}
function TrailPoint(x,y,maxAge){
	this.pos = {x:x,y:y};
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
	this.randomSpread=.04;
	this.rotationSpeed = 1;
	this.trail = null;
	this.damage = 1;
}



function Explosion(x, y){
	this.id = 0;
	this.pos = {x:x,y:y};
	this.lifetime=.3;
	this.age=0;
	this.radius = 40;
	this.color = {r:255,g:255,b:150};
}

function Particle(x, y, fadeOpacity, fadeSize, fadeDirection, duration, radius, color, opacity){
	this.fadeOpacity = fadeOpacity;
	this.fadeSize = fadeSize;
	this.sizeFadeDirection = fadeDirection;
	this.id = frameIndex*100+particles.length;
	this.pos = {x:x,y:y};
	this.lifetime=duration;
	this.age=0;
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
	this.play = function(volume){
		this.sound.currentTime = 0;
		this.sound.volume = volume;
	  this.sound.play();
	}
	this.stop = function(){
	  this.sound.pause();
	}
}
//#endregion

//#region INIT VARIABLES



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
]

var playerImage = [];
var playerImageCount = 9;

for(var i = 0; i < playerImageCount;i++){
	var img = new Image();
	img.src = 'images/player' + i + '.png';
	playerImage.push(img);
}
console.log(playerImage);

var gameArea = document.getElementById("gameArea");
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var menu = document.getElementById("menu");
var scoreDisplay = document.getElementById("scoreDisplay");
var costDisplay = document.getElementById("costDisplay");
var shipNameDisplay = document.getElementById("shipNameDisplay");
var nextShipNameDisplay = document.getElementById("nextShipNameDisplay");

var chatMessageArea = document.getElementById("chatMessageContainer");
var chatInput = document.getElementById("chatInput");
var chatSend = document.getElementById("chatSend");

var menuOpen = false;

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
		


var shooting = false;
var shootingSecondary = false;

var alternativeControls = false;
var inertialDampening = true;

var shieldEnabled = true;

var enemyCount = 0;
var maxEnemyCount = 0;
var score = 0;

var enemySpawnTimer = 0;

var imageData;

var trueDeltaTime = 1/fps;
var slowMotion = false;
var timeMultiplier = 1;
var deltaTime = trueDeltaTime * timeMultiplier;

var maxCooldown = .2;
var cooldownStart = .1;
var weaponCooldown = maxCooldown;

var enemyCooldown = .2;


var maxVelocityMagnitude;
var velocityMagnitude = 0;
var velocityNormalised = {x:0,y:0};

var lastPos = {x:0,y:0};

var gameOverScreenTimeout = 2;

var pointerDistance = 300;

var zoom = 1;

var hitboxSize = .7;

var pingSendInterval = 1;
var lastPingSent = 0;
var pingTimeout = 0;
var maxPingTimeout = 15;
//#endregion

//#region INIT FUNCTION CALLS

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

var mousePos = {x:0,y:0};

gameArea.onmousemove = mouseMove;
gameArea.onmousedown = mouseDown;
document.onmouseup = mouseUp;

document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
gameArea.addEventListener("wheel", wheel, false);

chatInput.addEventListener("keydown", chatKeyDown, false);

gameArea.addEventListener('contextmenu', function(evt) { 
	if(!alternativeControls)evt.preventDefault();
  }, false);



function wheel(event) {
	if (event.deltaY < 0){
		if (zoom < 5) zoom += 0.1;
	}
	if (event.deltaY > 0) {
		if (zoom > 0.2) zoom -= 0.1;
	}
}


inputVelocity = 0;
inputRotation = 0;


function keyDown(event) {
	var key = event.key.toUpperCase();
	//console.log("key down: " + key);
	if(document.activeElement != chatInput){
	if(!menuOpen){
		if (key == "W") {
			inputVelocity = 1;
		}
		else if (key == "D") {
			inputRotation = 1;
		}
		else if (key == "S") {
			inputVelocity = -1;
		}
		else if (key == "A") {
			inputRotation = -1;
		}
		else if (key == " ") {
			shooting = true;
		}
		else if (key == "SHIFT") {
			shootingSecondary = true;
		}
		else if (key == "E") {
			if(shooting && !alternativeControls)  shooting = false;
			alternativeControls = !alternativeControls;
		}
		else if (key == "Q") {
			inertialDampening = !inertialDampening;
		}
		else if (key == "R") {
			shieldEnabled = !shieldEnabled;
			localPlayer.shieldEnabled = shieldEnabled;
		}
		else if (key == "T") {
			constantDeltaTime = !constantDeltaTime;
		}
		else if (key == "ENTER") {
			chatInput.focus();
			/*var messages = document.getElementsByClassName('chatMessage');
			for (var i = 0; i < messages.length; i++) {
			messages[i].style.display = "block"; 
			}*/
		}
	}
	if (key == "ESCAPE") {
		menuOpen = !menuOpen;
		if(menuOpen){
			menu.style.display="flex";
			scoreDisplay.innerHTML = score;
			costDisplay.innerHTML = upgradeCost;
			if(localPlayer.level < playerImageCount){
				shipNameDisplay.innerHTML = shipName[localPlayer.level];
				if(localPlayer.level < playerImageCount-1){
					nextShipNameDisplay.innerHTML = shipName[localPlayer.level+1];
					document.getElementById("nextShipImage").src=playerImage[localPlayer.level+1].src;
				}
			}
		}
		else {
			menu.style.display="none";
		}
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
	if (key == "W") {
		if(inputVelocity==1)
		inputVelocity = 0;
	}
	else if (key == "D") {
		if(inputRotation==1)
		inputRotation = 0;
	}
	else if (key == "S") {
		if(inputVelocity==-1)
		inputVelocity = 0;
	}
	else if (key == "A") {
		if(inputRotation==-1)
		inputRotation = 0;
	}
	else if (key == " ") {
		shooting = false;
	}
	else if (key == "SHIFT") {
		shootingSecondary = false;
	}
}

function mouseDown(event) {
	if(!menuOpen){
		if(event.button == 0){
			if(!alternativeControls) shooting = true;
		}
		if(event.button == 2){
			if(!alternativeControls) inputVelocity = 1;
		}
	}

}
function mouseMove(event) {
	mousePos.x = event.pageX;
	mousePos.y = event.pageY;
}


function mouseUp(event) {
	if(!menuOpen){
		if(event.button == 0){
			if(!alternativeControls) shooting = false;
		}
		if(event.button == 2){
			if(!alternativeControls) inputVelocity = 0;
		}
	}
}

function chatKeyDown(event) {
	var key = event.key.toUpperCase();
	if(key == "ENTER"){
        if(chatInput == document.activeElement){
            sendChat();
		}
	}
	if (key == "ENTER") {
		/*var messages = document.getElementsByClassName('chatMessage');
		for (var i = 0; i < messages.length; i++) {
			messages[i].style.display = ""; 
		}*/
		event.stopPropagation();
		chatInput.blur();
		gameArea.focus();
	}
}

//#endregion

//#region NETWORK FUNCTIONS

function connect(){
	connection = new WebSocket('wss://all-we-ever-want-is-indecision.herokuapp.com');
	connection.onopen = onConnectionOpen;
	connection.onmessage = onConnectionMessage;
	connection.onclose = function(){
		console.log("Connection closed, last ping sent " + lastPingSent + " s ago.");
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

function onConnectionOpen(){
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
				if(playerName)
				localPlayer.name = playerName;
				localPlayer.color = playerColor;
				localPlayer.trail.color = playerColor;
				document.documentElement.style.setProperty('--playerColor', CSScolor(localPlayer.color ));
				if(colorLuminance(localPlayer.color) > 128)
					document.documentElement.style.setProperty('--textColor',"black");
				else
					document.documentElement.style.setProperty('--textColor',"white");
				
				
				console.log("Added Local Player with ID " + localPlayer.id);
				/*sendPos();
				sendColor();
				sendSpeed();*/
				
				
				
			}
		}
		if(message.subtype == "start"){
			sendPlayerData();
			gameStart();
		}
		if(message.subtype=="playerIDs"){
			var ids = message.data.split(',');
			console.log("PlayerIDs message. Content: " + message.data);
			if (ids.length > 1) {
				for (i = 0; i < ids.length; i++) {
					if(ids[i] != localPlayer.id){
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
				console.log("Assigned ID: " + newPlayer.id);
				addChatMessage("Someone joined the game.");

				sendPlayerData();
			}
		}
		if (message.subtype == "leaveUser") {
			if (message.data != localPlayer.id) {
				addChatMessage("Player " + findPlayerWithID(message.data).name + " left the game.");
				console.log("Leave player: " + message.data + ", UserID: " + localPlayer.id);
				//removePlayer(message.data);
				removeIDFromArray(players,message.data);
			}
		}
		if (message.subtype == "userID") {
			console.log("New local ID: "+message.data);
			localPlayer.id = message.data;
			localPlayer.team = message.data;
		}
		if (message.subtype == "userCount") {
			console.log("New user Count: "+message.data);
			playerCount = message.data;
			if(message.data > 2)
				chatInput.placeholder = "Chat with " + (playerCount-1) + " other players";
			else if(message.data > 1)
				chatInput.placeholder = "Chat with " + (playerCount-1) + " other player";
			else if(message.data == 1)
				chatInput.placeholder = "Chat with yourself. You're alone here.";
		}
		if(message.subtype == "ping"){
			console.log("Received ping after " + pingTimeout + " s");
			pingTimeout = 0;
			if(message.requestReply){
				//sendPing();
				//Temporary: Disabled due to possible looping pings
			}
		}
	}
	if (message.type == "message") {
		var messageContent = JSON.parse(message.data);
		var messageData = JSON.parse(messageContent.data);
		if (message.userID != localPlayer.id) {
			player = findPlayerWithID(message.userID);

			if (players != null) {
				if (messageContent.type == "coordinates") {
					player.pos = JSON.parse(messageData.pos);
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
					player.trail.color = player.color;
				}
				if (messageContent.type == "death") {
					player.hp = 0;
					//PLAYER DEATH
					createExplosion(player.pos.x,player.pos.y,20);
					player.speed = 0;
					console.log("team of dead: " + player.team + " team of local: " + localPlayer.team);
					if(messageData.killer == localPlayer.id){
						score+=player.level+1;
					}
					removeIDFromArray(players,player.id);

				}
				if (messageContent.type == "hit") {
					removeIDFromArray(projectiles,messageData.projectileID);
					if(messageData.shield){
						soundShieldHit.play(.15);
					}
					else{
						player.hp -= 1;
						soundHit.play(.15);
					}
					createExplosion(player.pos.x,player.pos.y,1);
					console.log("team of hit: " + player.team + " team of local: " + localPlayer.team);

				}
				if (messageContent.type == "hp") {
					player.hp = messageData.hp;
					player.maxHp = messageData.maxHp;
					player.energy = messageData.energy;
					player.maxEnergy = messageData.maxEnergy;
					player.shieldEnabled = messageData.shield;
					//player.level = messageData.level;
					

				}
				if (messageContent.type == "level") {
					player.level = messageData.level;
					player.size = messageData.size;
					

				}
				if (messageContent.type == "name") {
					
					player.name = messageData.name;
					

				}
				
				
				
			}

		}
		if (messageContent.type == "chat") {
			player = findPlayerWithID(message.userID);
			if(player != null)
			addChatMessage(messageData.text,player);
			

		}
		if (messageContent.type == "shoot") {
			var shootPos = JSON.parse(messageData.pos);
			var shooterID = messageData.shooter;
			var shootVelocity = JSON.parse(messageData.velocity);
			var shootRot = messageData.rot;
			var damage = messageData.dmg;
			console.log("receiving shoot from ID " + shooterID);
			spawnProjectile(shootPos,shootRot,shootVelocity,shooterID, damage);
		}
	}

	}

//#region SEND FUNCTIONS

function sendPos() {
	connection.send(JSON.stringify({ type: "coordinates", data: JSON.stringify({pos:JSON.stringify(localPlayer.pos),rot:localPlayer.rot}) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendSpeed() {
	connection.send(JSON.stringify({ type: "speed", data: JSON.stringify({speed:localPlayer.speed}) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendColor() {
	connection.send(JSON.stringify({type: "color", data: JSON.stringify({color:JSON.stringify(localPlayer.color)}) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function sendPlayerData() {
	sendPos();
	sendSpeed();
	sendColor();
	sendHP();
	sendName();
	sendLevel();
}

function sendProjectile(pos,rot,velocity,shooter,dmg) {
	connection.send(JSON.stringify({ type: "shoot", data: JSON.stringify({pos:JSON.stringify(pos),rot:rot,velocity:JSON.stringify(velocity),shooter:shooter,dmg:dmg}) }));
	console.log("sending shoot from ID " + shooter);
}

function sendDeath(id,killer) {
	connection.send(JSON.stringify({ type: "death", data: JSON.stringify({id:id,killer:killer}) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}
function sendHit(id,pid,shield) {
	connection.send(JSON.stringify({ type: "hit", data: JSON.stringify({id:id, projectileID:pid,shield:shield}) }));
	//console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}
function sendHP(){
	connection.send(JSON.stringify({ type: "hp", data: JSON.stringify({hp:localPlayer.hp,maxHp:localPlayer.maxHp,energy:localPlayer.energy,maxEnergy:localPlayer.maxEnergy,shield:shieldEnabled}) }));
}
function sendLevel(){
	connection.send(JSON.stringify({ type: "level", data: JSON.stringify({level:localPlayer.level,size:localPlayer.size}) }));
}
function sendName(){
	connection.send(JSON.stringify({ type: "name", data: JSON.stringify({name:localPlayer.name}) }));
}
function sendPing(){
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
}
function sendChat(){
	var msg = chatInput.value;
	if(msg.trim() != ""){
	chatInput.value = null;
	connection.send(JSON.stringify({ type: "chat", data: JSON.stringify({text:msg})}));
	}

}
//#endregion

//#endregion

//#region GAME FUNCTIONS

function addPlayer(ai){
	var p = new Player(players.length);
	//p.id = players.length;
	p.ai = ai;
	p.color = {r:randomInt(50,255),g:randomInt(50,255),b:randomInt(50,255)};

	
	if(ai){
		p.color = {r:250,g:0,b:0};
		p.speed = 400;
		p.rotationSpeed = 3;
		p.hp = 4;
		p.maxHp = 4;
		p.name = "AI"
		console.log("Added AI player with ID" + p.id);
	}
	p.trail.color = p.color;
	players.push(p);
	
	return p;
}

function createExplosion(x,y,size){
	var e = new Explosion(x,y);
	e.id = explosions.push(e)-1;
	e.id = nextExplosionID;
	nextExplosionID++;
	e.color = {r:randomInt(200,255),g:randomInt(40,200),b:randomInt(0,80)};
	e.radius = 40 * size;
	e.lifetime = 0.3 * Math.sqrt(size);
	if(size > 1) soundExplosion.play(1);
	while(size > 2){
		createExplosion(x + randomInt(-100,100),y + randomInt(-100,100),randomFloat(0.5,2.5));
		//setTimeout(function(){createExplosion(x + randomInt(-100,100),y + randomInt(-100,100),randomFloat(0.5,2.5));},randomInt(0,100));
		size-=1;
	}
}

function createParticle(x,y,size){
	var e = new Explosion(x,y);
	e.id = explosions.push(e)-1;
	e.id = nextExplosionID;
	nextExplosionID++;
	e.color = {r:randomInt(200,255),g:randomInt(40,200),b:randomInt(0,80)};
	e.radius = 40 * size;
	e.lifetime = 0.3 * Math.sqrt(size);
	while(size > 2){
		createExplosion(x + randomInt(-100,100),y + randomInt(-100,100),randomFloat(0.5,2.5));
		//setTimeout(function(){createExplosion(x + randomInt(-100,100),y + randomInt(-100,100),randomFloat(0.5,2.5));},randomInt(0,100));
		size-=1;
	}
}

function shootProjectile(shooter){
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

	var pv = {x:shooter.velocity.x,y:shooter.velocity.y};
	if(shooter.ai) console.log("pv",pv);

	pv.x += Math.cos(shooter.rot) * 1500;
	pv.y += Math.sin(shooter.rot) * 1500;
	sendProjectile(shooter.pos,shooter.rot,pv,shooter.id,1);
}

function spawnProjectile(pos,rot,velocity,shooterID,dmg){
	var shooter = findPlayerWithID(shooterID);
	var p = new Projectile(shooter);
	p.pos.x=pos.x;
	p.pos.y=pos.y;
	p.rot=rot;
	p.guided = false;
	p.velocity.x = velocity.x;
	p.velocity.y = velocity.y;
	p.damage = dmg;
	console.log("shooting",velocity,p.velocity);

	

	//p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = shooter.color;
	p.id = projectiles.push(p)-1;
	p.id = nextProjectileID;
	nextProjectileID++;
	p.lifetime = randomFloat(0.9,1,1);
	soundLaser.play(.3);
}

function shootGuidedProjectile(shooter, target){
	var p = new Projectile(shooter);
	p.pos.x=shooter.pos.x;
	p.pos.y=shooter.pos.y;
	p.rot=shooter.rot;
	p.guided = true;
	p.speed = 100;
	p.target = target;
	p.rotationSpeed = 2.5;

	

	p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = shooter.color;
	p.id = projectiles.push(p)-1;
	p.id = nextProjectileID;
	nextProjectileID++;
	p.lifetime = 2;
	p.trail = new Trail(p);
	p.trail.thickness = .5;
	p.trail.maxLength = 50;
	p.trail.color = {r:230,g:100,b:0};
}

function shootAtTarget(shooter, target){
	var p = new Projectile(shooter);
	p.rot = shooter.rot;
	p.pos.x=shooter.pos.x;
	p.pos.y=shooter.pos.y;

	//p.speed = 1000;
	var distanceToTarget = distancePos(target, p);
	var timeToTarget = distanceToTarget / p.speed;

	var predictedTargetPos = {x: target.pos.x + target.velocity.x / deltaTime * timeToTarget, y:target.pos.y + target.velocity.y / deltaTime * timeToTarget};

	//p.rot = Math.atan2(target.pos.y-p.pos.y,target.pos.x-p.pos.x);

	//p.rot = Math.atan2(predictedTargetPos.y-p.pos.y,predictedTargetPos.x-p.pos.x);

	p.randomSpread = 0.2;

	p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = {r:255,g:0,b:0};
	p.color = shooter.color;
	p.lifetime = randomFloat(1.4,1.6);
	if(p.lifetime >= timeToTarget){
		p.id = projectiles.push(p)-1;
		p.id = nextProjectileID;
		nextProjectileID++;
		soundLaser.play(.3);
	}
}

function addChatMessage(text,player){
	var newMsg = document.createElement("div");
	newMsg.classList.add("chatMessage");
	if(player != null){
			var msgName = document.createElement("span");
			newMsg.appendChild(msgName);
			msgName.innerHTML = player.name;
			msgName.style.color=CSScolor(player.color);
			newMsg.innerHTML += ": ";
	}
	else {
		newMsg.style.color=CSScolor(localPlayer.color);
		}
			newMsg.innerHTML += text;
			chatMessageArea.appendChild(newMsg);
			newMsg.addEventListener('animationend', function(e) {
				newMsg.style.display = "none";
			  }, {
				capture: false,
				once: true,
				passive: false
			  });
}

function upgrade(){
	if(score >= upgradeCost){
		score-=upgradeCost;
		upgradeCost++;
		localPlayer.thrust+=200;
		localPlayer.rotationSpeed += 0.5;
		maxCooldown*=.9;
		localPlayer.maxHp++;
		localPlayer.hp++;
		localPlayer.level++;
		localPlayer.maxEnergy+=20;
		localPlayer.energyRecharge+=2;
		scoreDisplay.innerHTML = score;
		costDisplay.innerHTML = upgradeCost;
		if(localPlayer.level < playerImageCount){
			shipNameDisplay.innerHTML = shipName[localPlayer.level];
			if(localPlayer.level < playerImageCount-1){
				nextShipNameDisplay.innerHTML = shipName[localPlayer.level+1];
				document.getElementById("nextShipImage").src=playerImage[localPlayer.level+1].src;
			}
		}
		var pImg = playerImage[localPlayer.level];
		if(localPlayer.level >= playerImageCount)
		var pImg = playerImage[playerImageCount-1];
		document.getElementById("shipImage").src=pImg.src;
		if(localPlayer.level >= 5){
			localPlayer.size = 200;
		}
		sendLevel();
	}
}

//#endregion

//#region UPDATE
function update(timestamp) {
	//console.log("frame");
	if (running) {
		//TODO: DELTATIME
		if(frameIndex == 0) lastFrame = Date.now();
		trueDeltaTime=(Date.now()-lastFrame)/1000;

		if(constantDeltaTime)trueDeltaTime = 1/60;

		deltaTime = trueDeltaTime * timeMultiplier;

		lastFrame = Date.now();
		//TODO: DELTATIME
		frameIndex++;
		fpsCurrentCount++;
		fpsCurrentTime+= trueDeltaTime;
		if(fpsCurrentCount >= fpsCounterFrames){
			fpsCurrentCount = 0;
			currentFps = fpsCurrentTime;
			fpsCurrentTime = 0;

		}

		if(connected){
			sendPing();
			sendHP();
			if(localPlayer.hp > 0)
			sendPos();
		}

		mouseWorldPos = screenToWorldCoords(mousePos);

		//#region INIT
		
		
		ctx.translate(lastPos.x,lastPos.y);
		
		
		//#endregion

		
		//#region LOCAL PLAYER MOVEMENT
		
		maxVelocityMagnitude = localPlayer.speed;

		if(alternativeControls){
			localPlayer.rot += inputRotation * localPlayer.rotationSpeed * deltaTime;
			if(inputVelocity != 0 && localPlayer.hp > 0){
				localPlayer.velocity.x += Math.cos(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime;
				localPlayer.velocity.y += Math.sin(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime;
			}
			else if (inertialDampening) {
				localPlayer.velocity.x *= 1 - .3 * deltaTime;
				localPlayer.velocity.y *= 1 - .3 * deltaTime;
			}
			velocityMagnitude = Math.sqrt(Math.abs(Math.pow(localPlayer.velocity.x,2)+Math.pow(localPlayer.velocity.y,2)));

			if(Math.abs(velocityMagnitude) > maxVelocityMagnitude){
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
			rotateToTarget(localPlayer,{pos:mouseWorldPos});

			if(inputVelocity != 0 && localPlayer.hp > 0){
				localPlayer.velocity.x += Math.cos(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime;
				localPlayer.velocity.y += Math.sin(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime;
			}
			if(inputRotation!= 0 && localPlayer.hp > 0){
				localPlayer.velocity.x -= Math.sin(localPlayer.rot) * inputRotation * localPlayer.thrust * deltaTime;
				localPlayer.velocity.y += Math.cos(localPlayer.rot) * inputRotation * localPlayer.thrust * deltaTime;
			}
			if (inputVelocity == 0 && inputRotation == 0 && inertialDampening) {
				localPlayer.velocity.x *= 1 - .5 * deltaTime;
				localPlayer.velocity.y *= 1 - .5 * deltaTime;
			}
			velocityMagnitude = Math.sqrt(Math.abs(Math.pow(localPlayer.velocity.x,2)+Math.pow(localPlayer.velocity.y,2)));
			
			if(Math.abs(velocityMagnitude) > maxVelocityMagnitude){
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

		if (inputVelocity == 0 && Math.abs(velocityMagnitude) < 200) {
			localPlayer.velocity.x -= 200 * deltaTime * Math.sign(localPlayer.velocity.x);
			localPlayer.velocity.y -= 200 * deltaTime * Math.sign(localPlayer.velocity.y);
			if(Math.abs(localPlayer.velocity.x) < 10 && Math.abs(localPlayer.velocity.y) < 10){
				localPlayer.velocity.x = 0;
				localPlayer.velocity.y = 0;
			}
		}
		
		//#endregion

		//#region HITBOX CALCULATION
				for(var i = 0; i < players.length;i++){
					var p = players[i];
		
					p.pos.x += p.velocity.x * deltaTime;
					p.pos.y += p.velocity.y * deltaTime;
		
					p.hitbox = [{x:p.pos.x-hitboxSize*p.size/2,y:p.pos.y-hitboxSize*p.size/2},{x:p.pos.x+hitboxSize*p.size/2,y:p.pos.y-hitboxSize*p.size/2},{x:p.pos.x+hitboxSize*p.size/2,y:p.pos.y+hitboxSize*p.size/2},{x:p.pos.x-hitboxSize*p.size/2,y:p.pos.y+hitboxSize*p.size/2}]
				}
				//#endregion

				lastPos.x = localPlayer.pos.x - canvas.width/2/zoom;
				lastPos.y = localPlayer.pos.y - canvas.height/2/zoom;

		//#region SCREEN SPACE BG FX
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = CSScolor({r:19,g:22,b:25});
		ctx.fillRect(0,0,canvas.width,canvas.height);

		ctx.fillStyle="white";
		ctx.textAlign="left";
		ctx.fillText("DeltaTime: " + trueDeltaTime.toFixed(3),30,30);
		ctx.fillText("True FPS: " + (1/trueDeltaTime).toFixed(0),30,60);
		ctx.fillText("Avg FPS: " + (fpsCounterFrames/currentFps).toFixed(0),30,90);
		
		//AIMING CURSOR
		/*ctx.strokeStyle = CSScolor({r:80,g:80,b:80});
		ctx.beginPath();
		ctx.arc(mousePos.x, mousePos.y,10,0,Math.PI*2);
		ctx.stroke();
		*/
		ctx.font = "20px Century Gothic";
		ctx.textAlign = "left";


		ctx.fillStyle = CSScolor({r:80,g:80,b:80});

		ctx.textAlign = "center";
		//#region CONTROLS PROMPT
			
			
			if(!alternativeControls){
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("press E for alternative controls", canvas.width/2, canvas.height - 300);
			}
			else {
				ctx.fillStyle = CSScolor({r:50,g:50,b:50});
				ctx.fillText("press E for normal controls", canvas.width/2, canvas.height - 300);
			}
			if(inertialDampening){
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("press Q to turn off inertial dampening", canvas.width/2, canvas.height - 260);
				
			}
			else {
				ctx.fillStyle = CSScolor({r:50,g:50,b:50});
				ctx.fillText("press Q to turn on inertial dampening", canvas.width/2, canvas.height - 260);
			}

			if(!menuOpen){
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("(ESC) shop", canvas.width/2, canvas.height - 180);
				
			}
			if(shieldEnabled){
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("(R) turn off shields", canvas.width/2, canvas.height - 140);
				
			}
			else{
				ctx.fillStyle = CSScolor({r:50,g:50,b:50});
				ctx.fillText("(R) turn on shields", canvas.width/2, canvas.height - 140);
			}
			ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("Kills: " + score, canvas.width/2, canvas.height - 220);

			
		//#endregion

		//#region PLAYER CIRCLE HUD
			
			ctx.lineWidth = 3;
			ctx.strokeStyle=CSScolorAlpha({r:255,g:255,b:255},.1);
			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance + 6,0,Math.PI*2);
			ctx.stroke();
			ctx.strokeStyle=CSScolorAlpha({r:255,g:255,b:255},.2);
			ctx.beginPath();
			ctx.arc(canvas.width/2 + localPlayer.velocity.x * pointerDistance / 900, canvas.height/2  + localPlayer.velocity.y * pointerDistance / 900,5,0,Math.PI*2);
			ctx.stroke();

		//#region GAUGES
			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(1.75),Math.PI *(0.25));
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(0.75),Math.PI *(1.25));
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 15,Math.PI*(0.75),Math.PI *(1.25));
			ctx.stroke();

			//HP

			ctx.strokeStyle=CSScolor(localPlayer.color);

			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(1.75 - 0.001 + 0.5 * (1-(localPlayer.hp / localPlayer.maxHp))),Math.PI *(0.25));
			ctx.stroke();

			//COOLDOWN

			ctx.strokeStyle=CSScolor({r:180,g:30,b:30});

			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(0.75),Math.PI *(1.25 -  0.5 * ((weaponCooldown / cooldownStart))));
			ctx.stroke();

			ctx.strokeStyle=CSScolor({r:170,g:110,b:40});

			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 15,Math.PI*(0.75),Math.PI *(1.25 -  0.5 * (1-(localPlayer.energy / localPlayer.maxEnergy))));
			ctx.stroke();
			//#endregion
			
		//#endregion


		ctx.scale(zoom,zoom);
		ctx.translate(-lastPos.x,-lastPos.y);

		ctx.lineWidth = 3;
		ctx.strokeStyle=CSScolorAlpha({r:255,g:255,b:255},.1);
		ctx.fillStyle=ctx.strokeStyle;
		ctx.beginPath();
		ctx.arc(200, 200,100,0,Math.PI*2);
		ctx.arc(200, 200,110,0,Math.PI*2);
		ctx.stroke();
		ctx.fillText("SPAWN",200,210);

		var bgPos = [];
		bgPos[0] = screenToWorldCoords({x:0,y:0});
		bgPos[1] = screenToWorldCoords({x:canvas.width,y:0});
		bgPos[2] = screenToWorldCoords({x:canvas.width,y:canvas.height});
		bgPos[3] = screenToWorldCoords({x:0,y:canvas.height});

		
			
		for(var x=bgPos[0].x - backgroundImage.width - (bgPos[0].x % backgroundImage.width);x<bgPos[1].x;x+=backgroundImage.width){
			for(var y=bgPos[0].y - backgroundImage.height - (bgPos[0].y % backgroundImage.height);y<bgPos[3].y;y+=backgroundImage.height){
				//if((x >= bgPos[0].x && x <= bgPos[1].x)||(y >= bgPos[0].y && y <= bgPos[3].y)){
					//ctx.fillStyle="gray";
					//ctx.fillRect(x,y,backgroundImage.width, backgroundImage.height);
					ctx.drawImage(backgroundImage,x,y,backgroundImage.width,backgroundImage.height);
					//ctx.fillStyle="red";
					//ctx.fillRect(x,y,10, 10);
				//}
			}
		}

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

		//#region ENEMY SPAWNING
		if(enemyCount < maxEnemyCount){
			enemySpawnTimer+= deltaTime;
			if(enemySpawnTimer > 5){
				var aip = addPlayer(true);
				aip.team = 2;
				enemyCount++;
				enemySpawnTimer = 0;
			}
		}
		
		enemyCooldown -= deltaTime;
		
		//#endregion
		
		

		//#region PLAYERS LOOP
		for(var i = 0;i<players.length;i++){
			var p = players[i];
		}

		//#endregion

		//#region LOCAL SHOOTING


		weaponCooldown-=deltaTime;
		if(weaponCooldown<0){
			weaponCooldown = 0;
		}


		if(localPlayer.hp > 0){
			if(shooting){
				if(weaponCooldown<=0 && localPlayer.energy >= 5){
					//SHOOTING LAG MITIGATION
					p.pos.x += 3 * p.velocity.x * deltaTime;
					p.pos.y += 3 * p.velocity.y * deltaTime;
					
					shootProjectile(localPlayer);
					
					//SHOOTING LAG MITIGATION

					localPlayer.energy-=5;
					p.pos.x -= 3 * p.velocity.x * deltaTime;
					p.pos.y -= 3 * p.velocity.y * deltaTime;
					weaponCooldown = maxCooldown;
					cooldownStart = weaponCooldown;
				}
			}
			if(shootingSecondary){
				if(weaponCooldown<=0){

					if(enemyCount > 0){
					var tgt = null;
					var lowestDist = 2*distancePos(localPlayer,players[1]);
					for(var t = 0; t < players.length; t++){
						if(players[t] != localPlayer){
							if(players[t].hp > 0){
								d = distancePos(localPlayer,players[t]);
								if(lowestDist > d){
									lowestDist = d;
									tgt = players[t];
								}
							}
						}
					}
					if(tgt != null){
						shootGuidedProjectile(localPlayer,tgt);
						weaponCooldown = 2;
						cooldownStart = weaponCooldown;
					}
				}
			}
			}
			if(weaponCooldown == 0){
				localPlayer.energy+= localPlayer.energyRecharge*deltaTime;
				if(localPlayer.energy > localPlayer.maxEnergy) localPlayer.energy = localPlayer.maxEnergy;
				localPlayer.hp += .1 * deltaTime;
				if(localPlayer.hp > localPlayer.maxHp) localPlayer.hp = localPlayer.maxHp;
			}
		}
		//#endregion

		//#region PLAYERS AI
		for(var i = 0;i<players.length;i++){
			var p = players[i];
			if(p.ai && p.hp > 0){
				rotateToTarget(p,localPlayer);

				var distance = distancePos(localPlayer, p);

				var slowingDistance = 500;
				var stoppingDistance = 200;

				if(distance > slowingDistance){
					targetThrust = 1;
				}
				else if (distance < stoppingDistance){
					targetThrust = 0;
				}
				else {
					targetThrust = (distance - stoppingDistance) / (slowingDistance - stoppingDistance);
				}

				p.velocity.x = Math.cos(p.rot) * 1 * p.speed * deltaTime * targetThrust;
				p.velocity.y = Math.sin(p.rot) * 1 * p.speed * deltaTime * targetThrust;
				if(enemyCooldown <=0){
					shootProjectile(p);
					}
			}
		}

		if(enemyCooldown <=0){
			enemyCooldown = .2;
		}
		//#endregion

		//#region DRAW PLAYERS
		for(var i = 0;i<players.length;i++){
			var p = players[i];
			if(p.hp > 0){

				//TEST IF ON SCREEN
				if(p.pos.x - localPlayer.pos.x < canvas.width/2/zoom && p.pos.x - localPlayer.pos.x > -canvas.width/2/zoom && p.pos.y - localPlayer.pos.y < canvas.height/2/zoom && p.pos.y - localPlayer.pos.y > -canvas.height/2/zoom){
					//DRAW TRAIL
					p.trail.update();
					renderTrail(p.trail);
					
					
					//DRAW PLAYER

					ctx.lineWidth = 3;
					ctx.strokeStyle=CSScolorAlpha({r:255,g:255,b:255},.1);
					ctx.beginPath();
					ctx.arc(p.pos.x, p.pos.y,p.size/2,0,Math.PI*2);
					ctx.stroke();
					ctx.strokeStyle=CSScolorAlpha(p.color,.5);
					ctx.beginPath();
					ctx.arc(p.pos.x, p.pos.y,p.size/2,0,Math.PI*2 * (p.hp/p.maxHp));
					ctx.stroke();

					

					
					ctx.fillStyle=CSScolorAlpha(p.color,.5);
					ctx.fillText(p.name,p.pos.x,p.pos.y+(p.size*.5)+30);

					ctx.save();
					ctx.translate(p.pos.x, p.pos.y);
					ctx.rotate(p.rot);
					ctx.translate(-p.pos.x, -p.pos.y);
					ctx.fillStyle=CSScolor(p.color);
					//ctx.fillRect(0, 0, canvas.width, canvas.height);
					//ctx.globalCompositeOperation="destination-in";
					var pImg = playerImage[p.level];
					if(p.level >= playerImageCount)
					var pImg = playerImage[playerImageCount-1];
					ctx.drawImage(pImg, p.pos.x - p.size/2, p.pos.y - p.size/2, p.size, p.size);
					ctx.restore();

					if(p.shieldEnabled){

						var shieldColor = {r:30,g:150,b:200}
						ctx.lineWidth = 3 * (p.energy/p.maxEnergy);
						ctx.strokeStyle=CSScolorAlpha(shieldColor,.8 * (p.energy/p.maxEnergy));
						ctx.fillStyle=CSScolorAlpha(shieldColor,.2 * (p.energy/p.maxEnergy));
						ctx.beginPath();
						ctx.arc(p.pos.x, p.pos.y,p.size/2 + 10,0,Math.PI*2);
						ctx.stroke();
						ctx.fill();
					}

					/*ctx.fillStyle = CSScolor(p.color);
					ctx.fillText(p.rot,p.pos.x,p.pos.y+30);*/
					//DRAW SMOKE
					if(p.hp <= p.maxHp/2){
						if(p.hp <= p.maxHp/3 && p.hp >= p.maxHp/5 && frameIndex % 4 == 0){
							particles.push(new Particle(p.pos.x+randomFloat(-15,15),p.pos.y+randomFloat(-15,15),true,true,-1,1,40,{r:0,g:0,b:0},.3));
						}
						if(p.hp <= p.maxHp/5 && frameIndex % 3 == 0){
							particles.push(new Particle(p.pos.x+randomFloat(-15,15),p.pos.y+randomFloat(-15,15),true,true,-1,1.5,50,{r:0,g:0,b:0},1));
						}
						if(p.hp <= p.maxHp/10 && frameIndex % 5 == 0){
							particles.push(new Particle(p.pos.x+randomFloat(-25,25),p.pos.y+randomFloat(-25,25),true,true,-1,1.2,10,{r:200,g:80,b:0},1));
						}
					}
				}
				else {
					//DRAW POINTER

					ctx.translate(lastPos.x,lastPos.y);
					ctx.scale(1/zoom,1/zoom);
					ctx.fillStyle = CSScolor(p.color);
					var rotToPlayer = objectRot(localPlayer,p);
					ctx.save();
					rotateCtx(canvas.width/2, canvas.height/2, rotToPlayer);
					//ctx.fillRect(canvas.width/2 + pointerPos.x - 10,canvas.height/2 + pointerPos.y - 10,20,20);
					//ctx.fillRect(canvas.width/2 + pointerDistance,canvas.height/2,20,2);

					ctx.beginPath();
					ctx.moveTo(canvas.width/2 + pointerDistance+12, canvas.height/2);
					ctx.lineTo(canvas.width/2 + pointerDistance, canvas.height/2 - 6);
					ctx.lineTo(canvas.width/2 + pointerDistance, canvas.height/2 + 6);
					ctx.fill();

					ctx.restore();
					ctx.scale(zoom,zoom);
					ctx.translate(-lastPos.x,-lastPos.y);
				}
			}
		}
		//#endregion

		//#region DRAW HITBOXES
		/*
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
		
		}*/
		//#endregion

		//#region PROJECTILES LOOP
		for(var i = 0; i < projectiles.length; i++){

			var p = projectiles[i];

			p.age += deltaTime;

			//#region MOVE PROJECTILE
			if(!p.guided){
				p.pos.x += p.velocity.x * deltaTime;
				p.pos.y += p.velocity.y * deltaTime;
			}
			else {
				rotateToTarget(p,p.target);
				p.speed += 800 * deltaTime;
				p.pos.x += Math.cos(p.rot) * p.speed * deltaTime;
				p.pos.y += Math.sin(p.rot) * p.speed * deltaTime;
				p.trail.update();
				renderTrail(p.trail);
			}
			//#endregion

			//#region KILL IF TOO OLD
			if(p.age > p.lifetime){
				/*ctx.fillStyle="white";
				ctx.beginPath();
				ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
				ctx.fill();*/
				createExplosion(p.pos.x,p.pos.y,.5);
				removeIDFromArray(projectiles,p.id);
				continue;
			}
			//#endregion

			//#region DRAW PROJECTILE


			ctx.save();
			ctx.fillStyle=CSScolor(p.color);
			rotateCtx(p.pos.x,p.pos.y,p.rot);
			if(!p.guided){
				ctx.fillRect(p.pos.x-10,p.pos.y-1.5,20,3);
				ctx.fillStyle=CSScolorAlpha(p.color,0.5);
				ctx.fillRect(p.pos.x-30,p.pos.y-1.5,30,3);
				ctx.fillStyle=CSScolorAlpha(p.color,0.3);
				ctx.fillRect(p.pos.x-60,p.pos.y-1.5,40,3);
				ctx.fillStyle=CSScolorAlpha(p.color,0.2);
				ctx.fillRect(p.pos.x-100,p.pos.y-1.5,100,3);
			}
			else {
				ctx.fillRect(p.pos.x-10,p.pos.y-2.5,20,5);
				
			}
			ctx.restore();


			//#endregion

			//#region DETECT COLLISION

			//#region SINGLEPLAYER VARIANT
			
			if(p.shooter == localPlayer){
				for(var ii = 0; ii < players.length;ii++){
					var player = players[ii];
					if(player.ai){
						if(player.hp > 0 && player.team != p.shooter.team){
							if(p.pos.x < player.hitbox[1].x && p.pos.x > player.hitbox[0].x){
								if(p.pos.y < player.hitbox[3].y && p.pos.y > player.hitbox[0].y){
									player.hp -= 1;
									soundHit.play(.15);
									if(player.hp <= 0){
										player.hp = 0;
										//PLAYER DEATH
										createExplosion(p.pos.x,p.pos.y,20);
										player.speed = 0;
										enemyCount--;
										score++;
										removeIDFromArray(players,player.id);
									}
									createExplosion(p.pos.x,p.pos.y,1);
									removeIDFromArray(projectiles,p.id);
								}
							}
						}
					}
				}
			}
				
				//#endregion

				//MULTIPLAYER VARIANT
					var player = localPlayer
					if(player.hp > 0 && player.id != p.shooter.id){
						if(p.pos.x < player.hitbox[1].x && p.pos.x > player.hitbox[0].x){
							if(p.pos.y < player.hitbox[3].y && p.pos.y > player.hitbox[0].y){
								if(shieldEnabled && player.energy >= 20){
									player.energy-=20;
									soundShieldHit.play(.2);
									sendHit(player.id, p.id,true);
									/*weaponCooldown=.5;
									cooldownStart=.5;*/
								}
								else{
									player.hp -= 1;
									soundHit.play(.2);
									sendHit(player.id, p.id,false);
								}
								if(player == localPlayer){
									particles.push(new Particle(player.pos.x,player.pos.y,true,false,1,.12,10000,{r:230,g:20,b:0},.1));
								}
								if(player.hp <= 0){
									player.hp = 0;
									sendDeath(player.id,p.shooter.id);
									//PLAYER DEATH
									createExplosion(p.pos.x,p.pos.y,20);
									player.speed = 0;
									/*if(player.team == 2){
										enemyCount--;
										score++;
									}*/
									removeIDFromArray(players,player.id);
								}
								createExplosion(p.pos.x,p.pos.y,1);
								removeIDFromArray(projectiles,p.id);
							}
						}
					

			}
			//#endregion
		}
		//#endregion
		
		//#region EXPLOSIONS LOOP
		for(var i = 0; i < explosions.length; i++){
			var e = explosions[i];
			e.age += deltaTime;

			//DRAW EXPLOSION
			var lifetimeRatio = (e.lifetime-e.age)/e.lifetime;
			ctx.fillStyle=CSScolorAlpha(e.color,lifetimeRatio);
			ctx.beginPath();
			ctx.arc(e.pos.x, e.pos.y, (1-lifetimeRatio)*e.radius, 0, 2 * Math.PI);
			ctx.fill();
			
			//KILL IF TOO OLD
			if(e.age > e.lifetime){
				/*ctx.fillStyle="white";
				ctx.beginPath();
				ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
				ctx.fill();*/
				removeIDFromArray(explosions,e.id);
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
		//#endregion

		//#region PARTICLES LOOP
		for(var i = 0; i < particles.length; i++){
			var p = particles[i];

			p.age += deltaTime;
			//KILL IF TOO OLD
			if(p.age > p.lifetime){
				/*ctx.fillStyle="white";
				ctx.beginPath();
				ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
				ctx.fill();*/
				removeIDFromArray(particles,p.id);
				continue;
			}
			
			var lifetimeRatio = (p.age)/p.lifetime;
			var tempOpacity = p.opacity;
			var tempRadius = p.radius;
			if(p.fadeSize){
				tempRadius = p.radius * (1 + (lifetimeRatio * p.sizeFadeDirection));
				if(tempRadius < 0){
					console.log("Invalid particle radius:",p.radius, lifetimeRatio, p.age, p.lifetime);
				}
			}
			if(p.fadeOpacity){
				tempOpacity = p.opacity * (1-Math.abs(2*(lifetimeRatio-0.5)));
			}

			//DRAW PARTICLE

			ctx.fillStyle=CSScolorAlpha(p.color,tempOpacity);
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
		//#endregion

		//#region DRAW HUD

		ctx.translate(lastPos.x,lastPos.y);

		ctx.scale(1/zoom,1/zoom);
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
		if(localPlayer.hp <= 0){
			if(gameOverScreenTimeout <= 0){
				console.log("HP: ", localPlayer.hp);
				ctx.fillStyle = CSScolor({r:0,g:0,b:0});
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("Game over. No restart button yet. Sorry.", canvas.width/2, canvas.height/2);
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("Score: " + score, canvas.width/2, canvas.height/2 + 40);
				running = false;
			}
			else gameOverScreenTimeout -= deltaTime;

		}
		//#endregion
		
		//#endregion
		
		ctx.translate(-lastPos.x,-lastPos.y);
		
	}
	window.requestAnimationFrame(update);
}
//#endregion

//#region GAME UTLITY FUNCTIONS

function screenToWorldCoords(screenPos){
	var worldPos = {x:screenPos.x,y:screenPos.y};
	worldPos.x -= canvas.width/2;
	worldPos.y -= canvas.height/2;
	worldPos.x *= 1*1/zoom;
	worldPos.y *= 1*1/zoom;
	worldPos.x += localPlayer.pos.x;
	worldPos.y += localPlayer.pos.y;
	return worldPos;
}

function rotateToTarget(object,target){
	if(Math.abs(object.rot)>Math.PI*2){
		object.rot = object.rot % (Math.PI*2);
	}
	var targetRot = objectRot(object,target);
	var rotDiff = Math.abs(targetRot-object.rot);
	if(rotDiff > Math.PI){
		targetRot = Math.sign(object.rot)*2*Math.PI + targetRot;
		rotDiff = Math.abs(targetRot-object.rot);
	}
	if(Math.abs(targetRot-object.rot) <= object.rotationSpeed*deltaTime){
		object.rot = targetRot;
	}
	else {
		object.rot += Math.sign(targetRot-object.rot) * object.rotationSpeed*deltaTime;
	}
}

function objectRot(from,to){
	return Math.atan2(to.pos.y-from.pos.y,to.pos.x-from.pos.x);
}

function rotateCtx(x,y,angle){
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.translate(-x, -y);
}


function removeIDFromArray(array,id){
	for(var i = 0; i < array.length; i++){
		if(array[i].id == id){
			array.splice(i,1);
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

function renderTrail(trail){
	if(trail.points.length > 0){
		for(var t = 0; t < trail.points.length-1; t++){
			ctx.beginPath();
			ctx.moveTo(trail.points[t].pos.x,trail.points[t].pos.y);
			ctx.lineTo(trail.points[t+1].pos.x,trail.points[t+1].pos.y);
			ctx.strokeStyle=CSScolorAlpha(trail.color,1-(trail.points[t].age/trail.points[t].maxAge));
			ctx.lineWidth = trail.thickness * 5*(1-(trail.points[t].age/trail.points[t].maxAge));
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.moveTo(trail.points[trail.points.length-1].pos.x,trail.points[trail.points.length-1].pos.y);
		ctx.lineTo(trail.parent.pos.x,trail.parent.pos.y);
		ctx.strokeStyle=CSScolorAlpha(trail.color,1-(trail.points[t].age/trail.points[t].maxAge));
		ctx.lineWidth = trail.thickness * 5*(1-(trail.points[t].age/trail.points[t].maxAge));
		ctx.stroke();
	}
	else {
		console.log("Trail has no points");
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

	running = true;
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

function colorLuminance(color){
    return (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);
}

function randomInt(min,max){
	return(Math.floor(Math.random()*(max-min)) + min);
}
function randomFloat(min,max){
	return(Math.random()*(max-min) + min);
}

function distancePos(a,b){
	return Math.sqrt(Math.abs(Math.pow(a.pos.y-b.pos.y,2)+Math.pow(a.pos.x-b.pos.x,2)));
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

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return decodeURI(pair[1]);}
       }
       return(false);
}
//#endregion