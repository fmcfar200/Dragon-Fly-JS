var canvas;
var canvasContext;
var canvasX;
var canvasY;
var mouseIsDown = 0;

var bkgdImage;
var sDragon;
var sArrow;

var sPlaybtn;
var sReplaybtn;
var sMenubtn;
var sMutebtn;
var buttons = [];
var buttonTypes = {PLAY: 0, MENU: 1, MUTE: 2};


var audioMusic;
var hitSound;
var deathSound;
var clickSound;
var powerSound;
var jumpSound;
var bGameOverPlayed = false;
var bMute = false;

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
    this.bIsbutton = false;
    this.theType = null;


}

var uiText = function(text, colour, size, font, align, x, y)
{
    canvasContext.font = size + "px " + font;
    canvasContext.fillStyle = colour;
    canvasContext.textAlign = align;
    canvasContext.fillText(text,x,y);
}


var aSound = function(source, bLoop, bAutoPlay)
{
    this.aSound = new Audio();
    this.aSound.src = source;
    this.aSound.autoplay = bAutoPlay;
    this.aSound.loop = bLoop;

    this.play = function()
    {
        if (!bMute)
        {
            this.aSound.play();
        }
    }
    this.stop = function(){this.aSound.pause();}


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

function initButtons()
{
     buttons = [];
     sPlaybtn = new aSprite(canvas.width/2 - 75,canvas.height/2 - 75,"playbutton.png",0,0);
     sPlaybtn.bIsbutton = true;
     sPlaybtn.theType = buttonTypes.PLAY;

      sReplaybtn = new aSprite(canvas.width/2 - 75,canvas.height/2 -75,"replaybutton.png",0,0);
      sReplaybtn.bIsbutton = true;
      sReplaybtn.theType = buttonTypes.PLAY;

      sMenubtn = new aSprite(canvas.width/2 -75,canvas.height/2 + 125,"menubutton.png",0,0);
      sMenubtn.bIsbutton = true;
      sMenubtn.theType = buttonTypes.MENU;


      sMutebtn = new aSprite(canvas.width - 200,canvas.height - 200,"mutebutton.png",0,0);
      sMutebtn.bIsbutton = true;
      sMutebtn.theType = buttonTypes.MUTE;

      buttons.push(sPlaybtn);
      buttons.push(sReplaybtn);
      buttons.push(sMenubtn);
      buttons.push(sMutebtn);
}

function initSprites()
{
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
}

function initSounds()
{
     if (audioMusic == null)
     {

        audioMusic = new aSound("background.wav",true, true);
        hitSound = new aSound("hit.wav",false,false);
        deathSound = new aSound("gameover.wav",false,false);
        clickSound = new aSound("click.wav",false,false);
        jumpSound = new aSound("jump.wav", false,false);
        //powerSound = new aSound("",false,false);

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


        initSounds();
        initSprites();
        initButtons();

        resizeCanvas();
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

    if (lives <= 0)
    {
        dead = true;
    }


    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);
}

function render(delta) {
    bkgdImage.renderF(canvas.width,canvas.height);
    switch(currentState)
    {
        case 0:
             uiText("DragonFly!", "rgb(10000,0,0)", 120, "Courgette", "center",
             canvas.width/2,canvas.height/4 - 200);

             uiText("Instructions: Tap the screen to fly",
              "#000", 50, "Courgette", "center",
              canvas.width/2,canvas.height/4);

              uiText("Avoid obstacles as long as possible!",
              "#000", 50, "Courgette", "center",
              canvas.width/2,canvas.height/4 + 200);

              sMutebtn.render();
              sPlaybtn.render();
        break;

        case 1:
         sDragon.render();

         for(var i = 0; i < arrows.length; i++)
         {
            var arrow = arrows[i];
            arrow.render();
         }

         uiText("Health: " + lives, "#000", 80, "Courgette", "left", 20,75);
         uiText("Score: " + Math.floor(score) + "km", "#000", 80, "Courgette", "left", canvas.width/2 + 10 , 75);

        break;
        case 2:
         uiText("Game Over", "#000", 120, "Courgette", "center", canvas.width/2 ,canvas.height/4);
         uiText("Flight: " + Math.floor(score) + "km", "#000", 80, "Courgette", "center", canvas.width/2,canvas.height/4 +150);
         sReplaybtn.render();
         sMenubtn.render();
        break;
    }
 }

 function update(delta) {
    switch(currentState)
        {
            case 0:
            bGameOverPlayed = false;
            if(!bMute){audioMusic.play();}
            sPlaybtn.update(delta);
            sMutebtn.update(delta);

            break;

            case 1:
             sDragon.update(delta);
             bGameOverPlayed = false;
             if(!bMute){audioMusic.play();}

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
            audioMusic.stop();
            if (!bGameOverPlayed)
            {
                deathSound.play();
                bGameOverPlayed = true;
            }

            sReplaybtn.update(delta);
            sMenubtn.update(delta);

            break;
        }
 }

 function DragonControl(force)
 {
    sDragon.gravity = -force;
    jumpSound.play();
 }

 function TakeDamage()
 {
    lives--;
    hitSound.play();
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
            arrow.RemoveSprite();

            TakeDamage();
        }
    }

    //CHECK PLAYER IS WITHIN CANVAS - IF NOT THEN INSTA DEATH
    if (sDragon.y >= canvas.height - (sDragon.sImage.height - 60) ||
        sDragon.y <= 0 - sDragon.sImage.height/2)
    {
        lives = 0;
    }


 }

 function buttonClick(buttons)
 {
    for (var i = 0; i < buttons.length; i ++)
    {
        if (lastPt.x <= buttons[i].x + buttons[i].sImage.width &&
            lastPt.x >= buttons[i].x &&
            lastPt.y <= buttons[i].y + buttons[i].sImage.height &&
            lastPt.y >= buttons[i].y )
         {
             if (buttons[i].theType == buttonTypes.PLAY)
             {
                clickSound.play();
                currentState = gameStates.Game;
                init();
             }
             else if (buttons[i].theType == buttonTypes.MENU)
             {
                clickSound.play();
                currentState = gameStates.Menu;
                init();
             }
             else if (buttons[i].theType == buttonTypes.MUTE)
             {
                switch(bMute)
                {
                    case true:
                    bMute = false;
                    audioMusic.play();
                    break;
                    case false:
                    bMute = true;
                    audioMusic.stop();
                    break;
                }
             }
         }
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
    touchXY(evt);

    switch(currentState)
    {
        case 0:
            buttonClick(buttons);

        break;

        case 1:
            if(!dead){DragonControl(2.0);}

        break;

        case 2:
            buttonClick(buttons);

        break;
    }


 }

 function touchXY(evt) {
    evt.preventDefault();
    if(lastPt!=null) {
        var touchX = evt.touches[0].pageX - canvas.offsetLeft;
        var touchY = evt.touches[0].pageY - canvas.offsetTop;
    }
 lastPt = {x:evt.touches[0].pageX, y:evt.touches[0].pageY};


 }