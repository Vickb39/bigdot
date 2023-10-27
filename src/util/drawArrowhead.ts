import * as PIXI from 'pixi.js';
import app from "app";

export default function drawArrowhead(points: number[][]) {
    const g = new PIXI.Graphics();
    g.beginFill(16777215);
    g.drawPolygon(
        points[0][0], points[0][1],
        points[1][0], points[1][1],
        points[2][0], points[2][1]
    );
    g.endFill();
    app.stage.addChild(g);
}
