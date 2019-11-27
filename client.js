var connection = new WebSocket('wss://all-we-ever-want-is-indecision.herokuapp.com');
var userID;

connection.onopen = function () {
    console.log("connection open");
};
document.getElementById("input").addEventListener("keyup", function(event){
    if(event.key == "Enter"){
        sendMessage();
    }
})
function sendMessage(){
    var m = document.getElementById("input").value;
    if(m != ""){
        connection.send(JSON.stringify({type:"text",data:m}));
    }
    document.getElementById("input").value = null;
}
connection.onopen = function(){
    document.getElementById("status").innerHTML = "Connected.";
    document.getElementById("input").removeAttribute("disabled");
}

connection.onmessage = function(messageRaw){
    console.log('Received message: ', messageRaw.data);
    try {
        var message = JSON.parse(messageRaw.data);
    } catch (e) {
        console.log('Invalid JSON: ', message.data);
        return;
    }

    if(message.type == "technical"){
        if(message.subtype == "userID"){
            document.getElementById("userID").innerHTML = message.data;
            userID = message.data;
        }
        if(message.subtype == "userCount"){
            document.getElementById("userCount").innerHTML = message.data;
        }
    }
    if(message.type == "message"){
        var messageData = JSON.parse(message.data);
        if(messageData.type == "text"){
            var newParagraph = document.createElement("p");
            if(userID == message.userID){
                newParagraph.innerHTML = "You: " + messageData.data;
                newParagraph.classList.add("ownMessage");
            }
            else {
                newParagraph.innerHTML = "User " + message.userID + ": " + messageData.data;
            }
            document.getElementById("content").appendChild(newParagraph);
            document.getElementById("content").appendChild(document.createElement("br"));
            document.getElementById("content-wrapper").scrollTop += 100;
        }
    }
    if(message.type == "info"){
        var newParagraph = document.createElement("p");
        newParagraph.innerHTML = message.data;
        newParagraph.setAttribute("class", "systemInfo");
        document.getElementById("content").appendChild(newParagraph);
        document.getElementById("content").appendChild(document.createElement("br"));
        document.getElementById("content-wrapper").scrollTop += 100;
    }
}
/*
connection.onmessage = function(message){
    document.getElementById("content").innerHTML += message.data;
    /*if(message.type == "technical"){
        if(message.subtype == "userID"){
            document.getElementById("userID").innerHTML = "User ID: " + message.data;
        }
    }
    if(message.type == "message"){
        document.getElementById("content").innerHTML += message.data;
    }
}
*/