import SkinConfig from './SkinConfig';

export function getNameAndPainting(step) {
    let name = '';
    let painting = '';
    let actor = step.actor;
    console.log(actor);

    if (!actor) {
        // do nothing
    } else if (actor > 0) {
        name = SkinConfig[actor].name;
        painting = SkinConfig[actor].painting;
    } else if (actor == 0) {
        name = '指揮官';
        painting = 'unknown';
    } else if (actor == -1) {
    }

    if (step.actorName)
        name = step.actorName;

    return [name, painting];
}

export function hsv2rgb(h, s, v) {
    var r, g, b, i, f, p, q, t;
    
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    
    return [ r * 255, g * 255, b * 255 ];
}
