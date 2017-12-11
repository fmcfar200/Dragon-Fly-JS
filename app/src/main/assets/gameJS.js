//canvas variables
var canvas;
var canvasContext;
var canvasX;
var canvasY;

var mouseIsDown = 0;

//game sprites
var bkgdImage;
var sDragon;
var sArrow;

//button sprites
var sPlaybtn;
var sReplaybtn;
var sMenubtn;
var sMutebtn;
var buttons = []; //button array
var buttonTypes = {PLAY: 0, MENU: 1, MUTE: 2}; //button type flags

//audio sounds
var audioMusic;
var hitSound;
var deathSound;
var clickSound;
var powerSound;
var jumpSound;
var bGameOverPlayed = false; //boolean for game over sound
var bMute = false;  //boolean for muting

 var gameStates = {Menu: 0, Game: 1, GameOver: 2};  //game states
 var currentState;  //current state

 var arrowNum = 25; //number of arrows that will be instantiated
 var arrows = [];   //arrow array
 var theArrow;  //arrow to be manipulated
 var arrowVelx = 150;   //standard arrow velocity

 var dead = false   //is character dead?
 var score = 0; //score
 var lives = 3; //lives

 var startTimeMS;   //start time variable in m/s
 var lastPt=null;   //last touch point

//web storage vars
 var locStorage;
 var bStorageAvailable;
 var highScore = 0;

function load()
{
    canvas = document.getElementById('gameCanvas'); //CANVAS is obtained
    canvasContext = canvas.getContext('2d');    //contecxt is taken from canvas obj

    //local storage is checked
    if (checkStorage('localStorage'))
    {
       console.log("Local Storage Available");
       locStorage = window.localStorage;    //local storage inits
       bStorageAvailable = true;    //local is avaiable
    }
    else
    {   //bool set to false
        console.log("LOCAL STORAGE NOT AVAILABLE");
        bStorageAvailable = false;

    }

    init(); //init is called
    currentState = gameStates.Menu; //gamestate is set to menu flag

    //canvas x and y set to middle
    canvasX = canvas.width/2;
    canvasY = canvas.height-30;


    gameLoop(); //game loop executed

}
//sprite constructor
function aSprite(x, y, imageSRC, velx, vely)
{
    this.zindex = 0;    //z index for rendering
    this.x = x; //xpos
    this.y = y; //ypos
    this.vx = velx; //velocity x
    this.vy = vely; //velocity y
    this.gravityEffect = false; //boolean for gravity
    this.gravity = 0.02;    //gravity force
    this.gravityVel = 0.0;  //current grav velocity
    this.sImage = new Image();  //image object
    this.sImage.src = imageSRC; //image source file
    this.bIsbutton = false; //boolean for button
    this.theType = null;    //button type flag


}
//text constructor
var uiText = function(text, colour, size, font, align, x, y)
{
    canvasContext.font = size + "px " + font;   //font size and style set
    canvasContext.fillStyle = colour;   //fill colour
    canvasContext.textAlign = align;    //alignment of text
    canvasContext.fillText(text,x,y);   //render text with params
}

//sound constructor
var aSound = function(source, bLoop, bAutoPlay)
{
    this.aSound = new Audio();  //new audio object
    this.aSound.src = source;   //source of the file
    this.aSound.autoplay = bAutoPlay;   //auto play
    this.aSound.loop = bLoop;   //looping sound

    this.play = function()  //play function for the sound
    {
    //if the mute if not active
        if (!bMute)
        {
            this.aSound.play(); //play
        }
    }
    this.stop = function(){this.aSound.pause();}    //pause the sound


}
//render full screen or by specific dimesions
aSprite.prototype.renderF = function(width, height)
{
    canvasContext.drawImage(this.sImage,this.x, this.y, width, height ); //drawn image with width and height param
}

//render from init values
aSprite.prototype.render = function()
{
    canvasContext.drawImage(this.sImage,this.x, this.y);
}

//update
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
        this.x += deltaTime * this.vx;
        this.y += deltaTime * this.vy;
    }

}

//arrow update
aSprite.prototype.updateA = function(deltaTime)
{
        this.x += deltaTime * arrowVelx * (-1);      //x value increased by arrow velocity
        this.y += deltaTime * this.vy;

         //increase velocity based on score
         if (score > 50 && score < 100){arrowVelx = 300;}
         else if (score > 100 && score < 150) {arrowVelx = 400;}
         else if (score > 150 && score < 200) {arrowVelx = 450;}
}

function CheckHightScore()
{
    if (bStorageAvailable)  //if the storage is avaiable
    {
        if (score > localStorage.getItem('highScore')) //score is greater than highscore
        {
            locStorage.setItem('highScore', score); //set new highscore
        }
    }

}

