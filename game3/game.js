function Player(id) {
	this.ID = id;
	this.pos = { x: 50, y: 50 };
	this.rot = 0;
	this.speed = 10;
	this.rotationSpeed = .05;
	this.color = { r: 100, g: 80, b: 200 };
};

function Projectile(shooter) {
	this.id = 0;
	this.shooter = shooter;
	this.pos = { x: 50, y: 50 };
	this.rot = 0;
	this.speed = 30;
	this.color = { r: 255, g: 255, b: 255 };
	this.age = 0;
	this.lifetime = 1;
	this.randomSpread=.05;
};

var projectiles = [];

var playerImage = document.getElementById("playerImage");

var playerImage = new Image();
playerImage.src = 'images/player.png';

console.log(playerImage);

var gameArea = document.getElementById("gameArea");
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var player = new Player(0);


var loadingScreen = document.getElementById("loadingScreen");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gameArea.style.height = window.innerHeight + "px";
document.body.style.height = window.innerHeight + "px";

var fps = 60;
		
setInterval(update, 1000 / fps);

gameStart();


document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
document.addEventListener("wheel", wheel, false);



function wheel(event) {
	
}


inputVelocity = 0;
inputRotation = 0;


function keyDown(event) {
	var key = event.key.toUpperCase();
	//console.log("key down: " + key);
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
		shootProjectile();
	}
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
}

function mouseDown(event) {
	

}
function mouseMove(event) {
	
}
function mouseUp(event) {
	
}

function shootProjectile(){
	var p = new Projectile(player);
	p.pos.x=player.pos.x;
	p.pos.y=player.pos.y;
	p.rot=player.rot;
	p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = player.color;
	p.id = projectiles.push(p)-1;
}

var deltaTime = 1/fps;

function update() {
	if (running) {


		//TODO: DELTATIME
		deltaTime=deltaTime;
		//TODO: DELTATIME


		player.rot += inputRotation * player.rotationSpeed;
		player.pos.x += Math.cos(player.rot) * inputVelocity * player.speed;
		player.pos.y += Math.sin(player.rot) * inputVelocity * player.speed;


		ctx.clearRect(0, 0, canvas.width, canvas.height);

		//DRAW PLAYER
		ctx.save();
		ctx.translate(player.pos.x, player.pos.y);
		ctx.rotate(player.rot);
		ctx.translate(-player.pos.x, -player.pos.y);
		ctx.fillStyle =CSScolor(player.color);
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalCompositeOperation="destination-in";
		ctx.drawImage(playerImage, player.pos.x - 15, player.pos.y - 15, 30, 30);
		ctx.restore();

		for(var i = 0; i < projectiles.length; i++){
			var p = projectiles[i];
			//MOVE PROJECTILE
			p.pos.x += Math.cos(p.rot) * p.speed;
			p.pos.y += Math.sin(p.rot) * p.speed;
			p.age += deltaTime;
			//KILL IF TOO OLD
			if(p.age > p.lifetime){
				/*ctx.fillStyle="white";
				ctx.beginPath();
				ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
    			ctx.fill();*/
				removeProjectile(p.id);
				continue;
			}
			//DRAW PROJECTILE
			ctx.save();
			//ctx.fillStyle=CSScolor(p.color);
			ctx.fillStyle="red";
			rotateCtx(p.pos.x,p.pos.y,p.rot);
			ctx.fillRect(p.pos.x-10,p.pos.y-2,20,4);
			ctx.restore();
		}

	}
}

function rotateCtx(x,y,angle){
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.translate(-x, -y);
}

function removeProjectile(id){
	for(var i = 0; i < projectiles.length; i++){
		if(projectiles[i].id == id){
			projectiles.splice(i,1);
		}
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



