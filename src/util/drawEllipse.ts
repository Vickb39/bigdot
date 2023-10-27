import app from 'app';
import * as PIXI from 'pixi.js';
import { enableDragOnObject } from 'traits/drag';

export default function drawEllipse(x: number, y: number, width: number, height: number): PIXI.Container {
    const ellipse = new PIXI.Ellipse(x, y, width, height);

    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFFFFF)
    graphics.drawEllipse(0, 0, ellipse.width, ellipse.height)
    graphics.endFill();

    // enable the ellipse to be interactive... this will allow it to respond to mouse and touch events
    container.eventMode = 'static';
    container.cursor = 'pointer';
    graphics.eventMode = 'static';
    graphics.cursor = 'pointer';
    enableDragOnObject(container)

    container.addChild(graphics);

    app.stage.addChild(container);

    return container;
}

