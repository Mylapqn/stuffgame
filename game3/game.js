//#region OBJECT DEFS


function Player(id) {
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
	this.trail=new Trail(this);
	this.team = 1;
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
		console.log(this.lastUpdate, deltaTime);
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
	this.rot = 0;
	this.speed = 2000;
	this.color = { r: 255, g: 255, b: 255 };
	this.age = 0;
	this.lifetime = 1;
	this.randomSpread=.04;
	this.rotationSpeed = 1;
	this.trail = null;
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
//#endregion

//#region INIT VARIABLES
var frameIndex = 0;

var projectiles = [];
var explosions = [];
var particles = [];

var nextProjectileID = 0;
var nextExplosionID = 0;

var playerHeight = 100;
var playerWidth = 100;

var playerImage = new Image();
playerImage.src = 'images/player.png';

console.log(playerImage);

var gameArea = document.getElementById("gameArea");
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var localPlayer = new Player(0);
var players = [localPlayer];





var loadingScreen = document.getElementById("loadingScreen");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gameArea.style.height = window.innerHeight + "px";
document.body.style.height = window.innerHeight + "px";

var fps = 60;
		


var shooting = false;
var shootingSecondary = false;

var alternativeControls = false;
var inertialDampening = true;

var enemyCount = 0;
var maxEnemyCount = 3;
var score = 0;


var imageData;

var trueDeltaTime = 1/fps;
var slowMotion = false;
var timeMultiplier = 1;
var deltaTime = trueDeltaTime * timeMultiplier;

var maxCooldown = .1;
var cooldownStart = .1;
var weaponCooldown = maxCooldown;

var enemyCooldown = .2;

var enemySpawnTimer = 0;

var maxVelocityMagnitude = localPlayer.speed;
var velocityMagnitude = 0;
var velocityNormalised = {x:0,y:0};

var lastPos = {x:0,y:0};

var gameOverScreenTimeout = 2;

var pointerDistance = 300;

var zoom = 1;

var hitboxSize = .5;
//#endregion

//#region INIT FUNCTION CALLS


setInterval(update, 1000 / fps);

gameStart();

for(var i = 0; i < 3000; i++){
	particles.push(new Particle(randomInt(-canvas.width*3,canvas.width*3),randomInt(-canvas.height*3,canvas.height*3),true,false,1,10,1,{r:255,g:255,b:255},randomFloat(0.2,1)));
}

//#endregion

//#region INPUT


document.addEventListener("keydown", keyDown, false);
document.addEventListener("keyup", keyUp, false);
document.addEventListener("wheel", wheel, false);



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
		alternativeControls = !alternativeControls;
	}
	else if (key == "Q") {
		inertialDampening = !inertialDampening;
	}
	else if (key == "F") {
		slowMotion = !slowMotion;
		if(slowMotion) timeMultiplier = 1/4;
		else timeMultiplier = 1;
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
	else if (key == " ") {
		shooting = false;
	}
	else if (key == "SHIFT") {
		shootingSecondary = false;
	}
}

function mouseDown(event) {
	

}
function mouseMove(event) {
	
}
function mouseUp(event) {
	
}

//#endregion

//#region GAME FUNCTIONS


function addAIPlayer(){
	var p = new Player(players.length);
	//p.id = players.length;
	p.ai = true;
	p.color = {r:250,g:0,b:0};
	p.speed = 400;
	p.rotationSpeed = 3;
	p.hp = 4;
	console.log("Added AI player with ID" + p.id);
	if(p.id == 1)

	p.color = {r:255,g:0,b:0};

	else

	p.color = {r:0,g:255,b:0};

	p.trail.color = p.color;
	p.pos.x=1000;
	p.pos.y=1000;
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
	var p = new Projectile(shooter);
	p.pos.x=shooter.pos.x;
	p.pos.y=shooter.pos.y;
	p.rot=shooter.rot;

	

	p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = shooter.color;
	p.id = projectiles.push(p)-1;
	p.id = nextProjectileID;
	nextProjectileID++;
	p.lifetime = randomFloat(0.9,1,1);
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
	if(p.lifetime >= timeToTarget)
	p.id = projectiles.push(p)-1;
	p.id = nextProjectileID;
	nextProjectileID++;
}

//#endregion

