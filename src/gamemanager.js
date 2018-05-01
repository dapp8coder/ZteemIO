const { World } = require("./world");

class GameManager {
    /**
     * 
     * @param {World} world 
     */
    constructor(world) {
        this.world = world;
        this.callBacks = [];
        this.values = [];
    }

    SetValue(name, value) {
        return this.values[name] = value;
    }

    GetValue(name) {
        return this.values[name];
    }

    On(callBackName, callBack) {
        this.callBacks[callBackName] = callBack;
    }

    Trigger(callBackName) {
        if (this.callBacks[callBackName] == undefined) return;
        this.callBacks[callBackName](arguments);
    }
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    GameManager
}