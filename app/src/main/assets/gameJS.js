var canvas;
var canvasContext;
var canvasX;
var canvasY;
var mouseIsDown = 0;

var bkgdImage;
var sDragon;
var sArrow;

var audioMusic;

 var lastPt=null;
 var gameOverScreen = false;
 var gameStates = {Menu: 0, Game: 1, GameOver: 2};
 var currentState;

 var arrowNum = 25;
 var arrows = [];
 var theArrow;
 var arrowVelx = -150;

 var dead = false

 var score = 0;
 var lives = 3;

 var startTimeMS;

 //window.onload =
function load()
{
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    currentState = gameStates.Menu;
    init();

    canvasX = canvas.width/2;
    canvasY = canvas.height-30;

   gameLoop();

}

function aSprite(x, y, imageSRC, velx, vely)
{
    this.zindex = 0;
    this.x = x;
    this.y = y;
    this.vx = velx;
    this.vy = vely;
    this.gravityEffect = false;
    this.gravity = 0.02;
    this.gravityVel = 0.0;
    this.sImage = new Image();
    this.sImage.src = imageSRC;

}

var uiText = function(text, colour, size, font, x, y)
{
    canvasContext.font = size + "px " + font;
    canvasContext.fillStyle = colour;
    canvasContext.fillText(text,x,y);
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
    if(this.gravityEffect)
    {
        this.gravityVel += this.gravity;    //gravity speed is constantly increasing
        this.x += deltaTime * this.vx;      //x value ignored by gravity
        this.y += deltaTime * this.vy + this.gravityVel;    //y value decreased by constant gravity
    }
    else
    {
        this.x += deltaTime * this.vx;      //x value ignored by gravity
        this.y += deltaTime * this.vy;    //y value decreased by constant gravity
    }


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

         score = 0;
         lives = 3;
         dead = false;

        if (audioMusic == null)
        {
        audioMusic = new Audio();
        audioMusic.src = "background.wav";
        audioMusic.loop = true;
        audioMusic.autoplay = true;
        }
        bkgdImage = new aSprite(0,0,"Background.png", 0, 0);

        sDragon = new aSprite(25,canvas.height/2,"dragon.png", 0, 0);
        sDragon.gravityEffect = true;

        var i;
        arrows = [];
        for (i = 0; i < arrowNum; i ++)
        {
           var randomHeight = Math.random() * (canvas.height - 10) + 10;
           theArrow = new aSprite(canvas.width - 150 + (500 * i ), randomHeight,"Arrow.png", arrowVelx, 0);
           arrows.push(theArrow);
        }

        //sArrow = new aSprite(canvas.width - 150, canvas.height/2,"Arrow.png", -100, 0);


        startTimeMS = Date.now();
    }

 }

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}



function gameLoop(){
    //console.log("gameLoop");
    var elapsed = (Date.now() - startTimeMS)/1000;
    update(elapsed);
    render(elapsed);
    collisionDetection();

    if (lives <= 0){dead = true;}



    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);
}

function render(delta) {
    bkgdImage.renderF(canvas.width,canvas.height);

    switch(currentState)
    {
        case 0:
             uiText("Hello World!", "#000", 120, "Arial",
             canvas.width/2 -325,canvas.height/2);

             uiText("Tap to begin", "#000", 80, "Arial",
              canvas.width/2 -250,canvas.height/2 + 200);
        break;

        case 1:
         sDragon.render();

         for(var i = 0; i < arrows.length; i++)
         {
            var arrow = arrows[i];
            arrow.render();
         }

         uiText("Health: " + lives, "#000", 80, "Arial", 20,75);
         uiText("Score: " + Math.floor(score) + "km", "#000", 80, "Arial", canvas.width/2 - 50 , 75);

        break;
        case 2:
         uiText("You Dead Bro", "#000", 120, "Arial", canvas.width/2 -325,canvas.height/2);
         uiText("Flight: " + Math.floor(score) + "Km", "#000", 80, "Arial", canvas.width/2 -250,canvas.height/2 + 200);
         uiText("Tap to retry", "#000", 80, "Arial", canvas.width/2 -250,canvas.height/2 + 400);

        break;
    }
 }

 function update(delta) {

    switch(currentState)
        {
            case 0:

            break;

            case 1:
             sDragon.update(delta);
                     for(var i = 0; i < arrows.length; i++)
                     {
                         var arrow = arrows[i];
                         arrow.update(delta);
                     }

                     if (!dead)
                     {
                         score += 0.1;
                     }
                     else
                     {
                         currentState = gameStates.GameOver;
                     }

            break;
            case 2:


            break;
        }
 }

 function DragonControl(force)
 {
    sDragon.gravity = -force;
 }

 function collisionDetection()
 {
    for (var i = 0; i < arrows.length; i++)
    {
        var arrow = arrows[i];
        if (sDragon.x < arrow.x + arrow.sImage.width &&
            sDragon.x + sDragon.sImage.width > arrow.x &&
            sDragon.y < arrow.y + arrow.sImage.height &&
            sDragon.y + sDragon.sImage.height > arrow.y)
        {
            console.log("Hit arrow");
            lives--;
            arrow.RemoveSprite();

        }
    }

    //CHECK PLAYER IS WITHIN CANVAS - IF NOT THEN INSTA DEATH
    if (sDragon.y >= canvas.height - (sDragon.sImage.height - 60) ||
        sDragon.y <= 0 - sDragon.sImage.height/2)
    {
        lives = 0;
    }


 }

 aSprite.prototype.RemoveSprite = function()    //TEMP METHOD FOR REMOVING
 {
    this.zindex = 0;
        this.x = -1000;
        this.y = -1000;
        this.vx = 0;
        this.vy = 0;
        this.gravityEffect = false;
        this.gravity = 0.02;
        this.gravityVel = 0.0;

 }


 function touchUp(evt) {
    evt.preventDefault();
    if (!dead)
    {
        sDragon.gravity = 0.2;
        sDragon.gravityVel = 0.0;
    }

    // Terminate touch path
    lastPt=null;
 }

 function touchDown(evt) {
    evt.preventDefault();
    if(!dead)
    {
        DragonControl(2.0);
    }

    if (currentState == gameStates.Menu || currentState == gameStates.GameOver)
    {

        currentState = gameStates.Game;
        init();
    }


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