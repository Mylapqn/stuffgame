self.addEventListener("message", message => {
    if (message.data.type == "connect") {
        console.log("Connecting...");
        connection = new WebSocket('wss://stuffgame.ws.coal.games/');
        connection.binaryType = "arraybuffer";
        connection.onopen = onConnectionOpen;
        connection.onmessage = onConnectionMessage;
        connection.onclose = onConnectionClose;
    }
    if (message.data.type == "posData") {
        //console.log(message.data.input);
        input = message.data.input;
        targetRot = message.data.targetRot;
        //shooting = message.data.shooting;
    }
    //console.log(message.data);
});

var connected = false;
function onConnectionClose(e) {
    //console.log("Connection closed, last ping sent " + lastPingSent + " s ago.");
    console.log("Connection closed. Code: " + e.code + " Reason: " + e.reason);
    connected = false;
    /*setTimeout(function () {
        loadingScreen.style.animationPlayState = "paused";
        removeAllPlayers();
    }, 1000);*/
    postMessage({ type: "connectionClose" });
}
function onConnectionOpen() {
    console.log("Connection opened");
    connected = true;
    postMessage({ type: "connectionOpen" });
    connection.send(generateStartBuffer());
}

function onConnectionMessage(messageRaw) {
    var ms = messageRaw.data;
    //console.log("Networker received message", ms);
    postMessage({ type: "connectionMessage", m: ms });

    parseMessage(messageRaw.data);

}



var refreshRate = 1 / 60;

var connection;

var input = { x: 0, y: 0 };
var targetRot = 0;
var shooting = false;
var name = "unnamed player client"+Math.floor(Math.random()*100)+"aa";
var color = randomColor();
var textEncoder = new TextEncoder();
var localID = -1;

function connect(c) {

}

setInterval(() => {
    sendAll();
}, refreshRate * 1000);

function generateStartBuffer() {
    var nameLength = textEncoder.encode(name).byteLength;
    console.log("NAme",nameLength,name);
    var sendBuffer = new ArrayBuffer(nameLength + 5);
    var pos = 0;
    pos += writeBufferUInt8(sendBuffer, pos, 2);
    pos += writeBufferUInt8(sendBuffer, pos, nameLength);
    pos += writeBufferString(sendBuffer, pos, nameLength, name);
    pos += writeBufferColor(sendBuffer, pos, color);
    //console.log(pos);
    console.log(sendBuffer);
    return sendBuffer;
}

function generateSendBuffer() {
    var pos = 0;
    var sendBuffer = new ArrayBuffer(14);
    pos += writeBufferUInt8(sendBuffer, pos, 1);
    pos += writeBufferVector32(sendBuffer, pos, input);
    pos += writeBufferFloat32(sendBuffer, pos, targetRot);
    pos += writeBufferUInt8(sendBuffer, pos, shooting);
    //console.log(pos);
    return sendBuffer;
}



function addToSendBuffer(data) {

}

function sendAll() {
    if (connected) {
        //console.log(sendBuffer);
        connection.send(generateSendBuffer());

    }
    else console.log("not connected");
}


function parseMessage(buf) {
    let pos = 0;
    let newPlayerCount = readBufferUInt8(buf, pos);
    pos += 1;
    for (let i = 0; i < newPlayerCount; i++) {
        pos=parseNewPlayer(buf, pos);
    }
    let playerCount = readBufferUInt8(buf, pos);
    pos += 1;
    for (let i = 0; i < playerCount; i++) {
        pos=parsePlayer(buf, pos);
    }
    //console.log("EXISTING PLAYERS:", playerCount,"NEW PLAYERS:", newPlayerCount);
}

function parseNewPlayer(buf, pos) {
    let id = readBufferUInt16(buf, pos);
    pos += 2;
    let ai = readBufferUInt8(buf, pos);
    pos += 1;
    let nameLength = readBufferUInt8(buf, pos);
    pos += 1;
    let name = readBufferString(buf, pos, nameLength);
    pos += nameLength;
    let color = readBufferColor(buf, pos);
    pos += 3;
    console.log("NEW PLAYER:", { id, ai, nameLength, name, color });
    if (localID == -1) localID = id;
    if (id == localID) {
        postMessage({ type: "gameStart" ,data:{ id, ai, nameLength, name, color }});
    }
    else {
        postMessage({ type: "newPlayer" ,data:{ id, ai, nameLength, name, color }});
    }
    return pos;
}
function parsePlayer(buf, pos) {
    let id = readBufferUInt16(buf, pos);
    //console.log("Parsing player", id, new Uint8Array(buf, pos, 41));
    pos += 2;
    let position = readBufferVector64(buf, pos);
    pos += 16;
    let vel = readBufferVector32(buf, pos);
    pos += 8;
    let rot = readBufferFloat32(buf, pos);
    pos += 4;
    let hp = readBufferFloat32(buf, pos);
    pos += 4;
    let shieldHP = readBufferFloat32(buf, pos);
    pos += 4;
    let shieldEnabled = readBufferUInt8(buf, pos);
    pos += 1;
    let shipID = readBufferUInt16(buf, pos);
    pos += 2;
    //console.log("ere", rot);
    postMessage({ type: "playerUpdate", data: { id, position, vel, rot, hp, shieldHP, shieldEnabled, shipID } });
    return pos;
}


