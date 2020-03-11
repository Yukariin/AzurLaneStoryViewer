import * as PIXI from 'pixi.js';

let _getFilter = (target, type) => {
    let filterClass;
    let filters;
    let i;
    let filter;

    filterClass = PIXI.filters[type];
    filters = target.filters || [];
    i = filters.length;

    if (!filterClass) {
        console.warn(type + " not found.");
    }

    while (--i > -1) {
        if (filters[i] instanceof filterClass) {
            return filters[i];
        }
    }

    filter = new filterClass();
    if (type === "BlurFilter") {
        filter.blur = 0;
    }
    filters.push(filter);
    target.filters = filters;
    return filter;
};

let _parseColorMatrixFilter = (target, v, pg) => {
    let filter;
    let cache;
    let combine;
    let i;
    let matrix;
    let startMatrix;

    const idMatrix = [
        1,0,0,0,
        0,0,1,0,
        0,0,0,0,
        1,0,0,0,
        0,0,1,0
    ];

    const CMFdefaults = {
        contrast:1,
        saturation:1,
        colorizeAmount:0,
        colorize:'rgb(255,255,255)',
        hue:0,
        brightness:1
    };

    filter = _getFilter(target, 'ColorMatrixFilter');
    cache = target._gsColorMatrixFilter = target._gsColorMatrixFilter || Object.assign({}, CMFdefaults);
    combine = v.combineCMF && !("colorMatrixFilter" in v && !v.colorMatrixFilter);
    startMatrix = filter.matrix;
    
    if (v.resolution) {
        filter.resolution = v.resolution;
    }
    if (v.matrix && v.matrix.length === startMatrix.length) {
        matrix = v.matrix;
        if (cache.contrast !== 1) {
            _addColorMatrixFilterCacheTween('contrast', pg, cache, CMFdefaults);
        }
        if (cache.hue) {
            _addColorMatrixFilterCacheTween('hue', pg, cache, CMFdefaults);
        }
        if (cache.brightness !== 1) {
            _addColorMatrixFilterCacheTween('brightness', pg, cache, CMFdefaults);
        }
        if (cache.colorizeAmount) {
            _addColorMatrixFilterCacheTween('colorize', pg, cache, CMFdefaults);
            _addColorMatrixFilterCacheTween('colorizeAmount', pg, cache, CMFdefaults);
        }
        if (cache.saturation !== 1) {
            _addColorMatrixFilterCacheTween('saturation', pg, cache, CMFdefaults);
        }
    } else {
        matrix = idMatrix.slice();
        if (v.brightness != null) {
            matrix = _applyBrightnessToMatrix(+v.brightness, matrix);
            _addColorMatrixFilterCacheTween("brightness", pg, cache, v);
        } else if (cache.brightness !== 1) {
            if (combine) {
                matrix = _applyBrightnessToMatrix(cache.brightness, matrix);
            } else {
                _addColorMatrixFilterCacheTween("brightness", pg, cache, CMFdefaults);
            }
        }
    }
    
    i = matrix.length;
    while (--i > -1) {
        if (matrix[i] !== startMatrix[i]) {
            pg.add(startMatrix, i, startMatrix[i], matrix[i], 'colorMatrixFilter');
        }
    }
    
    pg._props.push('colorMatrixFilter');
};

let _addColorMatrixFilterCacheTween = (p, pg, cache, vars) => {
    pg.add(cache, p, cache[p], vars[p]);
    pg._props.push(p);
};

let _applyBrightnessToMatrix = (brightness, matrix) => {
    let temp = new PIXI.filters.ColorMatrixFilter();
    temp.matrix = matrix;
    temp.brightness(brightness, true);
    return temp.matrix;
};

export const PixiPlugin = {
    name: 'pixi',
    version: '0.0.1',
    init(target, values, tween, index, targets) {
        let p;

        const colorMatrixFilterProps = {
            colorMatrixFilter:1,
            saturation:1,
            contrast:1,
            hue:1,
            colorize:1,
            colorizeAmount:1,
            brightness:1,
            combineCMF:1
        };

        let context;
        let value;
        let colorMatrix;
        for (p in values) {
            value = values[p];
            console.log(value);

            if (colorMatrixFilterProps[p]) {
                if (!colorMatrix) {
                    _parseColorMatrixFilter(target, values.colorMatrixFilter || values, this);
                    colorMatrix = true;
                }
            }

            this._props.push(p);
        }
    }
};

export { PixiPlugin as default };
