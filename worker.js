function work(){
    postMessage();
    setTimeout(work,100);
}
work();