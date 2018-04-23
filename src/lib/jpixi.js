const { appConf } = require("./jpixi_config");
const PIXI = require("pixi.js");
const { ResizeTypes } = require("../config");

///////////////////////////////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////////////////////////////

// Setup app.
const app = new PIXI.Application({
    width: appConf.cameraWidth,
    height: appConf.cameraHeight,
    backgroundColor: appConf.backgroundColor,
    transparent: appConf.transparent,
    resolution: window.devicePixelRatio,
    autoResize: appConf.autoResize
});

app.view.style.position = "absolute";
app.view.style.top = "0px";
app.view.style.right = "0px";
app.view.style.bottom = "0px";
app.view.style.left = "0px";
app.view.style.margin = "auto";

Resize();

// Create the app.
document.getElementById(appConf.elementID).appendChild(app.view);

function Resize() {
    var ratio = window.innerWidth / window.innerHeight;

    if (window.innerWidth > window.innerHeight) {
        if (window.innerWidth > appConf.minCamWidth && window.innerWidth < appConf.maxCamWidth) appConf.cameraWidth = window.innerWidth;
        else if (window.innerWidth < appConf.minCamWidth) appConf.cameraWidth = appConf.minCamWidth;
        else appConf.cameraWidth = appConf.maxCamWidth;

        appConf.cameraHeight = appConf.cameraWidth / ratio;
    }
    else {
        if (window.innerHeight > appConf.minCamWidth && window.innerHeight < appConf.maxCamWidth) appConf.cameraHeight = window.innerHeight;
        else if (window.innerHeight < appConf.minCamWidth) appConf.cameraHeight = appConf.minCamWidth;
        else appConf.cameraHeight = appConf.maxCamWidth;

        appConf.cameraWidth = appConf.cameraHeight * ratio;
    }

    var diff = Math.min(window.innerWidth / appConf.cameraWidth, window.innerHeight / appConf.cameraHeight);

    app.renderer.resize(Math.ceil(appConf.cameraWidth * diff), Math.ceil(appConf.cameraHeight * diff));
    app.stage.scale.set(diff, diff);
}


///////////////////////////////////////////////////////////////////////////////
// LOAD ASSETS
///////////////////////////////////////////////////////////////////////////////

function ResourcesAddArray(arrayResources, startGame = false, callBack = undefined) {
    PIXI.loader
        .add(arrayResources)
        .load(() => {
            if (startGame) TriggerPixiEvent(appConf.eventStart);
            if (callBack != undefined) callBack();
        });
}

function ResourcesAddJSON(jsonResourcePath, startGame = false, callBack = undefined) {
    PIXI.loader
        .add(jsonResourcePath)
        .load(() => {
            if (startGame) TriggerPixiEvent(appConf.eventStart);
            if (callBack != undefined) callBack();
        });
}

function ResourcesAdd(resourcePath, startGame = false, callBack = undefined) {
    PIXI.loader
        .add(resourcePath)
        .load(() => {
            if (startGame) TriggerPixiEvent(appConf.eventStart);
            if (callBack != undefined) callBack();
        });
}


///////////////////////////////////////////////////////////////////////////////
// EVENTS
///////////////////////////////////////////////////////////////////////////////

/**
* Use to init Pixi in main.js. Load resources etc. PixiEvent.Init(() => { // ... });
* 
* @param {Function} Callback callback function to run when Pixi is ready.
*/
function EventInit(Callback) {
    document.addEventListener(appConf.eventInit, () => {
        Callback();
    });

    // Init game by loading resources etc.
    TriggerPixiEvent(appConf.eventInit);
}

/**
 * Use to start setup of resources and interacting with Pixi in main.js. PixiEvent.Start(() => { // ... });
 * 
 * @param {Function} Callback callback function to run when Pixi is ready.
 */
function EventStart(Callback) {
    document.addEventListener(appConf.eventStart, () => {
        Callback();
    });
}

/**
 * Triggers when app.screen changes size. PixiEvent.Resize(() => { // ... });
 * 
 * @param {Function} Callback callback function to run when size changes.
 */
function EventResize(Callback) {
    window.addEventListener("resize", () => {
        Resize();
        Callback();
    }, false);
}

function EventOrientation(Callback) {
    window.addEventListener("orientationchange", () => {
        Callback();
    }, false);
}

/**
 * Triggers when app.screen enters/leaves full screen. PixiEvent.FullScreen(() => { // ... });
 * 
 * @param {Function} Callback callback function to run when size changes.
 */
function EventFullScreen(Callback) {
    document.addEventListener(appConf.eventFullScreen, () => {
        Callback();
    });
}

function TriggerPixiEvent(eventName) {
    var event = new Event(eventName);
    document.dispatchEvent(event);
}


///////////////////////////////////////////////////////////////////////////////
// SCREEN 
///////////////////////////////////////////////////////////////////////////////

