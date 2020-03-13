import * as PIXI from 'pixi.js';

import StageController from './StageController';
import StoryConfig from './StoryConfig';
import { getNameAndPainting } from './utils';

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 540;

let instance = null;

export default class Story {
    constructor(element) {
        if (!instance) {
            PIXI.settings.RENDER_OPTIONS.antialias = true;
            this.app = new PIXI.Application({width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT});
            this.element = element;
            this.element.appendChild(this.app.view);
            this.app.view.id = 'story-canvas';
            this.app.stage.sortableChildren = true;

            this.assetloader = new PIXI.Loader();
            this.assetloader.add('storyui', 'images/storyui.json')

            this.stageController = null;

            this.locale = 'jp';
            this.element.querySelector('#locale-jp').onclick = ()=>{ this.locale = 'jp'; };
            this.element.querySelector('#locale-cn').onclick = ()=>{ this.locale = 'cn'; };
            this.element.querySelector('#locale-en').onclick = ()=>{ this.locale = 'en'; };

            let select = this.element.querySelector('#story-select');
            for (let val in StoryConfig) {
                let opt = document.createElement('option');
                opt.value = StoryConfig[val];
                opt.innerHTML = val;
                select.appendChild(opt);
            }
            select.onchange = (e)=>{
                this.load(e.target.value, this.locale);
            };

            instance = this;
        }

        return instance;
    }

    load(storyID, locale) {
        this.assetloader.add(storyID, `story/${locale}/${storyID}.json`)
        this.assetloader.load((loader, resources) => {
            let story = resources[storyID].data;

            story.scripts.forEach((step) => {
                if (step.bgName && !(step.bgName in resources)) {
                    this.assetloader.add(step.bgName, `images/bg/${step.bgName}.png`);
                }
                if (step.subBgName && !(step.subBgName in resources)) {
                    this.assetloader.add(step.subBgName.name, `images/bg/${step.subBgName.name}.png`);
                }

                if ((step.mode || story.mode) == 2 && step.actor && !step.withoutPainting) {
                    let [,actorName] = getNameAndPainting(step);
                    if (!(actorName in resources)) {
                        this.assetloader.add(actorName, `images/painting/${actorName}.png`);
                    }
                }
            });

            this.assetloader.load(this.loadComplete.bind(this, storyID))

            this.assetloader.onProgress.add((loader, resource) => {
                console.log(`load progress: ${loader.progress}%`);
            });
        });
    }

    loadComplete(storyID) {
        this.stageController = new StageController(this)
        this.stageController.load();
        this.stageController.play(this.assetloader.resources[storyID].data);

        this.app.ticker.start();
    }
}
