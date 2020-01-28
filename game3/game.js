function Player(id) {
	this.ID = id;
	this.pos = { x: 200, y: 200 };
	this.rot = 0;
	this.speed = 1000;
	this.velocity = {x:0,y:0};
	this.rotationSpeed = .05;
	this.color = { r: 100, g: 80, b: 200 };
	this.hitbox = [];
	this.hp = 10;
};

function Projectile(shooter) {
	this.id = 0;
	this.shooter = shooter;
	this.pos = { x: 50, y: 50 };
	this.rot = 0;
	this.speed = 1800;
	this.color = { r: 255, g: 255, b: 255 };
	this.age = 0;
	this.lifetime = 1;
	this.randomSpread=.05;
};

function Explosion(x, y){
	this.id = 0;
	this.pos = {x:x,y:y};
	this.lifetime=.3;
	this.age=0;
	this.radius = 40;
	this.color = {r:255,g:255,b:150};
}

var projectiles = [];
var explosions = [];

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

var shooting = false;



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
		shooting = true;
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
}

function mouseDown(event) {
	

}
function mouseMove(event) {
	
}
function mouseUp(event) {
	
}

function createExplosion(x,y,size){
	var e = new Explosion(x,y);
	e.id = explosions.push(e)-1;
	e.color = {r:randomInt(200,255),g:randomInt(50,230),b:randomInt(0,100)};
	e.radius = 40 * size;
	e.lifetime = 0.3 * Math.sqrt(size);
}


function shootProjectile(){
	var p = new Projectile(player);
	p.pos.x=player.pos.x;
	p.pos.y=player.pos.y;
	p.rot=player.rot;

	

	p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = player.color;
	p.id = projectiles.push(p)-1;
	p.lifetime = randomFloat(0.9,1,1);
}
function shootAtTarget(target){
	var p = new Projectile(null);
	p.rot = 0;
	p.pos.y = canvas.height/2;
	p.pos.x = canvas.width / 2;

	p.speed = 1000;
	var distanceToTarget = Math.sqrt(Math.abs(Math.pow(target.pos.y-p.pos.y,2)-Math.pow(target.pos.x-p.pos.x,2)));
	var timeToTarget = distanceToTarget / p.speed;
	console.log("sd" + timeToTarget);

	var predictedTargetPos = {x: target.pos.x + target.velocity.x / deltaTime * timeToTarget, y:target.pos.y + target.velocity.y / deltaTime * timeToTarget};

	//p.rot = Math.atan2(target.pos.y-p.pos.y,target.pos.x-p.pos.x);

	p.rot = Math.atan2(predictedTargetPos.y-p.pos.y,predictedTargetPos.x-p.pos.x);

	p.randomSpread = 0.02;

	p.rot += (Math.random()*2 - 1)*p.randomSpread;
	p.color = {r:255,g:0,b:0};
	p.lifetime = randomFloat(1.4,1.6);
	if(p.lifetime >= timeToTarget)
	p.id = projectiles.push(p)-1;
}


var deltaTime = 1/fps;

var maxCooldown = .5;
var weaponCooldown = maxCooldown;

var enemyCooldown = .2;

