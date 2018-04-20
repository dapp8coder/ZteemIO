const { JPixi } = require("./lib/jpixi");
const { appConf } = require("./lib/jpixi_config");
const { ResizeTypes } = require("./config");

class GUI {
    /**
     * 
     * @param {Camera} camera 
     */
    constructor(camera) {
        this.camera = camera;
        this.container = JPixi.Container.Create(appConf.cameraWidth, appConf.cameraHeight, 0, 0, 0, 0, this.camera.container);
    }

    CreatesSlide() {
        var newSlide = JPixi.Container.Create(appConf.cameraWidth, appConf.cameraHeight, 0, 0, 0, 0, this.container);
        return newSlide;
    }

    /**
     * 
     * @param {PIXI.Container} slide 
     */
    RemoveSlide(slide) {
        this.container.removeChild(slide);
    }

    CreateSpriteInSlide(resourcePath, slide, resizeType, posX, posY, width = -1, height = -1, visibleOnOff = true) {
        var sprite = JPixi.Sprite.Create(resourcePath, posX, posY, width, height);

        this.MakeRelativePosition(sprite, posX, posY);
        this.camera.AddToResizeList(sprite, resizeType, posX, posY);

        slide.addChild(sprite);

        sprite.visible = visibleOnOff;

        return sprite;
    }

    CreateSpriteInSlideChild(resourcePath, slide, resizeType, posX, posY, width = -1, height = -1, visibleOnOff = true) {
        var sprite = JPixi.Sprite.Create(resourcePath, posX, posY, width, height);
        sprite.position.set(posX, posY);

        slide.addChild(sprite);

        sprite.visible = visibleOnOff;

        return sprite;
    }

    CreateTextInSlide(text, slide, posX, posY, color = 0xFFFFFF, hAlign = "left", size = 18, font = "Courier", visibleOnOff = true) {
        var msgText = new PIXI.Text(text, { fontFamily: font, fontSize: size, fill: color, align: hAlign, strokeThickness: 5 });

        this.MakeRelativePosition(msgText, posX, posY);
        this.camera.AddToResizeList(msgText, ResizeTypes.Position, posX, posY);

        slide.addChild(msgText);

        msgText.visible = visibleOnOff;

        return msgText;
    }

    CreateTextInSlideChild(text, slideChild, posX, posY, color = 0xFFFFFF, size = 18, font = "Courier", hAlign = "left", visibleOnOff = true) {
        var msgText = new PIXI.Text(text, { fontFamily: font, fontSize: size, fill: color, align: hAlign, strokeThickness: 5 });
        msgText.position.set(posX, posY);

        slideChild.addChild(msgText);

        msgText.visible = visibleOnOff;

        return msgText;
    }

    CreateContainerInSlide(slide, posX, posY, width, height, pivotX = 0, pivotY = 0) {
        var container = new PIXI.Container();

        this.MakeRelativePosition(container, posX, posY);
        this.camera.AddToResizeList(container, ResizeTypes.Position, posX, posY);

        container.pivot.x = pivotX;
        container.pivot.y = pivotY;

        slide.addChild(container);

        return container;
    }

    /**
     * @param {PIXI.Container|PIXI.Sprite} pixiObject 
     */
    RemoveObject(pixiObject) {
        pixiObject.parent.removeChild(pixiObject);
    }


    MakeRelativePosition(pixiObject, posX, posY) {
        if (posX === true) {
            pixiObject.position.x = (appConf.cameraWidth / 2) - (pixiObject.width / 2);
        }
        else {
            if (posX < 0) pixiObject.position.x = appConf.cameraWidth + posX - pixiObject.width;
            else pixiObject.position.x = posX;
        }

        if (posY === true) {
            pixiObject.position.y = (appConf.cameraHeight / 2) - (pixiObject.height / 2);
        }
        else {

            if (posY < 0) pixiObject.position.y = appConf.cameraHeight + posY - pixiObject.height;
            else pixiObject.position.y = posY;
        }
    }
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    GUI
}