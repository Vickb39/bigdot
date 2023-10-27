import app from 'app';
import * as PIXI from 'pixi.js';

type ValueOf<T> = T[keyof T];


export default function getOperation(char: keyof typeof mapping): ValueOf<typeof mapping> {
    return mapping[char]
}

const mapping = {
    'c': setPenColor,
    'e': drawUnfilledEllipse,
    'F': setFont,
    'T': drawText,
    'b': drawBSpline,
    'S': setStyleAttribute,
    'C': setFillColor,
    'P': drawFilledPolygon,
}

type Context = any;

function resetContext(c: Context) {
    for (let key in c) {
        if (c.hasOwnProperty(key)) {
            delete c[key];
        }
    }
}

function setPenColor(c: Context, options: { op: 'c', grad: 'none', color: string }) {
    c[options.op] = options
}

function setFont(c: Context, options: { op: 'F', size: number, face: string }) {
    c[options.op] = options
}

function setStyleAttribute(c: Context, options: { op: 'S', style: string }) {
    c[options.op] = options
}

function setFillColor(c: Context, options: { op: 'C', grad: 'none', color: string }) {
    c[options.op] = options
}

function drawBSpline(c: Context, options: { op: 'b', points: number[][] }) {
    assert(c.hasOwnProperty('c'), 'drawBSpline: must set pen color before drawing spline')
    assert(options.points.length >= 4, 'drawBSpline: must have at least 4 points to draw spline')

    const g = new PIXI.Graphics();
    g.lineStyle(1, c['c'].color)
    g.moveTo(options.points[0][0], options.points[0][1])
    g.bezierCurveTo(
        options.points[1][0], options.points[1][1],
        options.points[2][0], options.points[2][1],
        options.points[3][0], options.points[3][1],
    )
    app.stage.addChild(g)
    resetContext(c)
    return g;
}

function drawFilledPolygon(c: Context, options: { op: 'P', points: number[][] }) {
    // assert(c.hasOwnProperty('S'), 'drawFilledPolygon: must set style before drawing polygon')
    assert(c.hasOwnProperty('c'), 'drawFilledPolygon: must set pen color before drawing polygon')
    assert(c.hasOwnProperty('C'), 'drawFilledPolygon: must set fill color before drawing polygon')

    const g = new PIXI.Graphics();
    g.lineStyle(1, c['c'].color)
    g.beginFill(c['C'].color)
    g.drawPolygon(options.points.reduce((acc, val) => acc.concat(val), []));

    g.endFill();

    app.stage.addChild(g)
    resetContext(c)
    return g;
}

function drawUnfilledEllipse(c: Context, options: { op: 'e', rect: number[] }): PIXI.Graphics {
    assert(options.rect.length === 4, 'unfilledEllipse: rect must be an array of 4 numbers')
    const [x, y, width, height] = options.rect;
    const g = new PIXI.Graphics();
    if (c['c']) {
        g.lineStyle(1, c['c'].color)
    }
    g.beginFill(0xFFFFFF)
    g.drawEllipse(x, y, width, height)
    g.endFill();

    app.stage.addChild(g)
    resetContext(c)
    return g;
}


function drawText(c: Context, options: { op: 'T', pt: number[], align: string, width: number, text: string }): PIXI.Text {
    assert(c.hasOwnProperty('c'), 'text: must set color before drawing text')
    assert(c.hasOwnProperty('F'), 'text: must set font before drawing text')
    assert(options.pt.length === 2, 'text: pt must be an array of 2 numbers')

    const textObj = new PIXI.Text(options.text, {
        fontSize: c['F'].size,
        fill: c['c'].color, // Default text color
    });

    if (options.align === 'c') {
        textObj.anchor.set(0.5); // Center the text
    }
    textObj.position.set(options.pt[0], options.pt[1]);

    app.stage.addChild(textObj);
    resetContext(c)
    return textObj;
}


class AssertionError extends Error {
    constructor(msg?: string) {
        super(msg);
    }
}

function assert(condition: any, msg?: string): asserts condition {
    if (!condition) {
        throw new AssertionError(msg);
    }
}