import { gsap } from 'gsap';
import * as PIXI from 'pixi.js';

import ActorController from './ActorController';
import DialogController from './DialogController';
import ViewController from './ViewController';
import PixiPlugin from './PixiPlugin'
import { getNameAndPainting, hsv2rgb } from './utils';

const STORY_MODE = {
    ASIDE: 1,
    DIALOG: 2,
    BG: 3,
};

const ACTOR_SIDE = {
    LEFT: 0,
    RIGHT: 1,
    CENTER: 2,
};

const DEFAULT_PAINT_ALPHA = 0.3;
const DEFAULT_PAINT_FADE_TIME = 1;

let instance = null;

export default class StageController {
    constructor(story) {
        if (!instance) {
            this.story = story;

            this.actorController = new ActorController(this.story);
            this.dialogController = new DialogController(this.story);
            this.viewController = new ViewController(this.story);

            this.interactive = true;
            this.inFadeOut = false;
            this.inflashin = false;
            this.inflashout = false;
            this.occlusion = false;
            this.blankScreen = false;
            this.preBg = null;
            this.preStep = null;
            this.targetActor = null;

            gsap.registerPlugin(PixiPlugin);

            instance = this;
        }

        return instance;
    }

    load() {
        this.dialogController.loadDialog();

        this.viewController.hideSubBG();
    }

    play(story) {
        var stop = false;
        this.interactive = true;

        this.dialogController.aside_sign_date.text = '';

        var it = null;
        function* nextIter() {
            for (var step of story.scripts) {
                console.log(step);

                if (stop && !step.compulsory) {
                    // do nothing
                } else{
                    this.viewController.hideFlash();
                    stop = false;
                    let mode = step.mode || story.mode;
                    if (mode == STORY_MODE.ASIDE) {
                        if (step.flashout) {
                            this.flashout(step, () => { this.initAside(step); });
                        } else {
                            this.initAside(step);
                        }
                    } else if (mode == STORY_MODE.DIALOG) {
                        if (step.flashout) {
                            this.flashout(step, () => { this.initDialog(step); });
                        } else {
                            this.initDialog(step);
                        }
                    } else if (mode == STORY_MODE.BG) {
                        if (step.flashout) {
                            this.flashout(step, () => { this.initBG(step); });
                        } else {
                            this.initBG(step);
                        }
                    }

                    if (step.options) {
                        if (step.typewriter) {
                            
                        } else {
                            
                        }
                    }

                    if (step.effects) {
                        this.setEffects(step.effects);
                    }

                    if (step.bgm) {
                        if (step.bgmDelay) {
                            
                        } else {
                            
                        }
                    } else if (step.stopbgm) {
                        
                    }

                    let tl = gsap.timeline();
                    if (step.flash) {
                        let target = this.viewController.flash;
                        target.tint = (step.flash.black) ? 0x000000 : 0xffffff;
                        this.viewController.loadFlash();

                        for (let j = 1; j <= step.flash.number; j++) {
                            let dur = (step.flash.dur) ? step.flash.dur/2 : step.flash.dur1;
                            tl.fromTo(target, dur, {alpha: step.flash.alpha[0]}, {alpha: step.flash.alpha[1], delay: (j-1)*step.flash.delay});
                            tl.fromTo(target, dur, {alpha: step.flash.alpha[1]}, {alpha: step.flash.alpha[0], delay: step.flash.wait, onComplete: ()=>{
                                if (j >= step.flash.number)
                                    this.viewController.hideFlash();
                            }});
                        }
                    }
                    if (step.flashN) {
                        let target = this.viewController.flash;
                        target.tint = 0xffffff; // TODO: set color from step!
                        this.viewController.loadFlash();
                        for (let v of step.flashN.alpha) {
                            tl.fromTo(target, v[2], {alpha: v[0]}, {alpha: v[1], delay: v[3] || 0});
                        }
                    }

                    if (step.dialogShake) {
                        this.interactive = false;
                        let target = [this.dialogController.dialogue];
                        let delay = step.dialogShake.delay || 0;
                        tl.to(target, step.dialogShake.speed,{x: step.dialogShake.x, delay: delay, repeat: step.dialogShake.number, onComplete: ()=>{
                            this.dialogController.dialogue.x = 0;
                            this.interactive = true;
                        }});
                    }

                    if (step.soundeffect) {
                        if (step.seDelay) {
                            
                        } else {
                            
                        }
                    }

                    if (step.movie) {
                        continue;
                    }

                    let skip = step.skip || 0;

                    yield step;
                }
            }

            if (!story.continueBgm) {
            
            }

            if (!stop && story.fadeOut) {
                if (story.noWaitFade) {
                    console.log('story end!');
                    this.fadeOut(story.fadeType, story.fadeOut);
                } else {
                    this.fadeOut(story.fadeType, story.fadeOut, () => {console.log('story end!');});
                }
                stop = true
            } else if (!stop && story.occlusion) {
                this.occlusion = true;
                setTimeout(() => {
                    this.stop();
                    this.occlusion = false;
                    console.log('story end!');
                }, story.occlusion*1000);
                stop = true
            } else {
                this.stop(() => {console.log('story end!');});
            }
        }
        it = (nextIter.bind(this))();

        this.story.element.addEventListener('click', () => {
            if (!this.interactive) return;
            if (this.inflashin) return;
            if (this.inflashout) return;
            if (this.occlusion) return;
            if (this.blankScreen) return;

            if (this.inFadeOut) {
                this.inFadeOut = false;
                this.stop();
                return;
            }

            it.next();
        });

        it.next();
    }
    