function update() {
	if (running) {


		//TODO: DELTATIME
		deltaTime=deltaTime;
		//TODO: DELTATIME


		//MOVE PLAYER
		player.rot += inputRotation * player.rotationSpeed;
		if(inputVelocity != 0){
			player.velocity.x = Math.cos(player.rot) * inputVelocity * player.speed * deltaTime;
			player.velocity.y = Math.sin(player.rot) * inputVelocity * player.speed * deltaTime;
		}
		else {
			player.velocity.x *= 1 - 1 * deltaTime;
			player.velocity.y *= 1 - 1 * deltaTime;
		}
		player.pos.x += player.velocity.x;
		player.pos.y += player.velocity.y;

var playerHeight = 40;
var playerWidth = 40;

		player.hitbox = [{x:player.pos.x-playerWidth/2,y:player.pos.y-playerHeight/2},{x:player.pos.x+playerWidth/2,y:player.pos.y-playerHeight/2},{x:player.pos.x+playerWidth/2,y:player.pos.y+playerHeight/2},{x:player.pos.x-playerWidth/2,y:player.pos.y+playerHeight/2}]

		

		weaponCooldown-=deltaTime;
		if(weaponCooldown<0){
			weaponCooldown = 0;
		}

		if(shooting){
			if(weaponCooldown<=0){
				shootProjectile();
				weaponCooldown = maxCooldown;
			}
		}
		enemyCooldown -= deltaTime;
		if(enemyCooldown <=0){
		shootAtTarget(player);
		enemyCooldown = .1;
		}
			


		ctx.clearRect(0, 0, canvas.width, canvas.height);

		//DRAW PLAYER
		{
		ctx.save();
		ctx.translate(player.pos.x, player.pos.y);
		ctx.rotate(player.rot);
		ctx.translate(-player.pos.x, -player.pos.y);
		ctx.fillStyle =CSScolor(player.color);
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalCompositeOperation="destination-in";
		ctx.drawImage(playerImage, player.pos.x - 15, player.pos.y - 15, 30, 30);
		ctx.restore();
		}

		ctx.strokeStyle="red";
		ctx.beginPath();
		ctx.moveTo(player.hitbox[0].x,player.hitbox[0].y);
		for(var i = 0; i < player.hitbox.length;i++){
			var p = player.hitbox[i];
			ctx.lineTo(p.x,p.y);
			//console.log(i, p.x,p.y);
			
		}
		ctx.closePath();
		//ctx.stroke();

		//PROJECTILES LOOP
		for(var i = 0; i < projectiles.length; i++){
			var p = projectiles[i];
			//MOVE PROJECTILE
			p.pos.x += Math.cos(p.rot) * p.speed * deltaTime;
			p.pos.y += Math.sin(p.rot) * p.speed * deltaTime;
			p.age += deltaTime;

			//KILL IF TOO OLD
			if(p.age > p.lifetime){
				/*ctx.fillStyle="white";
				ctx.beginPath();
				ctx.arc(p.pos.x, p.pos.y, 50, 0, 2 * Math.PI);
				ctx.fill();*/
				createExplosion(p.pos.x,p.pos.y,.5);
				removeIDFromArray(projectiles,p.id);
				continue;
			}

			//DRAW PROJECTILE
			ctx.save();
			ctx.fillStyle=CSScolor(p.color);
			rotateCtx(p.pos.x,p.pos.y,p.rot);
			ctx.fillRect(p.pos.x-15,p.pos.y-2,30,4);
			ctx.restore();

			//DETECT COLLISION
			if(p.pos.x < player.hitbox[1].x && p.pos.x > player.hitbox[0].x){
				if(p.pos.y < player.hitbox[3].y && p.pos.y > player.hitbox[0].y){
					player.hp -= 1;
					if(player.hp <= 0){
						createExplosion(p.pos.x,p.pos.y,4);
						player.speed = 0;
						player.pos.x=-2000;
					}
					createExplosion(p.pos.x,p.pos.y,1);
					removeIDFromArray(projectiles,p.id);
				}
			}
		}
		//EXPLOSIONS LOOP
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

		//DRAW HUD
		ctx.lineWidth = 1;
		ctx.strokeStyle="gray";
		ctx.beginPath();
		ctx.moveTo(80, 50);
		ctx.lineTo(80 + 300, 50);
		ctx.stroke();
		ctx.lineWidth = 4;
		ctx.strokeStyle=CSScolor(player.color);
		ctx.beginPath();
		ctx.arc(50, 50,30,-Math.PI/2,(weaponCooldown/maxCooldown*2*Math.PI)-Math.PI/2);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(80, 50);
		ctx.lineTo(80 + player.hp*30, 50);
		ctx.stroke();
		ctx.lineWidth = 1;
		

	}
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


function detectCollision (a, b) {
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
};