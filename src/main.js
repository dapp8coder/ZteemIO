"use strict";

const { JPixi, App } = require("./lib/jpixi");
const { appConf } = require("./lib/jpixi_config");
const { Player, Friend } = require("./dynamicobject");
const { Camera, ResizeTypes } = require("./camera");
const { World } = require("./world");
const { StaticObject, StaticTiledObject } = require("./staticobject");
const { Psy, Star, PUOutOfPhase, PURepel, PUFreeze, PUMunch } = require("./itemobject");
const { Grid } = require("./grid");


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIXI
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Test
/**type {PIXI.Sprite} */
//var leaveFullScreen;
/**type {PIXI.Sprite} */
//var enterFullScreen;

/**@type {World} */
var world;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIXI EVENTS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JPixi.Event.Init(() => {
    var resList = [
        "zteemio_files/images/zoomIn.png",
        "zteemio_files/images/zoomOut.png",
        "zteemio_files/images/black1px.png",
        "zteemio_files/images/white1px.png"
    ];

    JPixi.Resources.AddArray(resList);
});

JPixi.Event.Start(() => {
    // Create world,camera & grid
    world = new World();

    // World ends 32px wide colliders along edges of window.
    var up = new StaticTiledObject("zteemio_files/images/black1px.png", world, 0, -32, appConf.worldWidth, 32);
    up.alpha = 0;
    var right = new StaticTiledObject("zteemio_files/images/black1px.png", world, appConf.worldWidth, 0, 32, appConf.worldHeight);
    right.alpha = 0;
    var down = new StaticTiledObject("zteemio_files/images/black1px.png", world, 0, appConf.worldHeight, appConf.worldWidth, 32);
    down.alpha = 0;
    var left = new StaticTiledObject("zteemio_files/images/black1px.png", world, -32, 0, 32, appConf.worldHeight);
    left.alpha = 0;

    // Star
    for (var i = 0; i < 2000; i++) {
        var star = new Star("zteemio_files/images/white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 8, 8, true);
    }

    // Player
    var player = new Player("zteemio_files/images/white1px.png", world, appConf.worldWidth / 2, appConf.worldHeight / 2, 24, 24);
    world.camera.SetTarget(player);

    // Power ups
    for (var i = 0; i < 5; i++) {
        var puoop = new PUOutOfPhase("zteemio_files/images/white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }
    for (var i = 0; i < 5; i++) {
        var purepel = new PURepel("zteemio_files/images/white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }
    for (var i = 0; i < 5; i++) {
        var pufreeze = new PUFreeze("zteemio_files/images/white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }
    for (var i = 0; i < 5; i++) {
        var pumunch = new PUMunch("zteemio_files/images/white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 12, 12, true);
    }

    // Psy
    /*var posX = 8;
    var posY = 8;
    
    for (var i = 0; i < 68; i++) {
        for (var j = 0; j < 120; j++) {
            var psy = new Psy("zteemio_files/images/white1px.png", world, posX, posY, 16, 16, true);
            psy.sprite.alpha = 0;
    
            posX += 16;
        }
        posX = 8;
        posY += 16;
    }*/

    // FPS
    // var FPS = JPixi.Text.CreateFPS();

    // START OF GAME
    var mainMenu = true;

    var black = new JPixi.Sprite.Create("zteemio_files/images/black1px.png", 0, 0, appConf.worldWidth, appConf.worldHeight, null, false);
    black.interactive = true;
    App.stage.addChild(black);

    var logoText = ["Z", "t", "e", "e", "m", ".", "i", "o"];
    /**@type {PIXI.Text[]} */
    var logoArray = [];

    if (appConf.cameraWidth > appConf.cameraHeight) {
        for (var i = 0; i < logoText.length; i++) {
            logoArray[i] = JPixi.Text.CreateMessage("logo", logoText[i], appConf.cameraWidth / 4 + 75 * i, appConf.cameraHeight / 3, 0xFFFFFF);
            logoArray[i].style.fontSize = 36;
        }
    }
    else {
        for (var i = 0; i < logoText.length; i++) {
            logoArray[i] = JPixi.Text.CreateMessage("logo", logoText[i], appConf.cameraWidth / 8 + 50 * i, appConf.cameraHeight / 4, 0xFFFFFF);
            logoArray[i].style.fontSize = 36;
        }
    }

    var count = 0;
    var dir = 1;

    function MainMenu(delta) {
        count++;
        if (count == 25) {
            count = -25;
            dir = -1;
        }
        else if (count == -1) {
            count = 1;
            dir = 1;
        }

        for (var i = 0; i < logoArray.length; i++) {
            logoArray[i].tint = 0xFFFFFF * Math.random();

            if (i <= 2) logoArray[i].position.x += Math.random() * delta * dir;
            else logoArray[i].position.x -= Math.random() * delta * dir;

            if (logoArray[i].position.y <= appConf.cameraHeight / 2) logoArray[i].position.y += Math.random() * delta * dir * -1;
            else logoArray[i].position.y -= Math.random() * delta * dir * -1;
        }

    }

    var instruction = JPixi.Text.CreateMessage("logo", "Click/Touch to begin.", appConf.cameraWidth / 2.5, appConf.cameraHeight / 1.5, 0xFFFFFF);

    black.on("pointerup", event => {
        event.stopPropagation();

        App.stage.removeChild(black);
        App.stage.removeChild(instruction);

        for (var i = 0; i < logoArray.length; i++) {
            App.stage.removeChild(logoArray[i]);
        }
        mainMenu = false;
    });


    // Begin game 
    App.AddTicker(delta => {
        //FPS();

        if (!mainMenu) world.Update(delta);
        else MainMenu(delta);
    });
});



JPixi.Event.FullScreen(() => {
    if (leaveFullScreen.visible) {
        leaveFullScreen.visible = false;
        enterFullScreen.visible = true;
    }
    else {
        leaveFullScreen.visible = true;
        enterFullScreen.visible = false;
    }
});

JPixi.Event.Resize(() => {

});

JPixi.Event.Orientation(() => {

});