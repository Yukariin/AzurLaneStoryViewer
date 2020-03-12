import { Sprite, Texture } from 'pixi.js';

let instance = null;

export default class ActorController {
    constructor(story) {
        if (!instance) {
            this.story = story;

            this.actor_left = new Sprite();
            this.actor_left.zIndex = 1;
            this.actor_left.anchor.set(0.5);
            this.actor_left.y = this.story.app.renderer.height/1.8;
            this.actor_left.visible = false;
            this.story.app.stage.addChild(this.actor_left);

            this.actor_middle = new Sprite();
            this.actor_middle.zIndex = 1;
            this.actor_middle.anchor.set(0.5);
            this.actor_middle.x = this.story.app.renderer.width/2;
            this.actor_middle.y = this.story.app.renderer.height/1.8;
            this.actor_middle.visible = false;
            this.story.app.stage.addChild(this.actor_middle);

            this.actor_right = new Sprite();
            this.actor_right.zIndex = 1;
            this.actor_right.anchor.set(0.5);
            this.actor_right.y = this.story.app.renderer.height/1.8;
            this.actor_right.visible = false;
            this.story.app.stage.addChild(this.actor_right);

            instance = this;
        }

        return instance;
    }

    loadLeft(texture) {
        this.actor_left.texture = texture;
        this.actor_left.scale.set(this.story.app.renderer.height / this.actor_left.texture.height);
        this.actor_left.x = this.actor_left.width*0.3;
        this.actor_left.visible = true;
    }

    loadMiddle(texture) {
        this.actor_middle.texture = texture;
        this.actor_middle.scale.set(this.story.app.renderer.height / this.actor_middle.texture.height);
        this.actor_middle.visible = true;
    }

    loadRight(texture) {
        this.actor_right.texture = texture;
        this.actor_right.scale.set(this.story.app.renderer.height / this.actor_right.texture.height);
        this.actor_right.x = this.story.app.renderer.height + this.actor_left.width*0.3;
        this.actor_right.visible = true;
    }

    load(targetActor, texture) {
        if (targetActor === this.actor_left)
            this.loadLeft(texture);
        else if (targetActor === this.actor_middle)
            this.loadMiddle(texture);
        else if (targetActor === this.actor_right)
            this.loadRight(texture);
    }

    hideAll() {
        this.actor_left.visible = false;
        this.actor_middle.visible = false;
        this.actor_right.visible = false;
    }
}
