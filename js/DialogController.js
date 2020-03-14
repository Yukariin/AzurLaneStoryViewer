import { Container, Sprite, Text, Texture } from 'pixi.js';

let instance = null;

export default class DialogController {
    constructor(story) {
        if (!instance) {
            this.story = story;

            let sheet = this.story.assetloader.resources['storyui'];
            //console.log(sheet);

            this.dialogue = new Sprite(sheet.textures['bg.png']);
            this.dialogue.zIndex = 2;
            let scale = this.story.app.renderer.width / this.dialogue.width;
            //console.log(scale);
            this.dialogue.scale.set(scale);
            this.dialogue.y = this.story.app.renderer.height - this.dialogue.height;
            //this.dialogue.visible = false;
            this.dialogue_cache = true;
            console.log(this.dialogue);
            this.story.app.stage.addChild(this.dialogue);
            
            this.next = new Sprite(sheet.textures['next.png']);
            this.next.zIndex = 3;
            this.next.scale.set(0.8);
            //this.next.anchor.set(1);
            this.next.x = this.story.app.renderer.width - 32;
            this.next.y = this.story.app.renderer.width - 8;
            this.next.visible = false;
            console.log(this.next);
            this.story.app.stage.addChild(this.next);
            
            this.name_left = new Sprite(sheet.textures['name_bg.png']);
            this.name_left.zIndex = 2;
            this.name_left.scale.set(0.75);
            this.name_left.anchor.set(0, 1);
            this.name_left.x = 0;
            this.name_left.y = this.story.app.renderer.height - this.dialogue.height;
            this.name_left.visible = false;
            console.log(this.name_left);
            this.story.app.stage.addChild(this.name_left);
            
            this.name_right = new Sprite(sheet.textures['name_bg.png']);
            this.name_right.zIndex = 2;
            this.name_right.scale.set(0.75);
            this.name_right.anchor.set(1, 1);
            this.name_right.x = this.story.app.renderer.width;
            this.name_right.y = this.story.app.renderer.height - this.dialogue.height;
            //flip
            this.name_right.anchor.x = 0;
            this.name_right.scale.x *= -1;
            this.name_right.visible = false;
            console.log(this.name_right);
            this.story.app.stage.addChild(this.name_right);
            
            this.aside_text1 = new Text('aside1', {fontSize: 16, fill: 'white'});
            this.aside_text1.zIndex = 2;
            this.aside_text1.anchor.set(0.5);
            this.aside_text1.x = this.story.app.renderer.width/2;
            this.aside_text1.y = this.story.app.renderer.height/3;
            this.aside_text1.visible = false;
            console.log(this.aside_text1);
            this.story.app.stage.addChild(this.aside_text1);
            
            this.aside_text2 = new Text('aside2', {fontSize: 16, fill: 'white'});
            this.aside_text2.zIndex = 2;
            this.aside_text2.anchor.set(0.5);
            this.aside_text2.x = this.story.app.renderer.width/5;
            this.aside_text2.y = this.story.app.renderer.height/3;
            this.aside_text2.visible = false;
            console.log(this.aside_text2);
            this.story.app.stage.addChild(this.aside_text2);
            
            this.aside_sign_date = new Text('aside_sign_date', {fontSize: 16, fill: 'white'});
            this.aside_sign_date.zIndex = 2;
            this.aside_sign_date.anchor.set(0, 0.5);
            this.aside_sign_date.x = 0;
            this.aside_sign_date.y = this.story.app.renderer.height/2;
            //this.aside_sign_date.visible = false;
            console.log(this.aside_sign_date);
            this.story.app.stage.addChild(this.aside_sign_date);
            
            this.content = new Text('content', {fontSize: 16, fill: 'white', breakWords: true, wordWrap: true, wordWrapWidth: this.dialogue.width*0.9});
            this.content.zIndex = 2;
            this.content.anchor.set(0.5);
            this.content.x = this.dialogue.width/2;
            this.content.y = this.dialogue.height/2;
            //this.content.visible = false;
            this.content_cache = true;
            console.log(this.content);
            this.dialogue.addChild(this.content);
            
            this.name_left_text = new Text('name_left', {fontSize: 16, fill: 'white'});
            this.name_left_text.zIndex = 2;
            this.name_left_text.anchor.set(0.5);
            this.name_left_text.x = this.name_left.x + this.name_left.width/2;
            this.name_left_text.y = this.name_left.y - this.name_left.height /2;
            this.name_left_text.visible = false;
            console.log(this.name_left_text);
            this.story.app.stage.addChild(this.name_left_text);
            
            this.name_right_text = new Text('name_right', {fontSize: 16, fill: 'white'});
            this.name_right_text.zIndex = 2;
            this.name_right_text.anchor.set(0.5);
            this.name_right_text.x = this.name_right.x - this.name_right.width/2;
            this.name_right_text.y = this.name_right.y - this.name_right.height/2;
            this.name_right_text.visible = false;
            console.log(this.name_right_text);
            this.story.app.stage.addChild(this.name_right_text);

            instance = this;
        }

        return instance;
    }

