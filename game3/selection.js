var playerName;
var input = document.getElementById("playerName");
var button = document.getElementById("startGame");

input.addEventListener('input', updateValue);
input.addEventListener('keydown', keyDown);
/*input.addEventListener('keyup', updateValue);*/

newColor(document.getElementById("colorSelection"));

function updateValue() {
  playerName = input.value;
  if(playerName!=""){
    button.classList.remove("inactiveButton");
    button.classList.add("activeButton");
}
if(playerName==""){
    button.classList.remove("activeButton");
    button.classList.add("inactiveButton");
}
}

function keyDown(e){
    var key = e.key.toUpperCase();
    if(key == "ENTER"){
        if(input == document.activeElement)
            startGame(1);
    }
}

function startGame(mode){
    playerName = input.value;
    if(playerName!=""){
        if(mode == 0){

        }
        if(mode == 1){
            window.location.href="multiplayer.html?name="+encodeURI(playerName)+"&color="+encodeURI(JSON.stringify(playerColor));
        }
    }
}
function newColor(button){
    playerColor = {r:randomInt(50,255),g:randomInt(50,255),b:randomInt(50,255)};
    button.style.backgroundColor = CSScolor(playerColor);
    var lum = colorLuminance(playerColor);
    if(lum < 128)
        button.style.color = "white";
    else
        button.style.color = "black";


}
function CSScolor(color) {
	return ("rgb(" + color.r + "," + color.g + "," + color.b + ")");
}

function colorLuminance(color){
    return (0.2126*color.r + 0.7152*color.g + 0.0722*color.b);
}

function randomInt(min,max){
	return(Math.floor(Math.random()*(max-min)) + min);
}