function initButtons()
{
     buttons = [];  //clear array
     sPlaybtn = new aSprite(0,0,"playbutton.png",0,0);  //init button
     sPlaybtn.x = canvas.width/2 - sPlaybtn.sImage.width/2; //set x
     sPlaybtn.y = canvas.height/2 - sPlaybtn.sImage.height/2; //sety
     sPlaybtn.bIsbutton = true; // it is a button
     sPlaybtn.theType = buttonTypes.PLAY;   //is play type

      //SAME PROCESS AS ABOVE
      sReplaybtn = new aSprite(0,0,"replaybutton.png",0,0);
      sReplaybtn.x = canvas.width/2 - sReplaybtn.sImage.width/2;
      sReplaybtn.y = canvas.height/2 - sReplaybtn.sImage.height/2;
      sReplaybtn.bIsbutton = true;
      sReplaybtn.theType = buttonTypes.PLAY;

      sMenubtn = new aSprite(0,0,"menubutton.png",0,0);
      sMenubtn.x = canvas.width/2 - sMenubtn.sImage.width/2;
      sMenubtn.y = canvas.height/2 + sMenubtn.sImage.height + 5;
      sMenubtn.bIsbutton = true;
      sMenubtn.theType = buttonTypes.MENU;


      sMutebtn = new aSprite(0,0,"mutebutton.png",0,0);
      sMutebtn.x = canvas.width - sMutebtn.sImage.width - 10;
      sMutebtn.y = canvas.height - sMutebtn.sImage.height - 10;
      sMutebtn.bIsbutton = true;
      sMutebtn.theType = buttonTypes.MUTE;

      //all are pushed on to the array
      buttons.push(sPlaybtn);
      buttons.push(sReplaybtn);
      buttons.push(sMenubtn);
      buttons.push(sMutebtn);
}

//init sprites
function initSprites()
{
    bkgdImage = new aSprite(0,0,"Background.png", 0, 0);    //defined sprite

    sDragon = new aSprite(25,canvas.height/2,"dragon.png", 0, 0); //dragon character
    sDragon.gravityEffect = true;   //it takes gravity into effect

    var i;
    arrows = [];    //empty arrow array
    for (i = 0; i < arrowNum; i ++)
    {
       var randomHeight = Math.random() * (canvas.height - 10) + 10;    //random hieght calc
       theArrow = new aSprite(canvas.width - 150 + (500 * i ), randomHeight,
       "Arrow.png", -arrowVelx, 0); //init
       arrows.push(theArrow);   //pushed on array
    }
}
//init sounds
function initSounds()
{
     if (audioMusic == null)
     {
        //all sounds defined as soun objects
        audioMusic = new aSound("background.wav",true, true);
        hitSound = new aSound("hit.wav",false,false);
        deathSound = new aSound("gameover.wav",false,false);
        clickSound = new aSound("click.wav",false,false);
        jumpSound = new aSound("jump.wav", false,false);
        //powerSound = new aSound("",false,false);
     }
     audioMusic.play(); //play music on initialisation
}
    //main init function
 function init() {

    if (canvas.getContext)  //got the context
    {
        //Set Event Listeners for window, mouse and touch
        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);

        canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);

        document.body.addEventListener("touchcancel", touchUp, false);

        resizeCanvas(); //canvas is resized to inner width and heigh

        //game logic variables reset
         score = 0;
         arrowVelx = 150;
         lives = 3;
         dead = false;

        //all sounds initialised
        initSounds();
        initSprites();
        initButtons();

         startTimeMS = Date.now(); // start time


    }

 }

