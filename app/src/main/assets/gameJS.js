var canvas;
var canvasContext;
var canvasX;
var canvasY;
var mouseIsDown = 0;
var bkgdImage;
var sDragon;

 var lastPt=null;
 var gameOverScreen = false;

 var score = 0;
 var lives = 3;

 var startTimeMS;

 //window.onload =
function load()
{
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    init();

    canvasX = canvas.width/2;
    canvasY = canvas.height-30;

    if(!gameOverScreen)
    {
        gameLoop();
    }

}

function aSprite(x, y, imageSRC, velx, vely)
{
    this.zindex = 0;
    this.x = x;
    this.y = y;
    this.vx = velx;
    this.vy = vely;
    this.sImage = new Image();
    this.sImage.src = imageSRC;
}

aSprite.prototype.renderF = function(width, height)
{
    canvasContext.drawImage(this.sImage,this.x, this.y, width, height );
}

aSprite.prototype.render = function()
{
    canvasContext.drawImage(this.sImage,this.x, this.y);
}

aSprite.prototype.update = function(deltaTime)
{
    this.x += deltaTime * this.vx;
    this.y += deltaTime * this.vy;
}

 function init() {

    if (canvas.getContext)
    {
        //Set Event Listeners for window, mouse and touch

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);

        document.body.addEventListener("touchcancel", touchUp, false);

        resizeCanvas();

        bkgdImage = new aSprite(0,0,"Background.png", 0, 0);
        sDragon = new aSprite(25,canvas.height-140,"dragon.png", 0, 0);
        startTimeMS = Date.now();
    }

 }

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function gameLoop(){
    console.log("gameLoop");
    var elapsed = (Date.now() - startTimeMS)/1000;
    update(elapsed);
    render(elapsed);
    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);
}

function render(delta) {
    bkgdImage.renderF(canvas.width,canvas.height);
    sDragon.render();
 }

 function update(delta) {
    sDragon.update(delta);

 }

 function DragonControl()
 {

 }

 function collisionDetection() {

 }

 function styleText(txtColour, txtFont, txtAlign, txtBaseline)
 {
    canvasContext.fillStyle = txtColour;
    canvasContext.font = txtFont;
    canvasContext.textAlign = txtAlign;
    canvasContext.textBaseline = txtBaseline;
 }

 function touchUp(evt) {
    evt.preventDefault();
    // Terminate touch path
    lastPt=null;
 }

 function touchDown(evt) {
    evt.preventDefault();
    DragonControl();

    //if(gameOverScreenScreen) {
        //player1Score = 0;
        //player2Score = 0;
        //showingWinScreen = false;
        //return;
    //}
 touchXY(evt);
 }

 function touchXY(evt) {
    evt.preventDefault();
    if(lastPt!=null) {
        var touchX = evt.touches[0].pageX - canvas.offsetLeft;
        var touchY = evt.touches[0].pageY - canvas.offsetTop;
    }
 lastPt = {x:evt.touches[0].pageX, y:evt.touches[0].pageY};
 }