    stop(callback = ()=>{}) {
        this.inFadeOut = false;
        this.inflashin = false;
        this.inflashout = false;
        this.occlusion = false;
        this.preBg = null;

        this.viewController.hideAll();
        this.dialogController.hideAll();
        this.actorController.hideAll();

        gsap.to(this.story.app.stage, 0, {alpha: 174/255});

        if (callback)
            callback();
    }

    initAside(step) {
        let aside_text = (!step.asideType || step.asideType == 1) ? this.dialogController.aside_text1 : this.dialogController.aside_text2
        aside_text.visible = true;
        
        this.viewController.hideSubBG();
        this.viewController.loadCurtain();
        this.viewController.curtain.alpha = step.alpha || 1;

        this.interactive = false;

        let tl = gsap.timeline({onComplete: ()=>{ this.interactive = true; }});

        let speed = step.bgSpeed || 0.5;
        if (step.bgFade && this.preBg) {
            this.interactive = false;
            tl.to(
                [this.viewController.bg1,this.viewController.bg2],
                speed,
                {alpha: 0, onComplete: ()=>{
                    this.preBg = null;
                    this.viewController.hideBG();
                }}
            );
        } else {
            this.preBg = null;
            this.viewController.hideBG();
        }

        if (this.preStep && step.paintingFadeOut) {
            this.interactive = false;
            //paintingFadeOut
            this.interactive = true;
        } else {
            this.dialogController.hideDialogueAll();
            this.actorController.hideAll();
        }

        let write = () => {
            let delay = 0;
            for (let aisdeData of step.sequence || []) {
                delay = aisdeData[1];
                tl.fromTo(aside_text, step.sequenceSpd || 1, {alpha: 0}, {alpha: 1, delay: delay, onStart: ()=>{
                    aside_text.text = aisdeData[0];
                }, onComplete: ()=>{
                    if (step.autoComplete)
                        this.story.element.click();
                }});
            }

            if (step.signDate) {
                let content = step.signDate[0];
                delay = step.signDate[1];
                let target = this.dialogController.aside_sign_date;
                target.text = content;
                target.alpha = 0;
                tl.to(target, step.sequenceSpd || 1, {alpha: 1, delay: delay, onComplete: ()=>{
                    if (step.autoComplete)
                        this.story.element.click();
                }});
            } else {
                this.dialogController.aside_sign_date.text = '';
            }
        };

        if (step.flashin) {
            this.flashin(step, ()=>{ write(); });
        } else {
            write();
        }

        if ((step.sequence || []).length == 0)
            this.interactive = true;

        if (step.bgName) {
            this.viewController.hideBG();
            if (step.useBg2) {
                this.viewController.bg2.alpha = 1;
                this.viewController.bg2.tint = 0xffffff;
                this.viewController.loadBG2(this.story.assetloader.resources[step.bgName].texture);
            } else {
                this.viewController.bg1.alpha = 1;
                this.viewController.bg1.tint = 0xffffff;
                this.viewController.loadBG1(this.story.assetloader.resources[step.bgName].texture);
            }
        }

        if (step.bgShadow) {
            let bg = (step.useBg2) ? this.viewController.bg2 : this.viewController.bg1;
            let fro = step.bgShadow[0];
            let to = step.bgShadow[1];
            let speed = step.bgShadow[2];
            tl.fromTo(bg, speed, {brightness: fro}, {brightness: to});
            //tint = PIXI.utils.rgb2hex(hsv2rgb(v,v,v));
            //gsap.fromTo(bg, speed, {tint: fro}, {tint: to});
        }
    }