function resizeCanvas() {
//canvas dimensions set to inner window dimesnions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


//the game loop
function gameLoop(){
    var elapsed = (Date.now() - startTimeMS)/1000;  //delta time created

    //update and render
    update(elapsed);
    render(elapsed);

    //collisions
    collisionDetection();

    //life check
    if (lives <= 0)
    {
        dead = true;
    }

    //delta and animation reset
    startTimeMS = Date.now();
    requestAnimationFrame(gameLoop);
}

function render(delta) {
    bkgdImage.renderF(canvas.width,canvas.height);  //render background
    switch(currentState)
    {
    //if state is menu
        case 0:
            //text rendered
             uiText("DragonFly!", "rgb(10000,0,0)", 60, "Courgette", "center",
             canvas.width/2,canvas.height/4);

             uiText("Instructions: Tap the screen to fly",
              "#000", 20, "Courgette", "center",
              canvas.width/2,canvas.height/4 + 50);

              uiText("Avoid obstacles as long as possible!",
              "#000", 20, "Courgette", "center",
              canvas.width/2,canvas.height/4 + 100);

              //buttons rendered
              sMutebtn.render();
              sPlaybtn.render();


              //render high score if avaiable
              if (bStorageAvailable)
              {
                uiText("HighScore: " + Math.floor(locStorage.getItem('highScore')) + "km",
                "#000", 20, "Courgette", "center",
                canvas.width/2,canvas.height/2 + 150);
              }
              else
              {
                 uiText("High Scores Unavaiable: ",
                 "#000", 20, "Courgette", "center",
                 canvas.width/2,canvas.height/2 + 150);
              }
        break;
        //if state is game
        case 1:
         sDragon.render();  //render dragon

         //render arrows
         for(var i = 0; i < arrows.length; i++)
         {
            var arrow = arrows[i];
            arrow.render();
         }

        //score and health
         uiText("Health: " + lives, "#000", 30, "Courgette", "left", 10,32);
         uiText("Score: " + Math.floor(score) + "km", "#000", 30, "Courgette",
         "left", canvas.width/2 + 5 , 32);

        break;

        //if state if game over
        case 2:

        //text and button rendering
         uiText("Game Over", "#000", 60, "Courgette", "center",
          canvas.width/2 ,canvas.height/4);
         uiText("Flight: " + Math.floor(score) + "km", "#000", 40, "Courgette",
          "center", canvas.width/2,canvas.height/4 + 75);
         sReplaybtn.render();
         sMenubtn.render();
        break;
    }
 }

//updateing per frame
 function update(delta) {
    switch(currentState)
        {
        //menu state
            case 0:
            //update buttons and play audio
            if(!bMute){audioMusic.play();}
            sPlaybtn.update(delta);
            sMutebtn.update(delta);

            break;
            //if game state
            case 1:

            //update arrows and dragons
             sDragon.update(delta);
             bGameOverPlayed = false;
             if(!bMute)
             {
                audioMusic.play();
             }

             for(var i = 0; i < arrows.length; i++)
             {
                 var arrow = arrows[i];
                 arrow.updateA(delta);
                //reset position if its past the player character
                 if (arrow.x <= -50)
                 {
                    arrow.x = canvas.width + 150 + (500 * i );
                    arrow.y = Math.random() * (canvas.height - 10) + 10;
                 }
             }

             //increase score if not dead
             if (!dead)
             {
                 score += 0.1;
             }
             else
             {
                 currentState = gameStates.GameOver;    //if dead then game over
             }

            break;
            //if game over state
            case 2:
            //stop music and fire game over sound once
            audioMusic.stop();
            if (!bGameOverPlayed)
            {
                deathSound.play();
                CheckHightScore();
                bGameOverPlayed = true;
            }

            //update buttons
            sReplaybtn.update(delta);
            sMenubtn.update(delta);

            break;
        }
 }


 //player movement
 function DragonControl(force)
 {
    sDragon.gravity = -force;   //add force to gravity
    jumpSound.play();//jump sound
 }

var hit = false
//take damage
 function TakeDamage()
 {
    if (hit == true)
    {
    lives -= 1;    //life -1
    hitSound.play(); //hit sound is played
    hit = false;
    }
 }



 function collisionDetection()
 {
    //iter through all arrows
    for (var i = 0; i < arrows.length; i++)
    {
        var arrow = arrows[i];
        if (sDragon.x < arrow.x + arrow.sImage.width &&
            sDragon.x + sDragon.sImage.width > arrow.x &&
            sDragon.y < arrow.y + arrow.sImage.height &&
            sDragon.y + sDragon.sImage.height > arrow.y)    //check bounds
        {
            console.log("Hit arrow");
            arrow.RemoveSprite();
            hit = true;
            TakeDamage();   //take damage

        }
    }

    //CHECK PLAYER IS WITHIN CANVAS - IF NOT THEN INSTA DEATH
    if (sDragon.y >= canvas.height - (sDragon.sImage.height - 60) ||
        sDragon.y <= 0 - sDragon.sImage.height/2)
    {
        lives = 0;
    }


 }

 aSprite.prototype.RemoveSprite = function()
 {
    this.zindex = 0;
    this.x = -1000;
    this.y = -1000;
    this.vx = 0;
    this.vy = 0;
    this.gravityEffect= false;
 }

 function buttonClick(buttons)
 {
    for (var i = 0; i < buttons.length; i ++)
    {
        if (lastPt.x <= buttons[i].x + buttons[i].sImage.width &&
            lastPt.x >= buttons[i].x &&
            lastPt.y <= buttons[i].y + buttons[i].sImage.height &&
            lastPt.y >= buttons[i].y ) // check touch with sprite bounds
         {
            //chnage state or boolean depending on type
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


//check storage avaibility on browser
 function checkStorage(type)
 {
    try
    {
        var storage = window[type], x = '__storage_test__'; // new storage
        storage.setItem(x,x); //sets test item
        storage.removeItem(x);  //removes
        return true;    //returns true
    }
    catch(e)    //caught a thrown exceptions??
    {
        return e instanceof DOMException &&
        (   //all browsers except FF
            e.code === 22 ||
            //FF
            e.code === 1014 ||
             //all browsers except FF
            e.name === 'QuotaExceededError' ||
            //FF
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            //length check
            storage.length  !== 0;
    }
 }


 function touchUp(evt) {
    evt.preventDefault();//prevent default event firing
    //reset gravity values
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

    //what does the touch do when in a certain state ?

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
//touch positioning
 function touchXY(evt) {
    evt.preventDefault();
    if(lastPt!=null) {
        var touchX = evt.touches[0].pageX - canvas.offsetLeft;  //x pos
        var touchY = evt.touches[0].pageY - canvas.offsetTop;   //ypos
    }
 lastPt = {x:evt.touches[0].pageX, y:evt.touches[0].pageY}; // last point with x and y
 }