    loadDialog() {}

    loadDialogue() {
        this.dialogue.visible = true;
        this.dialogue_cache = this.dialogue.visible;
    }
    hideDialogue() {
        this.dialogue.visible = false;
    }
    
    loadNameLeft() {
        this.name_left.visible = true;
        this.name_left_cache = this.name_left.visible;
    }
    hideNameLeft() {
        this.name_left.visible = false;
        this.name_left_cache = this.name_left.visible;
    }
    
    loadNameRight() {
        this.name_right.visible = true;
        this.name_right_cache = this.name_right.visible;
    }
    hideNameRight() {
        this.name_right.visible = false;
        this.name_right_cache = this.name_right.visible;
    }

    loadNext() {
        this.next.visible = true;
        this.next_cache = this.next.visible;
    }
    hideNext() {
        this.next.visible = false;
    }

    loadAside1() {
        this.aside_text1.visible = true;
    }
    hideAside1() {
        this.aside_text1.visible = false;
    }
    
    loadAside2() {
        this.aside_text2.visible = true;
    }
    hideAside2() {
        this.aside_text2.visible = false;
    }
    
    loadAsideDate() {
        this.aside_sign_date.visible = true;
    }
    hideAsideDate() {
        this.aside_sign_date.visible = false;
    }
    
    loadContent() {
        this.content.visible = true;
        this.content_cache = this.content.visible;
    }
    hideContent() {
        this.content.visible = false;
    }
    
    loadNameLeftText() {
        this.name_left_text.visible = true;
        this.name_left_text_cache = this.name_left_text.visible;
    }
    hideNameLeftText() {
        this.name_left_text.visible = false;
        this.name_left_text_cache = this.name_left_text.visible;
    }
    
    loadNameRightText() {
        this.name_right_text.visible = true;
        this.name_right_text_cache = this.name_right_text.visible;
    }
    hideNameRightText() {
        this.name_right_text.visible = false;
        this.name_right_text_cache = this.name_right_text.visible;
    }
    
    loadDialogueAll() {
        this.dialogue.visible = true;
        this.next.visible = this.next_cache;
        this.name_left.visible = this.name_left_cache;
        this.name_right.visible = this.name_right_cache;

        this.content.visible = true;
        this.name_left_text.visible = this.name_left_text_cache;
        this.name_right_text.visible = this.name_right_text_cache;
    }
    hideDialogueAll() {
        this.dialogue_cache = this.dialogue.visible;
        this.next_cache = this.next.visible;
        this.name_left_cache = this.name_left.visible;
        this.name_right_cache = this.name_right.visible;

        this.content_cache = this.content.visible;
        this.name_left_text_cache = this.name_left_text.visible;
        this.name_right_text_cache = this.name_right_text.visible;

        this.dialogue.visible = false;
        this.next.visible = false;
        this.name_left.visible = false;
        this.name_right.visible = false;

        this.content.visible = false;
        this.name_left_text.visible = false;
        this.name_right_text.visible = false;
    }

    hideAll() {
        this.dialogue.visible = false;
        this.next.visible = false;
        this.name_left.visible = false;
        this.name_right.visible = false;

        this.aside_text1.visible = false;
        this.aside_text2.visible = false;
        this.aside_sign_date.visible = false;
        this.content.visible = false;
        this.name_left_text.visible = false;
        this.name_right_text.visible = false;
    }
}
