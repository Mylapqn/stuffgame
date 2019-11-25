function Player(id, object){
    this.ID = id;
    this.velocity = {x:0,y:0};
    this.pos = {x:0,y:0};
    this.playerObject = object;
    this.speed = 0.3;
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

document.addEventListener("keydown",keyDown, false);	
document.addEventListener("keyup",keyUp, false);
document.addEventListener("wheel",wheel, false);	

function wheel(event){
    if(event.deltaY < 0) players[0].speed +=0.1;
    if(event.deltaY > 0){
        if(players[0].speed > 0.1) players[0].speed -=0.1;
    }
    players[0].playerObject.style.borderWidth = players[0].speed / 0.3 * 10 + "px";
}

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
    if(running){
    for(var i = 0; i < players.length; i++){
        players[i].pos.x+=players[i].velocity.x*players[i].speed*1000/fps;
        players[i].pos.y-=players[i].velocity.y*players[i].speed*1000/fps;
        players[i].playerObject.style.left=players[i].pos.x + "px";
        players[i].playerObject.style.top=players[i].pos.y + "px";

        ctx.fillStyle = players[i].playerObject.style.backgroundColor;
        ctx.fillRect(players[i].pos.x + 32, players[i].pos.y + 32, 6, 6);
    }
    if(connected){
        if(players[0].velocity.x != 0 || players[0].velocity.y != 0){
            sendPos();
        }
    }
}
}
connection.onmessage = function(messageRaw){
    //console.log("message:" + messageRaw.data);
    var message = JSON.parse(messageRaw.data);
    if(message.type == "technical"){
        if(message.subtype == "init"){
            if(!running){
                addPlayer(message.data);
                sendPos();
                running=true;
            }
            if(message.data > 0){
                for(i = message.data - 1; i >= 0;i--){
                    console.log("Adding previously present player: " + i + ", Current UserID: " + message.data);
                    addPlayer(i);
                }
            }
        }
        if(message.subtype == "newUser"){
            if(message.data != userID){
                console.log("New player: " + message.data + ", UserID: " + userID);
                addPlayer(message.data);
                sendPos();
            }
        }
        if(message.subtype == "leaveUser"){
            if(message.data != userID){
                console.log("Leave player: " + message.data + ", UserID: " + userID);
                removePlayer(message.data);
            }
        }
        if(message.subtype == "userID"){
            userID = message.data;
            players[0].ID = userID;
            document.getElementById("userID").innerHTML = userID;
        }
    }
    if(message.type=="message"){
        if(message.userID != userID){
            console.log("eirfhewoitruh:   " + message.userID + userID)
            console.log("pos: " + JSON.parse(message.data).x);
            console.log("Player list length: " + players.length + ", UserID: " + message.userID + "Player list index: " + playerIndexFromID(message.userID));
        
            //TODO: unresolved: playerID and list index are not always same
            players[playerIndexFromID(message.userID)].pos = JSON.parse(message.data);

        }
    }

}

function sendPos(){
    connection.send(JSON.stringify(players[0].pos));
    console.log(players[0].pos + "s" + JSON.stringify(players[0].pos));
}

function playerIndexFromID(playerID){
    for(var i = 0; i < players.length; i++){
        console.log("Player index from id: scanning index " + i + " for ID " + playerID + ". Found ID: " + players[i].ID);
        if(players[i].ID == playerID){
            return i;
        }
    }
    return null;
}

function addPlayer(ID){
    console.log("adding player with ID " + ID);
    var npo = document.createElement("div");
    npo.classList.add("player");
    //npo.style.background = "black";
    var color = {r:(Math.random() * 255),g:(Math.random() * 255),b:(Math.random() * 255)};
    npo.style.backgroundColor = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
    npo.style.color = "rgb(" + (255 - color.r) + "," + (255 - color.g) + "," + (255 - color.b) + ")";
    npo.innerHTML = ID;
    document.getElementById("gameArea").appendChild(npo);
    players.push(new Player(ID, npo));
}
function removePlayer(ID){
    var index = playerIndexFromID(ID);
    console.log("removing player with ID " + ID);
    document.getElementById("gameArea").removeChild(players[index].playerObject);
    players.splice(index, 1);
}
function input(axis, input){
    if(axis == "x"){
        players[0].velocity.x=input;
        console.log("velocity X: " + players[0].velocity.x);

    }
    if(axis == "y"){
        players[0].velocity.y=input;
        console.log("velocity Y: " + players[0].velocity.y);
    }
}

setInterval(update,1000/fps);