    initDialog(step) {
        this.viewController.hideCurtain();
        this.viewController.hideSubBG();
        this.dialogController.hideAside1();
        this.dialogController.hideAside2();
        this.dialogController.hideAsideDate();
        this.dialogController.loadDialogue();

        if (step.bgFade && this.preBg) {
            let speed = step.bgSpeed || 0.5;
            this.interactive = false;
            gsap.to(
                [this.viewController.bg1,this.viewController.bg2],
                speed,
                {alpha: 0, onComplete: ()=>{
                    this.interactive = true;
                    this.preBg = null;
                }}
            );
        } else {
            
        }

        if (step.bgName) {
            this.viewController.hideBG();
            let tex = this.story.assetloader.resources[step.bgName].texture;
            let bg = (step.useBg2) ? this.viewController.bg2 : this.viewController.bg1;
            bg.alpha = 1;
            bg.tint = 0xffffff;
            if (step.useBg2) {
                this.viewController.loadBG2(tex);
            } else {
                this.viewController.loadBG1(tex);
            }
        }

        let side = step.side || 0;
        let [targetName, targetNameText, targetActor] = this.getTargetActor(side);

        this.actorController.actor_left.visibile = (step.actor && (targetActor === this.actorController.actor_left));
        this.actorController.actor_middle.visibile = (step.actor && (targetActor === this.actorController.actor_middle));
        this.actorController.actor_right.visibile = (step.actor && (targetActor === this.actorController.actor_right));
        if (targetName === this.dialogController.name_left && (step.actor || step.actorName) && !step.withoutActorName) {
            this.dialogController.loadNameLeft();
            this.dialogController.loadNameLeftText();
        } else {
            this.dialogController.hideNameLeft();
            this.dialogController.hideNameLeftText();
        }
        if (targetName === this.dialogController.name_right && (step.actor || step.actorName) && !step.withoutActorName) {
            this.dialogController.loadNameRight();
            this.dialogController.loadNameRightText();
        } else {
            this.dialogController.hideNameRight();
            this.dialogController.hideNameRightText();
        }

        if (step.actorPosition) {}

        if (step.actor) {
            let settings = step.painting || {};
            let nameTint = (step.nameColor) ? PIXI.utils.string2hex(step.nameColor) : 0xffffff;
            let [name,painting] = getNameAndPainting(step);
            targetNameText.tint = nameTint;
            targetNameText.text = name;

            if (!step.withoutPainting) {
                if (this.preStep && step.paintingFadeOut) {
                    this.interactive = false;
                    targetActor.visibile = false;
                    this.dialogController.hideDialogueAll();

                    this.paintingFadeOut(this.preStep, step, ()=>{
                        this.interactive = true;
                        targetActor.visibile = true;
                        this.dialogController.loadDialogueAll();
                    });
                }

                let loadPainting = () => {
                    let tex = this.story.assetloader.resources[painting].texture;
                    this.actorController.load(targetActor, tex);
                    // TODO: implement shadow

//                     let scale = step.actorScale || 1;
//                     let dir = (step.dir && step.dir < 0) ? -1 : 1;
//                     console.log(scale, dir, dir*scale);

                    if (this.preStep && (this.preStep.side == step.side)) {
                        if (step.side != ACTOR_SIDE.CENTER) {
                            targetActor.visible = true;
                            return;
                        }
                    }

                    let alpha = settings.alpha || DEFAULT_PAINT_ALPHA;
                    let time = settings.time || DEFAULT_PAINT_FADE_TIME;
                    if (this.targetActor && (step.side != ACTOR_SIDE.CENTER) && !step.hideOther) {
                        this.targetActor.visible = true;
                        this.setFade(this.targetActor, 1, alpha, time); // fade out old actor
                    }
                    if (this.targetActor !== targetActor) {
                        this.setFade(targetActor, alpha, 1, time); // fade in new actor
                        this.targetActor = targetActor;
                    }
                };

                loadPainting();

                if (step.shake) {
                    let x = step.shake.x || 0;
                    let y = step.shake.y || 10;
                    let pos_x = targetActor.x;
                    let pos_y = targetActor.y;
                    let speed = (step.shake.speed || 1) / (step.shake.number || 1);
                    gsap.to(targetActor, speed, {x: pos_x+x, y: pos_y+y, repeat: step.shake.number || 1, onComplete: ()=>{
                        targetActor.x = pos_x;
                        targetActor.y = pos_y;
                    }});
                }
            }
        } else {
            if (step.actorName) {
                let nameTint = (step.nameColor) ? PIXI.utils.string2hex(step.nameColor) : 0xffffff;
                targetNameText.tint = nameTint;
                targetNameText.text = name;
            }
        }

        let write = () => {
            this.dialogController.content.text = step.say || '...';
        };

        if (step.flashin) {
            this.flashin(step, ()=>{ write(); });
        } else {
            write();
        }

        //this.dialogController.loadNext();
        this.preStep = step;

        if (step.blackBg) {
            this.viewController.loadCurtain();
            this.viewController.curtain.alpha = 1;
        }
    }

