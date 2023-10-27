import app from 'app';
import * as PIXI from 'pixi.js';

export default function drawPath(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): PIXI.Container {
    const g = new PIXI.Graphics();
    g.lineStyle(2, 0xffffff);
    g.moveTo(x1, y1)
    g.bezierCurveTo(
        x2, y2,
        x3, y3,
        x4, y4,
    )
    app.stage.addChild(g)

    return g;
}

