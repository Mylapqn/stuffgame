var x = 0;
var nextPrice = 1;
var nextGatherPrice = 10;
var upgrade = 0;
var upgradeGather = 1;
var refreshRate = 100;
var counter = document.getElementById("counter");
counter.innerHTML = x;
//setInterval(refresh, 1000/refreshRate);
document.getElementById("upgradeCounter").innerHTML = upgrade;

function worker(){
    postMessage(0);
    setTimeout(worker,10);
}

function fn2workerURL(fn) {
    var blob = new Blob(['('+fn.toString()+')()'], {type: 'application/javascript'});
    return URL.createObjectURL(blob);
}

var w = new Worker(fn2workerURL(worker));

w.onmessage = function() {
    refresh();
};


function gather(){
    x+=upgradeGather;
    refresh();
    
}
function buy(button, what){
    if(what == "Collector"){
        if(x >= nextPrice){
            
            upgrade+=0.1;
            x -= nextPrice;
            nextPrice = Math.ceil(nextPrice * 1.2);
            
            button.innerHTML = "Buy upgrade (" + nextPrice + " stuff)";
            document.getElementById("upgradeCounter").innerHTML = upgrade.toFixed(1);
        }
        else{
            //flashRed(button);
            flashRed(counter.parentElement);
        }
    }
    else if (what == "Gather") {
        if(x >= nextGatherPrice){
            
            upgradeGather+=0.1;
            x -= nextGatherPrice;
            nextGatherPrice *= 2;
            
            button.innerHTML = "Get more stuff (" + nextGatherPrice + " stuff)";
            document.getElementById("gatherUpgradeCounter").innerHTML = upgradeGather.toFixed(1) + " ";
        }
        else{
            flashRed(counter.parentElement);
            //flashRed(button);
        }
    }
    
}
function refresh(){
    if(upgrade > 0){
        x += upgrade/refreshRate;
    }
    
    counter.innerHTML = x.toFixed(1);
}
function flashRed(element){
    var c = "rgb(160, 121, 70)";
    element.style.borderColor = "red";
    setTimeout(function(){element.style.borderColor=c},100);
}