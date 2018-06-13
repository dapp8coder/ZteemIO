
const { JPixi } = require("./lib/jpixi");
const { BaseObjectColl, ColliderTypes } = require("./baseobject");
const { staticObj } = require("./config");

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// STATIC OBJECT EXTENSION
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class StaticObject extends BaseObjectColl {
    /**
     * 
     * @param {string} resourcePath path to image file to use as sprite.
     * @param {Number} posX postition X in world container.
     * @param {Number} posY postition Y in world container.
     * @param {Number} width width of sprite.
     * @param {Number} height height of sprite.
     * @param {World} world what world this object is in.
     */
    constructor(resourcePath, world, posX, posY, width, height, colliderType = ColliderTypes.Box) {
        super(world, posX, posY, width, height, colliderType);
        this.world.grid.AddStaticToCell(this);

        if (colliderType == ColliderTypes.BoxCentered || colliderType == ColliderTypes.Circle)
            this.sprite = JPixi.Sprite.Create(resourcePath, this.prop.x, this.prop.y, this.prop.width, this.prop.height, this.world.layerMiddle, true);
        else
            this.sprite = JPixi.Sprite.Create(resourcePath, this.prop.x, this.prop.y, this.prop.width, this.prop.height, this.world.layerMiddle, false);
    }

    Update(cell) {
        if (cell.FramesBetweenUpdates(staticObj.collisionUpdateRate)) {
            var player = cell.player[0];
            if (player != undefined && this.world.Collide(this.collider, player.collider)) this.CollisionPlayer(player);

            for (var i = cell.friends.length - 1; i > -1; i--) {
                var friend = cell.friends[i];

                if (this.world.Collide(this.collider, friend.collider)) this.CollisionFriend(friend);
            }

            for (var i = cell.foes.length - 1; i > -1; i--) {
                var foe = cell.foes[i];

                if (this.world.Collide(this.collider, foe.collider)) this.CollisionFoe(foe);
            }
        }
    }

    CollisionPlayer(player) {
        this.OnCollision(player);
    }
    CollisionFriend(friend) {
        this.OnCollision(friend);
    }
    CollisionFoe(foe) {
        this.OnCollision(foe);
    }

    OnCollision(other) {
        if (this.world.collInfo.overlapN.x != 0) {
            other.target.direction.x = 0;
            other.prop.x += this.world.collInfo.overlapV.x * 1.1;
        }

        if (this.world.collInfo.overlapN.y != 0) {
            other.target.direction.y = 0;
            other.prop.y += this.world.collInfo.overlapV.y * 1.1;
        }
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TILING STATIC OBJECT EXTENSION
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class StaticTiledObject extends StaticObject {
    /**
     * 
     * @param {string} resourcePath path to image file to use as sprite.
     * @param {Number} posX postition X in world container.
     * @param {Number} posY postition Y in world container.
     * @param {Number} width width of sprite.
     * @param {Number} height height of sprite.
     * @param {World} world what world this object is in.
     */
    constructor(resourcePath, world, posX, posY, width, height, colliderType = ColliderTypes.Box) {
        super(resourcePath, world, posX, posY, width, height, colliderType);
        this.world.layerMiddle.removeChild(this.sprite);

        if (colliderType == ColliderTypes.BoxCentered || colliderType == ColliderTypes.Circle)
            this.sprite = JPixi.Sprite.CreateTiling(resourcePath, this.prop.x, this.prop.y, this.prop.width, this.prop.height, this.world.layerMiddle, true);
        else
            this.sprite = JPixi.Sprite.CreateTiling(resourcePath, this.prop.x, this.prop.y, this.prop.width, this.prop.height, this.world.layerMiddle, false);
    }
}


///////////////////////////////////////////////////////////////////////////////
// MODULE EXPORT
///////////////////////////////////////////////////////////////////////////////

module.exports = {
    StaticObject,
    StaticTiledObject
}