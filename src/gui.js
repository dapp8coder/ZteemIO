const { JPixi } = require("./lib/jpixi");
const { appConf } = require("./lib/jpixi_config");
const { World } = require("./world");
const { ResizeTypes } = require("./camera");

class GUI {
    /**
     * 
     * @param {World} world 
     */
    constructor(world) {
        this.world = world;
        this.container = JPixi.Container.Create(appConf.cameraWidth, appConf.cameraHeight, 0, 0, 0, 0, this.world.camera);
        this.world.camera.AddToResizeList(this.container, ResizeTypes.FullSize);

        this.containerList = [];
    }

    AddContainer(resourcePath, posX, posY, width, height, container = undefined) {
        if (container == undefined) container = this.container;
        this.containerList.push([resourcePath, JPixi.Container.Create(width, height, posX, posY, 0, 0, undefined, container)]);
    }
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    GUI
}