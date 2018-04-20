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
// PIXI
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**@type {World} */
var world;


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

    JPixi.Resources.AddArray(resList);
});

JPixi.Event.Start(() => {
    // Create world, camera, gui & grid
    world = new World();

    /// MAKE INITIAL GAME WORLD
    // World ends 32px wide colliders along edges of window.
    var up = new StaticTiledObject(site.img + "black1px.png", world, 0, -32, appConf.worldWidth, 32);
    up.alpha = 0;
    var right = new StaticTiledObject(site.img + "black1px.png", world, appConf.worldWidth, 0, 32, appConf.worldHeight);
    right.alpha = 0;
    var down = new StaticTiledObject(site.img + "black1px.png", world, 0, appConf.worldHeight, appConf.worldWidth, 32);
    down.alpha = 0;
    var left = new StaticTiledObject(site.img + "black1px.png", world, -32, 0, 32, appConf.worldHeight);
    left.alpha = 0;

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

    // GAME MENU
    var mainMenu = world.camera.gui.CreatesSlide();

    //Add button section for start game, settings and login on Steem.

    var background = world.camera.gui.CreateSpriteInSlide(site.img + "black1px.png", mainMenu, ResizeTypes.FullSize, 0, 0, appConf.cameraWidth, appConf.cameraHeight);
    var instruction = world.camera.gui.CreateTextInSlide("Click/Touch to begin.", mainMenu, true, -60, 0xFFFFFF);
    var playerName = world.camera.gui.CreateTextInSlide("Name: Anonymous", mainMenu, true, 20, 0xFFFFFF);

    background.Input(true, true, "pointerup", event => {
        event.stopPropagation();
        world.camera.gui.RemoveSlide(mainMenu);
        mainMenu = undefined;
        musicTest.stop();
    });

    var logoContainer = world.camera.gui.CreateContainerInSlide(mainMenu, true, 125, 0, 0);

    var logoText = ["Z", "t", "e", "e", "m", ".", "i", "o"];
    /**@type {PIXI.Text[]} */
    var logoArray = [];

    var posX = 0;

    for (var i = 0; i < logoText.length; i++) {
        logoArray[i] = world.camera.gui.CreateTextInSlideChild(logoText[i], logoContainer, i * posX, 0, 0xFFFFFF);
        logoArray[i].style.fontSize = 50;
        posX = 35;
    }

    var count = 0;
    var dir = 1;
    var firstPass = true;

    function MainMenu(delta) {
        count++;
        if (firstPass && count == 60) {
            count = -120;
            dir = -1;
            firstPass = false;
        }
        else if (count == 120) {
            count = -120;
            dir = -1;
        }
        else if (count == -1) {
            count = 1;
            dir = 1;
        }

        for (var i = 0; i < logoArray.length; i++) {
            logoArray[i].tint = 0xFFFFFF * Math.random();

            logoArray[i].position.x += 1 * delta * dir;
            logoArray[i].position.y += Math.sin(Math.abs(count / 10)) * delta * dir;
        }
    }

    /// STEEM CONNECT
    // On load check if logged in, if so indicate this and set login to logout.

    /* var jSC2 = new JSC2();
     
     jSC2.GetProfile(profile => {
         playerName.text = "Name: " + profile.user;
     });*/


    /// DEBUG
    // var FPS = JPixi.Text.CreateFPS();


    /// BEGIN GAME
    App.AddTicker(delta => {
        //FPS();

        if (mainMenu == undefined) world.Update(delta);
        else MainMenu(delta);
    });

    world.camera.ResizeList();
});

JPixi.Event.FullScreen(() => {

});

JPixi.Event.Resize(() => {

});

JPixi.Event.Orientation(() => {

});