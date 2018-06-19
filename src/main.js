const { JPixi, App } = require("./lib/jpixi");
const { appConf } = require("./lib/jpixi_config");
const { Player, Friend } = require("./dynamicobject");
const { ResizeTypes } = require("./config");
const { World } = require("./world");
const { StaticObject, StaticTiledObject } = require("./staticobject");
const { Psy, Star, PUOutOfPhase, PURepel, PUFreeze, PUMunch } = require("./itemobject");
const { Grid } = require("./grid");
const { JSC2 } = require("./lib/jsc2");
const { SteemScore } = require("./steemscore");
const { site } = require("./config");
const steemScoreConfig = require("./config").steemScore;

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

/**
 * Add some music and sounds.
 */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GAME GLOBALS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**@type {World} */
var world;
var GameState;
/**@type {JSC2} */
var jSC2;
/**@type {SteemScore} */
var steemScore;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PIXI EVENTS
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

JPixi.Event.Init(() => {
    var resList = [
        site.img + "black1px.png",
        site.img + "white1px.png"
    ];

    JPixi.Resources.AddArray(resList, true);
});

JPixi.Event.Start(() => {
    world = new World();        // Create world, camera, gui & grid
    jSC2 = new JSC2();          // Create SteemConnect2 login
    steemScore = new SteemScore(jSC2);

    GameState = MakeGameMenu(); // Create main menu.

    /// DEBUG
    // var FPS = JPixi.Text.CreateFPS();

    /// BEGIN GAME
    App.AddTicker(delta => {
        //   FPS();

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

    var testText = world.camera.gui.CreateTextInSlideChild("LOGIN", buttonContainer, 26, 14, 0xFFFFFF, 13);
    var testText2 = world.camera.gui.CreateTextInSlideChild("LOGOUT", buttonContainer, 22, 14, 0xFFFFFF, 13);
    var testText3 = world.camera.gui.CreateTextInSlideChild("START GAME", buttonContainer, 128 + 5, 14, 0xFFFFFF, 13);
    var testText4 = world.camera.gui.CreateTextInSlideChild("HIGH SCORES", buttonContainer, 256 + 2, 14, 0xFFFFFF, 13);

    if (jSC2.accessToken != "") {
        var loginText = world.camera.gui.CreateTextInSlideChild("Fetching Steem profile.", buttonContainer, 0, 64, 0xFFFFFF, 12);

        jSC2.GetProfile(profile => {
            loginText.text = "Hello " + profile.user + "! Best of luck getting on the\nhigh score list.";
        });

    } else {
        var loginText = world.camera.gui.CreateTextInSlideChild("Login, using SteemConnect, to be able to save and\npost your score to the Steem blockchain.", buttonContainer, 0, 64, 0xFFFFFF, 12);
    }

    var versionText = world.camera.gui.CreateTextInSlideChild("Version: " + steemScoreConfig.version + "\nHigh Score Version: " + steemScoreConfig.hsversion, buttonContainer, 0, 112, 0xFFFFFF, 9);

    buttonLogin.Input(true, true, "pointerup", event => {
        jSC2.RedirectToSC2();
    });

    buttonLogout.Input(true, true, "pointerup", event => {
        jSC2.Logout();
    });

    if (jSC2.accessToken != "") {
        buttonLogin.visible = false;
        testText.visible = false;
    }
    else {
        buttonLogout.visible = false;
        testText2.visible = false;
    }


    //////////////////////////////////////////////////////////////////////////////////////
    // INSTRUCTIONS
    buttonStart.Input(true, true, "pointerup", event => {
        event.stopPropagation();

        world.camera.gui.RemoveSlide(mainMenu);
        var instructions = world.camera.gui.CreatesSlide();
        var insContainer = world.camera.gui.CreateContainerInSlide(instructions, true, 30, 0, 0);

        world.camera.gui.CreateTextInSlideChild("GAME OBJECTS AND HOW TO PLAY", insContainer, -5, -10);

        //Player
        world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 31, 24, 24).tint = 0x0000FF;
        world.camera.gui.CreateTextInSlideChild("Player.", insContainer, 30, 33, 0xFFFFFF, 16);

        //Tail
        world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 75, 20, 20).tint = 0xFF0000;
        world.camera.gui.CreateTextInSlideChild("Enemy Head. Tail count * 10 points * head kill count.", insContainer, 30, 75, 0xFFFFFF, 16);
        var tail = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 103, 8, 8);
        setInterval(() => {
            tail.tint = 0xFFFFFF * Math.random();
        }, 10);
        world.camera.gui.CreateTextInSlideChild("Enemy Tail. 10 points. ", insContainer, 30, 96, 0xFFFFFF, 16);

        //Star
        world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 132, 8, 8).tint = 0xAADDFF;
        world.camera.gui.CreateTextInSlideChild("Player Food. 1 point.", insContainer, 30, 126, 0xFFFFFF, 16);

        //Powerups
        world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 160, 14, 14).tint = 0x00FF2F;
        world.camera.gui.CreateTextInSlideChild("Power-up Freeze. 10 points.", insContainer, 30, 157, 0xFFFFFF, 16);
        world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 180, 14, 14).tint = 0xFFFF00;
        world.camera.gui.CreateTextInSlideChild("Power-up Scatter. 10 points.", insContainer, 30, 177, 0xFFFFFF, 16);
        world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 200, 14, 14).tint = 0xFF00FF;
        world.camera.gui.CreateTextInSlideChild("Power-up Invincible. 10 points.", insContainer, 30, 197, 0xFFFFFF, 16);
        world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, 0, 0, 220, 14, 14).tint = 0xAF1A4F;
        world.camera.gui.CreateTextInSlideChild("Power-up Eat Enemy. 10 points.", insContainer, 30, 217, 0xFFFFFF, 16);

        world.camera.gui.CreateTextInSlideChild("Click / Touch and hold down while moving to move the player.\nEat as much food as possible while avoiding the enemy.",
            insContainer, -5, 258, 0xFFFFFF, 14);
        world.camera.ResizeList();

        var buttonStart2 = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", insContainer, ResizeTypes.Position, 0, 320, 96, 48);
        var testText3 = world.camera.gui.CreateTextInSlideChild("GOT IT!", insContainer, 0 + 17, 334, 0xFFFFFF, 13);

        buttonStart2.Input(true, true, "pointerup", event => {
            world.camera.gui.RemoveSlide(instructions);
            musicTest.stop();

            MakeGameWorld();
        });
    });


    //////////////////////////////////////////////////////////////////////////////////////
    // High score list
    buttonHighScores.Input(true, true, "pointerup", event => {
        event.stopPropagation();

        var highscoresMenu = world.camera.gui.CreatesSlide();
        var highscoresBackground = world.camera.gui.CreateSpriteInSlide(site.img + "black1px.png", highscoresMenu, ResizeTypes.FullSize, 0, 0, appConf.cameraWidth, appConf.cameraHeight);
        highscoresBackground.alpha = 0.8;

        highscoresBackground.Input(true, true, "pointerup", event => {
            world.camera.gui.RemoveSlide(highscoresMenu);
        });

        var highScoreContainer = world.camera.gui.CreateContainerInSlide(highscoresMenu, true, 30, 0, 0);
        var loadingText = world.camera.gui.CreateTextInSlideChild("Loading...", highScoreContainer, -50, 20);

        steemScore.GetHighScores(() => {
            highScoreContainer.removeChild(loadingText);

            world.camera.gui.CreateTextInSlideChild("Pos", highScoreContainer, 0, 60);
            world.camera.gui.CreateTextInSlideChild("User", highScoreContainer, 60, 60);
            world.camera.gui.CreateTextInSlideChild("Score", highScoreContainer, 170, 60);
            world.camera.gui.CreateTextInSlideChild("Date", highScoreContainer, 280, 60);

            var heightPos = 80;

            for (var i = 0; i < steemScore.list.length; i++) {
                var highScore = steemScore.list[i];

                world.camera.gui.CreateTextInSlideChild((i + 1), highScoreContainer, 0, heightPos);
                world.camera.gui.CreateTextInSlideChild(highScore[1], highScoreContainer, 60, heightPos);
                world.camera.gui.CreateTextInSlideChild(highScore[0], highScoreContainer, 170, heightPos);
                world.camera.gui.CreateTextInSlideChild(highScore[2], highScoreContainer, 280, heightPos);

                heightPos += 20;
            }

            world.camera.gui.CreateTextInSlideChild("TOP TEN HIGH SCORES", highScoreContainer, highScoreContainer.width / 4 - 10, 20);
            world.camera.gui.CreateTextInSlideChild("Click / Touch anywhere to close.", highScoreContainer, highScoreContainer.width / 4 - 28, highScoreContainer.height + 50, 0xFFFFFF, 14);
            world.camera.ResizeList();
        });
    });


    //////////////////////////////////////////////////////////////////////////////////////
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
    // Stars
    for (var i = 0; i < 2000; i++) {
        var star = new Star(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 8, 8);
    }

    // Player
    var player = new Player(site.img + "white1px.png", world, appConf.worldWidth / 2, appConf.worldHeight / 2, 24, 24);
    world.camera.SetTarget(player);

    // Power ups
    for (var i = 0; i < 5; i++) {
        var puoop = new PUOutOfPhase(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 14, 14);
    }
    for (var i = 0; i < 5; i++) {
        var purepel = new PURepel(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 14, 14);
    }
    for (var i = 0; i < 5; i++) {
        var pufreeze = new PUFreeze(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 14, 14);
    }
    for (var i = 0; i < 5; i++) {
        var pumunch = new PUMunch(site.img + "white1px.png", world, Math.random() * appConf.worldWidth, Math.random() * appConf.worldHeight, 14, 14);
    }

    // Create game GUI
    var score = world.gameManager.SetValue("score", 0);

    var gameGUI = world.camera.gui.CreatesSlide("gameGUI");
    var scoreText = world.camera.gui.CreateTextInSlide("Score: " + score, gameGUI, 20, 0, 0xFFFFFF);

    // Score update
    world.gameManager.On("UpdateScore", params => {
        score = world.gameManager.SetValue("score", score + params[1]);
        scoreText.text = "Score: " + score;
    });

    /////////////////////////////////////////////////////////////////////////////
    // Game over screen
    world.gameManager.On("GameOver", params => {
        var gameGUIBackground = world.camera.gui.CreateSpriteInSlide(site.img + "black1px.png", gameGUI, ResizeTypes.FullSize, 0, 0, appConf.cameraWidth, appConf.cameraHeight);
        gameGUIBackground.alpha = 0;
        gameGUI.setChildIndex(gameGUIBackground, 0);

        var gameOverContainer = world.camera.gui.CreateContainerInSlide(gameGUI, true, true, 0, 0);
        var gameOver = world.camera.gui.CreateTextInSlide("GAME OVER MAN, GAME OVER!\nSCORE: " + score, gameGUI, true, 120, 0xFFFFFF, 18, "Courier", "center");
        var checkHS = world.camera.gui.CreateTextInSlide("Checking for position on the\nhigh score list...", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");

        steemScore.GetHighScores(() => {
            gameGUI.removeChild(checkHS);

            steemScore.SetPlayerHighScorePos(score);

            var buttonReloadPosX = 128;
            var scoreMessage;
            var testTextSave;
            var buttonPostHighScore = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", gameOverContainer, ResizeTypes.Position, 0, 60, 96, 48);
            buttonPostHighScore.tint = 0x00FF00;

            if (steemScore.playerPos != -1 && jSC2.accessToken != "") {
                scoreMessage = world.camera.gui.CreateTextInSlide("Your score is position " + steemScore.playerPos + " on\nthe high score list!", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");
                testTextSave = world.camera.gui.CreateTextInSlideChild("POST\nHIGH SCORE", gameOverContainer, 0 + 7, 66, 0xFFFFFF, 13, "Courier", "center");
            } else if (jSC2.accessToken != "") {
                scoreMessage = world.camera.gui.CreateTextInSlide("Your did not get on the high score list.\nMake a blog post with your score!", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");
                testTextSave = world.camera.gui.CreateTextInSlideChild("MAKE\nBLOG POST", gameOverContainer, 0 + 9, 66, 0xFFFFFF, 13, "Courier", "center");
            }
            else if (steemScore.playerPos != -1 && jSC2.accessToken == "") {
                scoreMessage = world.camera.gui.CreateTextInSlide("Your score is position " + steemScore.playerPos + " on the high score\nlist! Login to post future high scores.", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");
                gameOverContainer.removeChild(buttonPostHighScore);
                buttonReloadPosX = 0;
            } else if (jSC2.accessToken == "") {
                scoreMessage = world.camera.gui.CreateTextInSlide("Your did not get on the high score list.\nLogin to post future high scores.", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");
                gameOverContainer.removeChild(buttonPostHighScore);
                buttonReloadPosX = 0;
            }
            else {
                gameOverContainer.removeChild(buttonPostHighScore);
                buttonReloadPosX = 0;
            }

            var buttonReload = world.camera.gui.CreateSpriteInSlideChild(site.img + "white1px.png", gameOverContainer, ResizeTypes.Position, buttonReloadPosX, 60, 96, 48);
            var testTextReload = world.camera.gui.CreateTextInSlideChild("MAIN MENU", gameOverContainer, buttonReloadPosX + 11, 74, 0xFFFFFF, 13);

            var falseMouseUp = true;
            buttonPostHighScore.Input(true, true, "pointerdown", event => {
                falseMouseUp = false;
            });

            buttonPostHighScore.Input(true, true, "pointerup", event => {
                if (falseMouseUp) return;

                buttonPostHighScore.visible = false;
                testTextSave.visible = false;
                buttonReload.visible = false;
                testTextReload.visible = false;

                gameGUI.removeChild(scoreMessage);
                scoreMessage = world.camera.gui.CreateTextInSlide("Posting score...", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");

                steemScore.AddAndPostPlayerScore(() => {
                    gameOverContainer.removeChild(buttonPostHighScore);
                    gameOverContainer.removeChild(testTextSave);
                    buttonReload.position.x = 64;
                    testTextReload.position.x = 64 + 11;

                    gameGUI.removeChild(scoreMessage);

                    if (steemScore.playerPos != -1) scoreMessage = world.camera.gui.CreateTextInSlide("High score list updated and your score posted.", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");
                    else scoreMessage = world.camera.gui.CreateTextInSlide("Your score has been posted.", gameGUI, true, 180, 0xFFFFFF, 18, "Courier", "center");

                    buttonReload.visible = true;
                    testTextReload.visible = true;
                });
            });

            buttonReload.Input(true, true, "pointerdown", event => {
                falseMouseUp = false;
            });
            buttonReload.Input(true, true, "pointerup", event => {
                if (falseMouseUp) return;

                window.location = "?access_token=" + jSC2.accessToken;
            });

            world.camera.ResizeList();
        });

        setInterval(() => {
            gameGUIBackground.alpha += 0.0025;
        }, 1);
    });

    GameState = delta => { world.Update(delta); };
}