var player1 = {
    velocity : {x:0,y:0},
    pos : {x:0,y:1},
    player:document.getElementsByClassName("player")[0],
    speed : 5
    };
var player2 = {
    velocity : {x:0,y:0},
    pos : {x:0,y:1},
    player:document.getElementsByClassName("player")[1],
    speed : 5
    };

var userID;

var connected = false;

var connection = new WebSocket('wss://all-we-ever-want-is-indecision.herokuapp.com');

document.addEventListener("keydown",keyDown, false);	
document.addEventListener("keyup",keyUp, false);	

connection.onopen = function(){
    console.log("oper");
    connected = true;
}

function keyDown(event){
    var key = event.key.toUpperCase();
    console.log("key down: " + key);
    if (key == "W")
	{		
		input("y",1);
	}
	else if (key == "D")
	{	
		input("x",1);	
	}
	else if (key == "S")
	{	
		input("y",-1);	
	}
	else if (key == "A")
	{	
		input("x",-1);	
	}
}
function keyUp(event){
    var key = event.key.toUpperCase();
    if (key == "W")
	{		
		input("y",0);
	}
	else if (key == "D")
	{	
		input("x",0);	
	}
	else if (key == "S")
	{	
		input("y",0);	
	}
	else if (key == "A")
	{	
		input("x",0);	
	}
}

function update(){
    player1.pos.x+=player1.velocity.x*player1.speed;
    player1.pos.y-=player1.velocity.y*player1.speed;
    player1.player.style.left=player1.pos.x + "px";
    player1.player.style.top=player1.pos.y + "px";
    player2.player.style.left=player2.pos.x + "px";
    player2.player.style.top=player2.pos.y + "px";
    console.log("Player left" + player1.player.style.left + "Velocity X " + player1.velocity.x);
    if(connected) connection.send(JSON.stringify(player1.pos));
}
connection.onmessage = function(messageRaw){
    console.log("message:" + messageRaw.data);
    var message = JSON.parse(messageRaw.data);
    if(message.type == "technical"){
        if(message.subtype == "userID"){
            userID = message.data;
        }
    }
    if(message.type=="message"){
        if(message.userID != userID){
            console.log("eirfhewoitruh:   " + message.userID + userID)
        console.log("pos: " + JSON.parse(message.data).x);
        player2.pos = JSON.parse(message.data);
        }
    }

}
function input(axis, input){
    if(axis == "x"){
        player1.velocity.x=input;
        console.log("velocity X: " + player1.velocity.x);

    }
    if(axis == "y"){
        player1.velocity.y=input;
        console.log("velocity Y: " + player1.velocity.y);
    }
}

setInterval(update,100);