const { JPixi, App } = require("./lib/jpixi");
const { appConf } = require("./lib/jpixi_config");
const { Player, Friend } = require("./dynamicobject");
const { ResizeTypes } = require("./config");
const { World } = require("./world");
const { StaticObject, StaticTiledObject } = require("./staticobject");
const { Psy, Star, PUOutOfPhase, PURepel, PUFreeze, PUMunch } = require("./itemobject");
const { Grid } = require("./grid");
const { JSC2 } = require("./lib/jsc2");
const { site } = require("./config");
const { Sound } = require("pixi-sound");

const musicTest = Sound.from({
    url: site.audio + "music_theme.flac",
    autoPlay: false,
    volume: 0.1,
    loop: true,
    complete: function () {
        console.log('Sound finished');
    },
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GAME GLOBALS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**@type {World} */
var world;
var GameState;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIXI EVENTS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JPixi.Event.Init(() => {
    var resList = [
        site.img + "zoomIn.png",
        site.img + "zoomOut.png",
        site.img + "black1px.png",
        site.img + "white1px.png"
    ];

    JPixi.Resources.AddArray(resList, true);
});

JPixi.Event.Start(() => {
    // Create world, camera, gui & grid
    world = new World();

    GameState = MakeGameMenu();

    /// STEEM CONNECT
    // Check for cookie, if found login and only show logout.

    var jSC2 = new JSC2();

    /*
     jSC2.GetProfile(profile => {
         playerName.text = "Name: " + profile.user;
     });*/


    /// DEBUG
    var FPS = JPixi.Text.CreateFPS();

    /// BEGIN GAME
    App.AddTicker(delta => {
        FPS();

        GameState(delta);
    });

    world.camera.ResizeList();
});

JPixi.Event.FullScreen(() => {

});

JPixi.Event.Resize(() => {

});

JPixi.Event.Orientation(() => {

});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GAME MENU STATE
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function MakeGameMenu() {
    var mainMenu = world.camera.gui.CreatesSlide();

    var background = world.camera.gui.CreateSpriteInSlide(site.img + "black1px.png", mainMenu, ResizeTypes.FullSize, 0, 0, appConf.cameraWidth, appConf.cameraHeight);

    var buttonContainer = world.camera.gui.CreateContainerInSlide(mainMenu, true, -96, 0, 0);

    var buttonLogin = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", buttonContainer, ResizeTypes.Position, 0, 0, 96, 48);
    buttonLogin.tint = 0x00FF00;
    var buttonLogout = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", buttonContainer, ResizeTypes.Position, 0, 0, 96, 48);
    buttonLogout.tint = 0xFF0000;
    var buttonStart = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", buttonContainer, ResizeTypes.Position, 128, 0, 96, 48);
    var buttonHighScores = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", buttonContainer, ResizeTypes.Position, 256, 0, 96, 48);

    buttonLogin.Input(true, true, "pointerup", event => {

    });

    buttonLogout.Input(true, true, "pointerup", event => {

    });

    buttonStart.Input(true, true, "pointerup", event => {
        event.stopPropagation();

        world.camera.gui.RemoveSlide(mainMenu);
        musicTest.stop();

        MakeGameWorld();
        GameState = () => { world.Update(world.delta); };
    });

    buttonHighScores.Input(true, true, "pointerup", event => {
        event.stopPropagation();

        var highscoresMenu = world.camera.gui.CreatesSlide();
        var highscoresBackground = world.camera.gui.CreateSpriteInSlide(site.img + "white1px.png", highscoresMenu, ResizeTypes.Position, true, true, appConf.cameraWidth / 1.1, appConf.cameraHeight / 1.1);

        highscoresBackground.Input(true, true, "pointerup", event => {
            world.camera.gui.RemoveSlide(highscoresMenu);
        });
    });

    // var playerName = world.camera.gui.CreateTextInSlide("Name: Anonymous", mainMenu, true, 20, 0xFFFFFF);

    // Create logo
    var logoContainer = world.camera.gui.CreateContainerInSlide(mainMenu, true, 96, 0, 0);

    var logoText = ["Z", "t", "e", "e", "m", ".", "i", "o"];
    var logoArray = [];

    var posX = 0;

    for (var i = 0; i < logoText.length; i++) {
        logoArray[i] = world.camera.gui.CreateTextInSlideChild(logoText[i], logoContainer, i * posX, 0, 0xFFFFFF);
        logoArray[i].style.fontSize = 50;
        posX = 35;
    }

    // Move logo back and forth.
    var dir = 1;
    return function MainMenu(delta) {

        var count = 0;

        for (var i = 0; i < logoArray.length; i++) {
            count++;
            logoArray[i].tint = 0xFFFFFF * Math.random();

            logoArray[i].position.x += 1 * delta * dir;
            logoArray[i].position.y += Math.sin(count) * delta * dir;
        }

        if (logoArray[0].position.x < -35) dir = 1;
        if (logoArray[logoArray.length - 1].position.x > logoContainer.width) dir = -1;
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GAME LEVEL STATE
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function MakeGameWorld() {
    // Create game GUI
    var score = world.gameManager.SetValue("score", 0);

    var gameGUI = world.camera.gui.CreatesSlide("gameGUI");
    var scoreText = world.camera.gui.CreateTextInSlide("Score: " + score, gameGUI, 20, 0, 0xFFFFFF);

    world.gameManager.On("UpdateScore", params => {
        score = world.gameManager.SetValue("score", score + params[1]);
        scoreText.text = "Score: " + score;
    });

    world.gameManager.On("GameOver", params => {
        var gameOver = world.camera.gui.CreateTextInSlide("GAME OVER MAN, GAME OVER!\n SCORE: " + score + "\n\n\n\n\n\n Restarting in 10 seconds.", gameGUI, true, true, 0xFFFFFF, "center");
    });

    // Star
    for (var i = 0; i < 2000; i++) {
        var star = new Star(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 8, 8, true);
    }

    // Player
    var player = new Player(site.img + "white1px.png", world, appConf.worldWidth / 2, appConf.worldHeight / 2, 24, 24);
    world.camera.SetTarget(player);

    // Power ups
    for (var i = 0; i < 5; i++) {
        var puoop = new PUOutOfPhase(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }
    for (var i = 0; i < 5; i++) {
        var purepel = new PURepel(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }
    for (var i = 0; i < 5; i++) {
        var pufreeze = new PUFreeze(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }
    for (var i = 0; i < 5; i++) {
        var pumunch = new PUMunch(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }
}