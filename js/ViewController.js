import { Container, Sprite, Texture } from 'pixi.js';

let instance = null;

export default class ViewController {
    constructor(story) {
        if (!instance) {
            this.story = story;

            this.flash = new Sprite(Texture.WHITE);
            this.flash.zIndex = 3;
            this.flash.width = this.story.app.renderer.width;
            this.flash.height = this.story.app.renderer.height;
            this.flash.visible = false;
            this.story.app.stage.addChild(this.flash);

            this.curtain = new Sprite(Texture.WHITE);
            this.curtain.tint = 0x000000;
            this.curtain.zIndex = 0.5;
            this.curtain.width = this.story.app.renderer.width;
            this.curtain.height = this.story.app.renderer.height;
            this.story.app.stage.addChild(this.curtain);

            this.bg1 = new Sprite();
            this.bg1.zIndex = 0;
            this.bg1.anchor.set(0.5);
            this.bg1.x = this.story.app.renderer.width/2;
            this.bg1.y = this.story.app.renderer.height/2
            this.bg1.visible = false;
            this.story.app.stage.addChild(this.bg1);

            this.bg2 = new Sprite();
            this.bg2.zIndex = 0;
            this.bg2.anchor.set(0.5);
            this.bg2.x = this.story.app.renderer.width/2;
            this.bg2.y = this.story.app.renderer.height/2
            this.bg2.visible = false;
            this.story.app.stage.addChild(this.bg2);

            this.sub = new Sprite();
            this.sub.zIndex = 0;
            this.sub.anchor.set(0.5);
            this.sub.x = this.story.app.renderer.width/2;
            this.sub.y = this.story.app.renderer.height/2
            this.sub.visible = false;
            this.story.app.stage.addChild(this.sub);

            instance = this;
        }
        
        return instance;
    }

    loadFlash() {
        this.flash.visible = true;
    }
    hideFlash() {
        this.flash.visible = false;
    }

    loadCurtain() {
        this.curtain.visible = true;
    }
    hideCurtain() {
        this.curtain.visible = false;
    }

    loadBG1(texture) {
        this.bg1.texture = texture;
        this.bg1.scale.set(this.story.app.renderer.width / this.bg1.texture.width);
        this.bg1.visible = true;
    }
    hideBG1() {
        this.bg1.visible = false;
    }

    loadBG2(texture) {
        this.bg2.texture = texture;
        this.bg2.scale.set(this.story.app.renderer.height / this.bg2.texture.height);
        this.bg2.visible = true;
    }
    hideBG2() {
        this.bg2.visible = false;
    }

    hideBG() {
        this.bg1.visible = false;
        this.bg2.visible = false;
    }

    loadSubBG(texture) {
        this.sub.texture = texture;
        this.sub.scale.set(this.story.app.renderer.height / this.sub.texture.height);
        this.sub.visible = true;
    }
    hideSubBG() {
        this.sub.visible = false;
    }

    hideAll() {
        this.curtain.visible = false;
        this.flash.visible = false;
        this.bg1.visible = false;
        this.bg2.visible = false;
        this.sub.visible = false;
    }
}