    initBG(step) {
        this.dialogController.hideAside1();
        this.dialogController.hideAside2();
        this.viewController.hideCurtain();

        if (step.blackBg) {
            this.viewController.loadCurtain();
            this.viewController.curtain.alpha = 1;
        }

        if (step.flashin) {
            this.flashin(step);
        }

        let side = step.side || 0;
        if (side == ACTOR_SIDE.LEFT) {
            this.dialogController.loadNameLeft();
            this.dialogController.loadNameLeftText();
        } else {
            this.dialogController.hideNameLeft();
            this.dialogController.hideNameLeftText();
        }
        if (side == ACTOR_SIDE.RIGHT) {
            this.dialogController.loadNameRight();
            this.dialogController.loadNameRightText();
        } else{
            this.dialogController.hideNameRight();
            this.dialogController.hideNameRightText();
        }

        let bgFade = (from, to, time, delay, callback) => {
            gsap.fromTo(
                [this.viewController.bg1,this.viewController.bg2],
                time,
                {alpha: from},
                {alpha: to, delay: delay || 0, onComplete: ()=>{
                    if (callback && typeof(callback) == "function")
                        callback();
                }}
            );
        };

        let speed = step.bgSpeed || 0.5;
        if (step.bgName) {
            this.viewController.hideSubBG();

            let tex = this.story.assetloader.resources[step.bgName].texture;
            let bg = (step.useBg2) ? this.viewController.bg2 : this.viewController.bg1;
            bg.alpha = 1;
            bg.tint = 0xffffff;

            if (this.preBg && this.preBg != step.bgName) {
                this.interactive = false;
                bgFade(1, 0, speed, 0, ()=>{
                    if (step.useBg2) {
                        this.viewController.loadBG2(tex);
                    } else {
                        this.viewController.loadBG1(tex);
                    }
                    bgFade(0, 1, speed, 0, ()=>{
                        this.interactive = true;
                    });
                });
            } else if (this.preBg && this.preBg == step.bgName) {
                // do nothing
            } else {
                bg.alpha = 0;
                if (step.useBg2) {
                    this.viewController.loadBG2(tex);
                } else {
                    this.viewController.loadBG1(tex);
                }
                bgFade(0, 1, speed);
            }

            this.preBg = step.bgName;
        }

        if (step.bgFade) {
            this.interactive = false;
            bgFade(1, 0, speed, 0, ()=>{
                this.interactive = true;
                if (step.blankScreen) {
                    this.blankScreen = true;
                    this.viewController.loadCurtain();
                    setTimeout(() => {
                        this.blankScreen = false;
                        this.viewController.hideCurtain();
                        this.story.element.click();
                        this.dialogController.loadDialogueAll();
                    }, step.blankScreen*1000);
                } else {
                    this.dialogController.loadDialogueAll();
                }
            });
            this.dialogController.hideDialogueAll();
            this.actorController.hideAll();
        }

        if (step.subBgName) {
            let anchors = step.subBgName.anchors || [0.5,0.5,0.5,0.5];
            let pivot = step.subBgName.pivot || [0.5,0.5];
            let pos = step.subBgName.pos || [0,0];
            this.viewController.sub.anchor.set(anchors[0], anchors[2]);
            this.viewController.sub.position.set(pos[0], pos[1]);
            this.viewController.loadSubBG(this.story.assetloader.resources[step.subBgName.name].texture);
        }

        this.dialogController.content.text = step.say || '...';
        if (step.typewriter) {}

        let nameText = (side == ACTOR_SIDE.LEFT) ? this.dialogController.name_left_text : this.dialogController.name_right_text;
        let nameTint = (step.nameColor) ? PIXI.utils.string2hex(step.nameColor) : 0xffffff;
        let [name,] = getNameAndPainting(step);
        nameText.tint = nameTint;
        nameText.text = name;
    }