function writeBufferColor(buffer, position, color) {
    let bytesColor = new Uint8Array(buffer, position, 3);
    bytesColor[0] = color.r;
    bytesColor[1] = color.g;
    bytesColor[2] = color.b;
    return 3;
}

function writeBufferString(buffer, position, length, string) {
    let bytesString = new Uint8Array(buffer, position, length);
    new TextEncoder().encodeInto(string, bytesString);
    return length;
}

function writeBufferUInt8(buffer, position, value) {
    let bytesInt = new Uint8Array(buffer, position, 1);
    bytesInt[0] = value;
    return 1;
}
function writeBufferUInt16(buffer, position, value) {
    let bytesInt = new DataView(buffer, position, 2);
    bytesInt.setUInt16(0, value);
    return 2;
}
function writeBufferFloat32(buffer, position, value) {
    let bytesFloat = new DataView(buffer, position, 4);
    bytesFloat.setFloat32(0, value);
    return 4;
}
function writeBufferFloat64(buffer, position, value) {
    let bytesDouble = new DataView(buffer, position, 8);
    bytesDouble.setFloat64(0, value);
    return 8;
}
function writeBufferVector32(buffer, position, vector) {
    let bytesFloat = new DataView(buffer, position, 8);
    bytesFloat.setFloat32(0, vector.x);
    bytesFloat.setFloat32(4, vector.y);
    return 8;
}
function writeBufferVector64(buffer, position, vector) {
    let bytesDouble = new DataView(buffer, position, 16);
    bytesDouble.setFloat64(0, vector.x);
    bytesDouble.setFloat64(8, vector.y);
    return 16;
}
function writeBufferColor(buffer, position, color) {
    let bytesColor = new Uint8Array(buffer, position, 3);
    bytesColor[0] = color.r;
    bytesColor[1] = color.g;
    bytesColor[2] = color.b;
    return 3;
}




function readBufferColor(buffer, position) {
    let bytesColor = new Uint8Array(buffer, position, 3);
    let color = {
      r: bytesColor[0],
      g: bytesColor[1],
      b: bytesColor[2]
    }
    return color;
}
  
function readBufferString(buffer, position, length) {
    let bytesString = new Uint8Array(buffer, position, length);
    return new TextDecoder().decode(bytesString);
}

function readBufferUInt8(buffer, position) {
    let bytesInt = new Uint8Array(buffer, position, 1);
    return bytesInt[0];
}
function readBufferUInt16(buffer, position) {
    let bytesInt = new DataView(buffer, position, 2);
    let value = bytesInt.getUint16(0);
    return value;
}
function readBufferFloat32(buffer, position) {
    let bytesFloat = new DataView(buffer, position, 4);
    let value = bytesFloat.getFloat32(0);
    return value;
}
function readBufferFloat64(buffer, position) {
    let bytesDouble = new DataView(buffer, position, 8);
    let value = bytesDouble.getFloat64(0);
    return value;
}
function readBufferVector32(buffer, position) {
    let bytesFloat = new DataView(buffer, position, 8);
    let vector = {
        x:bytesFloat.getFloat32(0),
        y:bytesFloat.getFloat32(4)
    }
    return vector;
}
function readBufferVector64(buffer, position) {
    let bytesDouble = new DataView(buffer, position, 16);
    let vector = {
        x:bytesDouble.getFloat64(0),
        y:bytesDouble.getFloat64(8)
    }
    return vector;
}

function randomInt(min, max) {
	return (Math.floor(Math.random() * (max - min)) + min);
}
function randomFloat(min, max) {
	return (Math.random() * (max - min) + min);
}
function randomColor() {
    return {
        r: randomInt(30, 255),
        g: randomInt(30, 255),
        b:randomInt(30,255)
    }
}