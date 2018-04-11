"use strict";

const { JPixi, App } = require("./lib/jpixi");
const { appConf } = require("./lib/jpixi_config");
const { Player, Friend } = require("./dynamicobject");
const { Camera, ResizeTypes } = require("./camera");
const { World } = require("./world");
const { StaticObject, StaticTiledObject } = require("./staticobject");
const { Psy, Star, PUOutOfPhase, PURepel, PUFreeze, PUMunch } = require("./itemobject");
const { Grid } = require("./grid");
const { JSC2 } = require("./lib/jsc2");
const { site } = require("./config");

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
        site.img + "zoomIn.png",
        site.img + "zoomOut.png",
        site.img + "black1px.png",
        site.img + "white1px.png"
    ];

    JPixi.Resources.AddArray(resList);
});

JPixi.Event.Start(() => {
    // Create world,camera & grid
    world = new World();

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

    // FPS
    // var FPS = JPixi.Text.CreateFPS();

    // START OF GAME
    var mainMenu = true;

    var black = new JPixi.Sprite.CreateGui(site.img + "black1px.png", 0, 0, appConf.worldWidth, appConf.worldHeight, world.camera);
    world.camera.AddToResizeList(black, ResizeTypes.FullSize);

    black.Input(true, true, "pointerup", event => {
        event.stopPropagation();

        world.camera.container.removeChild(black);
        world.camera.container.removeChild(instruction);
        world.camera.container.removeChild(logoContainer);

        mainMenu = false;
    });

    var logoText = ["Z", "t", "e", "e", "m", ".", "i", "o"];
    /**@type {PIXI.Text[]} */
    var logoArray = [];

    var logoContainer = new JPixi.Container.Create(appConf.worldWidth, appConf.worldHeight, true, 150, 0, 0, world.camera);

    for (var i = 0; i < logoText.length; i++) {
        logoArray[i] = JPixi.Text.CreateMessage("logo", logoText[i], i * 50, 0, 0xFFFFFF, undefined, logoContainer);
        logoArray[i].style.fontSize = 34;
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

    var instruction = JPixi.Text.CreateMessage("logo", "Click/Touch to begin.", true, -60, 0xFFFFFF, world.camera);
    var playerName = JPixi.Text.CreateMessage("playerName", "Name: Anonymous", true, 20, 0xFFFFFF, world.camera);

    var jSC2 = new JSC2();

    jSC2.GetProfile(profile => {
        playerName.text = "Name: " + profile.user;
    });

    // Begin game 
    App.AddTicker(delta => {
        //FPS();

        if (!mainMenu) world.Update(delta);
        else MainMenu(delta);
    });

    world.camera.ResizeList();
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