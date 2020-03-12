import SkinConfig from './SkinConfig';

export function getNameAndPainting(step) {
    let name = '';
    let painting = '';
    let actor = step.actor;
    console.log(actor);

    if (!actor) {
        // do nothing
    } else if (actor > 0) {
        if (SkinConfig[actor]) {
            name = SkinConfig[actor].name;
            painting = SkinConfig[actor].painting;
        } else {
            name = "？？？？？";
            painting = "unknown1";
        }
    } else if (actor == 0) {
        name = '指揮官';
        painting = 'unknown';
    } else if (actor == -1) {
    }

    if (step.actorName)
        name = step.actorName;

    return [name, painting];
}
