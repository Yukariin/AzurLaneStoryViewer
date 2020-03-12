import { Application, Loader } from 'pixi.js';

import StageController from './StageController';
import { getNameAndPainting } from './utils';

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 540;

let instance = null;

export default class Story {
    constructor(element) {
        if (!instance) {
            this.app = new Application({width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT});
            this.element = element;
            this.element.appendChild(this.app.view);
            this.app.view.id = 'story-canvas';
            this.app.stage.sortableChildren = true;

            this.overlay = document.getElementById('story-overlay');

            this.assetloader = new Loader();
            this.assetloader.add('storyui', 'images/storyui.json')

            this.stageController = null;

            this.load();

            instance = this;
        }

        return instance;
    }

    load() {
        this.assetloader.add('story', 'story/S004.json'); // TODO: dinamyc loading
        this.assetloader.load((loader, resources) => {
            let story = resources['story'].data;

            let loaded = [];
            story.scripts.forEach((step) => {
                if (step.bgName && !loaded.includes(step.bgName)) {
                    this.assetloader.add(step.bgName, `images/bg/${step.bgName}.png`);
                    loaded.push(step.bgName);
                }
                if (step.subBgName && !loaded.includes(step.subBgName)) {
                    this.assetloader.add(step.subBgName.name, `images/bg/${step.subBgName.name}.png`);
                    loaded.push(step.subBgName);
                }

                if ((step.mode || story.mode) == 2 && step.actor && !step.withoutPainting) {
                    let [,actorName] = getNameAndPainting(step);
                    if (!loaded.includes(actorName)) {
                        this.assetloader.add(actorName, `images/painting/${actorName}.png`);
                        loaded.push(actorName);
                    }
                }
            });

            this.assetloader.load(this.loadComplete.bind(this))

            this.assetloader.onProgress.add((loader, resource) => {
                console.log(`load progress: ${loader.progress}%`);
            });
        });
    }

    loadComplete() {
        this.stageController = new StageController(this)
        this.stageController.load();
        this.stageController.play(this.assetloader.resources['story'].data);

        this.app.ticker.start();
    }
}
