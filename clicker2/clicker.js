var resourceDisplay = document.getElementsByClassName("resourceDisplay");

var resources = []
resources[0] = 0;

document.addEventListener("mousemove", collect);

function collect(){
    resourceID=0;
    //button.blur();
    resources[resourceID]++;
    resourceDisplay[resourceID].innerHTML = resources[resourceID];
    //if(resources[resourceID]==10){
        document.body.style.backgroundPosition=1*resources[resourceID]+"vw";
    //}
}