    setEffects(effects) {
        for (let v of effects) {
            if (v.name) {
                gsap.delayedCall(v.delay || 0, ()=>{
                    console.warn('Unknown effect '+v);
                });
            }
        }
    }

    fadeOut(type, time, callback = ()=>{}) {
        var target = type == 1 ? this.viewController.curtain : [this.viewController.bg1,this.viewController.bg2];
        this.inFadeOut = true;

        gsap.to(target, time, {alpha: 0, onComplete: ()=>{
            if (this.inFadeOut) {
                this.stop(callback);
                this.inFadeOut = false;
            }
        }});
        
        if (this.dialogController.aside_text1.visibile)
            gsap.to(this.dialogController.aside_text1, time, {alpha: 0});
        if (this.dialogController.aside_text2.visibile)
            gsap.to(this.dialogController.aside_text2, time, {alpha: 0});

        if (this.dialogController.dialogue.visibile) {
            this.dialogController.hideDialogueAll();
            this.actorController.hideAll();
        }
    }

    flashin(step, callback = ()=>{}) {
        this.dialogController.content.text = '';
        var target = this.viewController.flash;
        this.inflasin = true;

        target.tint = (step.flashin.black) ? 0x000000 : 0xffffff;
        target.alpha = step.flashin.alpha[0];
        this.viewController.loadFlash();
        gsap.to(target, step.flashin.dur, {alpha: step.flashin.alpha[1], delay: step.flashin.delay, onComplete: ()=>{
            if (callback) callback();
            this.inflasin = false;
        }});
    }

    flashout(step, callback = ()=>{}) {
        var target = this.viewController.flash;
        this.inflashout = true;

        target.tint = (step.flashout.black) ? 0x000000 : 0xffffff;
        target.alpha = step.flashout.alpha[0];
        this.viewController.loadFlash();
        gsap.to(target, step.flashout.dur, {alpha: step.flashout.alpha[1], onComplete: ()=>{
            if (callback) callback();
            this.inflashout = false;
        }});
    }

    setFade(actor, from, to, time) {
        actor.tint = 0xffffff;

//         if (gsap.isTweening(actor))
//             gsap.killTweensOf(actor);

        this.interactive = false;
        gsap.fromTo(actor, time, {alpha: from}, {alpha: to, onComplete: ()=>{
            this.interactive = true;
        }});
    }

    paintingFadeOut(preStep, step, callback) {
        let settings = step.painting || {};
        if (preStep.side == step.side) {
            if (callback) {
                callback();
                return;
            }
        }

        //let scale = preStep.actorScale || 1;
        //let dir = (preStep.dir && preStep.dir < 0) ? -1 : 1;
        //console.log(scale, dir, dir*scale);
        let [,,fadeTarget] = this.getTargetActor(preStep.side);
        let local_x = fadeTarget.x;
        fadeTarget.visibile = true;

        let targetSide = step.paintingFadeOut.side;
        let time = step.paintingFadeOut.time;
        let [,,target] = this.getTargetActor(targetSide);

        gsap.to(fadeTarget, time, {x: target.x, onComplete: ()=>{
            if (callback) callback();
            fadeTarget.visibile = false;
            fadeTarget.x = local_x;
        }});
        this.setFade(fadeTarget, 1, settings.alpha || DEFAULT_PAINT_ALPHA, time);
    }

    getTargetActor(side) {
        let targetName, targetNameText, targetActor;
        if (side == ACTOR_SIDE.LEFT) {
            targetName = this.dialogController.name_left;
            targetNameText = this.dialogController.name_left_text;
            targetActor = this.actorController.actor_left;
        } else if (side == ACTOR_SIDE.RIGHT) {
            targetName = this.dialogController.name_right;
            targetNameText = this.dialogController.name_right_text;
            targetActor = this.actorController.actor_right;
        } else if (side == ACTOR_SIDE.CENTER) {
            targetName = this.dialogController.name_left;
            targetNameText = this.dialogController.name_left_text;
            targetActor = this.actorController.actor_middle;
        }
        return [targetName, targetNameText, targetActor];
    }
} 
