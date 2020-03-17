import NameCode from './NameCode';
import SkinConfig from './SkinConfig';

export function getName(desc, code) {
    return (desc || '').replace(/{namecode:(\d+)}/, (match, id) => {
        let config = NameCode[id];
        if (config)
            return (code) ? config.code : config.name;
    });
}

export function getNameAndPainting(step) {
    let name = '';
    let painting = '';
    let actor = step.actor;

    if (typeof actor === 'undefined') {
        // do nothing
    } else if (actor > 0) {
        name = SkinConfig[actor].name;
        painting = SkinConfig[actor].painting;
    } else if (actor == 0) {
        name = '指揮官';
        painting = 'unknown';
    } else if (actor == -1) {
        // secretary name?
        // secretary painting?
    }

    if (step.actorName)
        name = getName(step.actorName);

    return [name, painting];
}