//#region UPDATE
function update() {
	if (running) {
		//TODO: DELTATIME
		trueDeltaTime=trueDeltaTime;
		deltaTime = trueDeltaTime * timeMultiplier;
		//TODO: DELTATIME
		frameIndex++;

		//#region INIT
		
		
		ctx.translate(lastPos.x,lastPos.y);
		lastPos.x = localPlayer.pos.x - canvas.width/2/zoom;
		lastPos.y = localPlayer.pos.y - canvas.height/2/zoom;
		
		//#endregion

		//#region SCREEN SPACE BG FX
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = CSScolor({r:19,g:22,b:25});
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		//#region CONTROLS PROMPT
			
			ctx.font = "20px Century Gothic";
			if(!alternativeControls){
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("press E for alternative controls", canvas.width/2-140, canvas.height - 300);
			}
			else {
				ctx.fillStyle = CSScolor({r:50,g:50,b:50});
				ctx.fillText("press E for normal controls", canvas.width/2-123, canvas.height - 300);
			}
			if(inertialDampening){
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("press Q to turn off inertial dampening", canvas.width/2-178, canvas.height - 260);
				
			}
			else {
				ctx.fillStyle = CSScolor({r:50,g:50,b:50});
				ctx.fillText("press Q to turn on inertial dampening", canvas.width/2-178, canvas.height - 260);
			}

			if(slowMotion){
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("press F to stop paying respects", canvas.width/2-145, canvas.height - 220);
				
			}
			else {
				ctx.fillStyle = CSScolor({r:50,g:50,b:50});
				ctx.fillText("press F to pay respects", canvas.width/2-110, canvas.height - 220);
			}
			ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("Kills: " + score, canvas.width/2-30, canvas.height - 180);

			
		//#endregion

		//#region PLAYER CIRCLE HUD
			
			ctx.lineWidth = 3;
			ctx.strokeStyle=CSScolorAlpha({r:255,g:255,b:255},.1);
			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance + 6,0,Math.PI*2);
			ctx.stroke();
			ctx.strokeStyle=CSScolorAlpha({r:255,g:255,b:255},.2);
			ctx.beginPath();
			ctx.arc(canvas.width/2 + localPlayer.velocity.x * pointerDistance / deltaTime / 900, canvas.height/2  + localPlayer.velocity.y * pointerDistance / deltaTime / 900,5,0,Math.PI*2);
			ctx.stroke();

		//#region GAUGES
			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(1.75),Math.PI *(0.25));
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(0.75),Math.PI *(1.25));
			ctx.stroke();

			//HP

			ctx.strokeStyle=CSScolor(localPlayer.color);

			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(1.75 - 0.001 + 0.5 * (1-(localPlayer.hp / 10))),Math.PI *(0.25));
			ctx.stroke();

			//COOLDOWN

			ctx.strokeStyle=CSScolor({r:180,g:80,b:30});

			ctx.beginPath();
			ctx.arc(canvas.width/2, canvas.height/2,pointerDistance - 5,Math.PI*(0.75),Math.PI *(1.25 -  0.5 * ((weaponCooldown / cooldownStart))));
			ctx.stroke();
			//#endregion
			
		//#endregion

		ctx.scale(zoom,zoom);
		ctx.translate(-lastPos.x,-lastPos.y);

		//#endregion

		//#region LOCAL PLAYER MOVEMENT
		
		localPlayer.rot += inputRotation * localPlayer.rotationSpeed * deltaTime;

		if(!alternativeControls){
			if(inputVelocity != 0 && localPlayer.hp > 0){
				localPlayer.velocity.x += Math.cos(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime * deltaTime;
				localPlayer.velocity.y += Math.sin(localPlayer.rot) * inputVelocity * localPlayer.thrust * deltaTime * deltaTime;
			}
			else if (inertialDampening) {
				localPlayer.velocity.x *= 1 - .3 * deltaTime;
				localPlayer.velocity.y *= 1 - .3 * deltaTime;
			}
			velocityMagnitude = Math.sqrt(Math.abs(Math.pow(localPlayer.velocity.x,2)+Math.pow(localPlayer.velocity.y,2)));

			if(Math.abs(velocityMagnitude) > maxVelocityMagnitude*deltaTime){
				velocityNormalised.x = localPlayer.velocity.x / velocityMagnitude;
				velocityNormalised.y = localPlayer.velocity.y / velocityMagnitude;
				velocityMagnitude = Math.sign(velocityMagnitude) * maxVelocityMagnitude*deltaTime;
				localPlayer.velocity.x = velocityNormalised.x * velocityMagnitude;
				localPlayer.velocity.y = velocityNormalised.y * velocityMagnitude;
				localPlayer.velocity.x = velocityNormalised.x * velocityMagnitude;
				localPlayer.velocity.y = velocityNormalised.y * velocityMagnitude;
			}

			

		}
		else {
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
			
		}

		if (inputVelocity == 0 && Math.abs(velocityMagnitude) < 1) {
			localPlayer.velocity.x -= .5 * deltaTime * Math.sign(localPlayer.velocity.x);
			localPlayer.velocity.y -= .5 * deltaTime * Math.sign(localPlayer.velocity.y);
			if(Math.abs(localPlayer.velocity.x) < .1 && Math.abs(localPlayer.velocity.y) < .1){
				localPlayer.velocity.x = 0;
				localPlayer.velocity.y = 0;
			}
		}
		
		//#endregion

		//#region ENEMY SPAWNING
		if(enemyCount < maxEnemyCount){
			enemySpawnTimer+= deltaTime;
			if(enemySpawnTimer > 5){
				var aip = addAIPlayer();
				aip.team = 2;
				enemyCount++;
				enemySpawnTimer = 0;
			}
		}

		enemyCooldown -= deltaTime;

		//#endregion
		
		//#region HITBOX CALCULATION
		for(var i = 0; i < players.length;i++){
			var p = players[i];

			p.pos.x += p.velocity.x;
			p.pos.y += p.velocity.y;

			p.hitbox = [{x:p.pos.x-hitboxSize*playerWidth/2,y:p.pos.y-hitboxSize*playerHeight/2},{x:p.pos.x+hitboxSize*playerWidth/2,y:p.pos.y-hitboxSize*playerHeight/2},{x:p.pos.x+hitboxSize*playerWidth/2,y:p.pos.y+hitboxSize*playerHeight/2},{x:p.pos.x-hitboxSize*playerWidth/2,y:p.pos.y+hitboxSize*playerHeight/2}]
		}
		//#endregion
		
		//#region LOCAL SHOOTING


		weaponCooldown-=deltaTime;
		if(weaponCooldown<0){
			weaponCooldown = 0;
		}


		if(localPlayer.hp > 0){
			if(shooting){
				if(weaponCooldown<=0){
					shootProjectile(localPlayer);
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
				localPlayer.hp += .3 * deltaTime;
				if(localPlayer.hp > 10) localPlayer.hp = 10;
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
					shootAtTarget(p,localPlayer);
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
					ctx.save();
					ctx.translate(p.pos.x, p.pos.y);
					ctx.rotate(p.rot);
					ctx.translate(-p.pos.x, -p.pos.y);
					ctx.fillStyle=CSScolor(p.color);
					//ctx.fillRect(0, 0, canvas.width, canvas.height);
					//ctx.globalCompositeOperation="destination-in";
					ctx.drawImage(playerImage, p.pos.x - playerWidth/2, p.pos.y - playerHeight/2, playerWidth, playerHeight);
					ctx.restore();
					/*ctx.fillStyle = CSScolor(p.color);
					ctx.fillText(p.rot,p.pos.x,p.pos.y+30);*/
					//DRAW SMOKE
					if(p.hp <= 3){
						if(p.hp <= 3 && p.hp >= 2 && frameIndex % 4 == 0){
							particles.push(new Particle(p.pos.x+randomFloat(-15,15),p.pos.y+randomFloat(-15,15),true,true,-1,1,40,{r:0,g:0,b:0},.3));
						}
						if(p.hp <= 2 && frameIndex % 3 == 0){
							particles.push(new Particle(p.pos.x+randomFloat(-15,15),p.pos.y+randomFloat(-15,15),true,true,-1,1.5,50,{r:0,g:0,b:0},1));
						}
						if(p.hp <= 1 && frameIndex % 5 == 0){
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
		{
		/*
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
		*/
		}
		//#endregion

		//#region PROJECTILES LOOP
		for(var i = 0; i < projectiles.length; i++){

			var p = projectiles[i];

			p.age += deltaTime;

			//#region MOVE PROJECTILE
			if(!p.guided){
				p.pos.x += Math.cos(p.rot) * p.speed * deltaTime;
				p.pos.y += Math.sin(p.rot) * p.speed * deltaTime;
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
			for(var ii = 0; ii < players.length;ii++){
				var player = players[ii];
				if(player.hp > 0 && player.team != p.shooter.team){
					if(p.pos.x < player.hitbox[1].x && p.pos.x > player.hitbox[0].x){
						if(p.pos.y < player.hitbox[3].y && p.pos.y > player.hitbox[0].y){
							player.hp -= 1;
							if(player == localPlayer){
								particles.push(new Particle(player.pos.x,player.pos.y,true,false,1,.12,10000,{r:230,g:20,b:0},.1));
							}
							if(player.hp <= 0){
								player.hp = 0;
								//PLAYER DEATH
								createExplosion(p.pos.x,p.pos.y,20);
								player.speed = 0;
								/*player.pos.x=-2000;
								player.pos.y=-2000;*/
								if(player.team == 2){
									enemyCount--;
									score++;
								}
								removeIDFromArray(players,player.id);
							}
							createExplosion(p.pos.x,p.pos.y,1);
							removeIDFromArray(projectiles,p.id);
						}
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
					console.log(p.radius, lifetimeRatio, p.age, p.lifetime);
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
			console.log("HP:", localPlayer.hp);
			if(gameOverScreenTimeout <= 0){
				ctx.fillStyle = CSScolor({r:0,g:0,b:0});
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("Game over. No restart button yet. Sorry.", canvas.width/2-188, canvas.height/2);
				ctx.fillStyle = CSScolor({r:80,g:80,b:80});
				ctx.fillText("Score: " + score, canvas.width/2-30, canvas.height/2 + 40);
				running = false;
			}
			else gameOverScreenTimeout -= deltaTime;

		}
		//#endregion
		
		//#endregion
		
		ctx.translate(-lastPos.x,-lastPos.y);
		

	}
}
//#endregion

//#region GAME UTLITY FUNCTIONS


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
		console.log("sdawq");
	}
}

//#endregion

//#region GENERAL UTILITY FUNCTIONS


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
                CONSOLE("polygons don't intersect!");
                return false;
            }
        }
    }
    return true;
}
//#endregion