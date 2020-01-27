function Player(id) {
	this.ID = id;
	this.pos = { x: 50, y: 50 };
	this.rot = 0;
	this.speed = 10;
	this.rotationSpeed = .05;
	this.color = { r: 0, g: 0, b: 0 };
};

var playerImage = document.getElementById("playerImage");
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
		
	}
}
function keyUp(event) {
	var key = event.key.toUpperCase();
	if (key == "W") {
		inputVelocity = 0;
	}
	else if (key == "D") {
		inputRotation = 0;
	}
	else if (key == "S") {
		inputVelocity = 0;
	}
	else if (key == "A") {
		inputRotation = 0;
	}
}

function mouseDown(event) {
	

}
function mouseMove(event) {
	
}
function mouseUp(event) {
	
}

function update() {
	if (running) {
		player.rot += inputRotation * player.rotationSpeed;
		player.pos.x += Math.cos(player.rot) * inputVelocity * player.speed;
		player.pos.y += Math.sin(player.rot) * inputVelocity * player.speed;


		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.translate(player.pos.x, player.pos.y);
		ctx.rotate(player.rot);
		ctx.translate(-player.pos.x, -player.pos.y);
		//ctx.fillRect(player.pos.x - 10, player.pos.y - 10, 20, 20);
		ctx.drawImage(playerImage, player.pos.x - 10, player.pos.y - 10, 20, 20);
		ctx.restore();
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