function ScreenToggleFull() {
    if (BrowserIsFullScreen() == null) BrowserToFullScreen().call(document.getElementById(appConf.elementID));
    else BrowserExitFullScreen().call(document);

    TriggerPixiEvent(appConf.eventFullScreen);
}


///////////////////////////////////////////////////////////////////////////////
// SCREEN HELPERS
///////////////////////////////////////////////////////////////////////////////

function BrowserExitFullScreen() {
    return document.exitFullscreen || document.webkitExitFullscreen ||
        document.mozCancelFullScreen || document.msExitFullscreen;
}

function BrowserToFullScreen() {
    var element = document.documentElement;

    return element.requestFullscreen || element.webkitRequestFullscreen ||
        element.mozRequestFullScreen || element.msRequestFullscreen;
}

function BrowserIsFullScreen() {
    return document.fullscreenElement || document.webkitFullscreenElement ||
        document.mozFullScreenElement || document.msFullscreenElement;
}


///////////////////////////////////////////////////////////////////////////////
// CONTAINER
///////////////////////////////////////////////////////////////////////////////

function ContainerCreate(width, height, posX = 0, posY = 0, pivotX = 0, pivotY = 0, parentContainer = undefined) {
    var container = new PIXI.Container();

    container.width = width;
    container.height = height;
    container.position.x = posX;
    container.position.y = posY;
    container.pivot.x = pivotX;
    container.pivot.y = pivotY;

    if (parentContainer == undefined) app.stage.addChild(container);
    else parentContainer.addChild(container);

    return container;
}

function ContainerSort(container, index) {
    app.stage.setChildIndex(container, index);
}


///////////////////////////////////////////////////////////////////////////////
// TEXT
///////////////////////////////////////////////////////////////////////////////

/**
 * Show FPS stats.
 * 
 * Based on https://stackoverflow.com/a/5111475
 * 
 * @param {number} updateRate ms inbetween text updates of FPS.
 * @returns {Function} Function that calculates FPS, run in game loop.
 */
function TextCreateFPS(updateRate = 1000, container = undefined) {
    var fpsText = new PIXI.Text("00", { fontFamily: "Arial", fontSize: 18, fill: 0x55AAFF, align: "center" });

    var filterStrength = 20;
    var frameTime = 0, lastLoop = new Date, thisLoop;

    setInterval(function () {
        fpsText.text = (1000 / frameTime).toString().substring(0, 2);
    }, updateRate);

    if (container != undefined) container.addChild(fpsText);
    else app.stage.addChild(fpsText);

    return () => {
        var thisFrameTime = (thisLoop = new Date) - lastLoop;
        frameTime += (thisFrameTime - frameTime) / filterStrength;
        lastLoop = thisLoop;
    }
}


///////////////////////////////////////////////////////////////////////////////
// SPRITES
///////////////////////////////////////////////////////////////////////////////

function SpriteCreate(resourcePath, posX = 0, posY = 0, width = -1, height = -1, container = undefined, centerAnchor = false) {
    var sprite = new PIXI.Sprite(PIXI.loader.resources[resourcePath].texture);
    if (centerAnchor) sprite.anchor.set(0.5, 0.5);

    sprite.position.set(posX, posY);
    if (width != -1) sprite.width = width;
    if (height != -1) sprite.height = height;

    if (container != undefined) container.addChild(sprite);

    return sprite;
}

function SpriteCreateTiling(resourcePath, posX = 0, posY = 0, width, height, container = undefined, centerAnchor = false) {
    var tilingSprite = new PIXI.extras.TilingSprite(
        PIXI.loader.resources[resourcePath].texture,
        width,
        height
    );

    if (centerAnchor) tilingSprite.anchor.set(0.5, 0.5);

    tilingSprite.position.set(posX, posY);

    if (container != undefined) container.addChild(tilingSprite);

    return tilingSprite;
}

function SpriteSort(sprite, container, index) {
    container.setChildIndex(sprite, index);
}

PIXI.Sprite.prototype.Input = function (enableInteraction, useIcon, eventName, Callback) {
    this.interactive = enableInteraction;
    this.buttonMode = useIcon;
    this.on(eventName, Callback);
};


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    JPixi: {
        Event: {
            Init: EventInit,
            Start: EventStart,
            Resize: EventResize,
            Orientation: EventOrientation,
            FullScreen: EventFullScreen
        },
        Screen: {
            ToggleFull: ScreenToggleFull
        },
        Resources: {
            AddArray: ResourcesAddArray,
            AddJSON: ResourcesAddJSON,
            Add: ResourcesAdd
        },
        Sprite: {
            Create: SpriteCreate,
            CreateTiling: SpriteCreateTiling,
            Sort: SpriteSort
        },
        Container: {
            Create: ContainerCreate,
            Sort: ContainerSort
        },
        Text: {
            CreateFPS: TextCreateFPS
        },
        Helper: {
            TriggerPixiEvent
        }
    },
    App: {
        stage: app.stage,
        renderer: app.renderer,
        AddTicker: (Callback) => app.ticker.add(Callback),
    }
}