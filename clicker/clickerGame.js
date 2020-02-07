function resourceElement(){
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.resourceNameElement = null;
    this.resourceAmountElement = null;
    this.resourceAmount = 0;
    this.color = "black";
    this.upgrade=0;
}
var resourceElements = [];


scanElements();


function scanElements(){
    var scannedElements = document.getElementsByClassName("resource");

    for(var i=0; i < scannedElements.length; i++) {
        element=scannedElements[i];
        var newElement = new resourceElement();
        newElement.container = element;
        newElement.canvas = element.getElementsByTagName("canvas")[0];
        newElement.ctx = newElement.canvas.getContext("2d");
        newElement.resourceNameElement = element.getElementsByTagName("span")[0];
        newElement.resourceAmountElement = element.getElementsByTagName("span")[1];
        newElement.color = { r: (Math.random() * 255), g: (Math.random() * 255), b: (Math.random() * 255) };
        newElement.canvas.width*=2;
        resourceElements.push(newElement);
    }
}

setInterval(update,10);
var time = 0;
function update(){
    time++;
    for(var i=0; i < resourceElements.length; i++) {

        var re = resourceElements[i];
        var ctx = re.ctx;
        var canvas = re.canvas;
        var graphTime = time/10 % canvas.width;

        re.resourceAmount+=re.upgrade;


        /*if(graphTime==0){
            ctx.clearRect(0,0,canvas.width, canvas.height);
        }*/
        ctx.fillStyle=CSScolor(re.color);
        ctx.fillRect(graphTime,canvas.height-re.resourceAmount,1,re.resourceAmount);
        /*ctx.fillStyle="black";
        ctx.fillRect(graphTime,canvas.height-re.resourceAmount,1,5);*/
        ctx.clearRect(graphTime,0,1,canvas.height-re.resourceAmount);
        re.resourceAmountElement.innerHTML = re.resourceAmount;

    }
}
function collect(index){
    resourceElements[index].resourceAmount++;
}
function buy(index){
    if(resourceElements[index].resourceAmount>=10){
        resourceElements[index].resourceAmount-=10;
        resourceElements[index].upgrade+=0.01;
    }
}
function CSScolor(color) {
	return ("rgb(" + color.r + "," + color.g + "," + color.b + ")");
}
