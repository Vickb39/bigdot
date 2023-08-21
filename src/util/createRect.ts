import app from 'app';
import * as PIXI from 'pixi.js';
import { enableDragOnObject } from 'traits/drag';

export default function createRect(x: number, y: number, text: string): PIXI.Container {
    const container = new PIXI.Container();

    const rect = new PIXI.Graphics();

    rect.beginFill(0xFFFFFF)
    rect.drawRoundedRect(0, 0, 200, 100, 30);
    rect.endFill();

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    container.eventMode = 'static';
    container.cursor = 'pointer';
    rect.eventMode = 'static';
    rect.cursor = 'pointer';
    enableDragOnObject(container)


    container.x = x;
    container.y = y;

    // Create the text
    const textObj = new PIXI.Text(text, {
        fontSize: 16, // Default font size
        fill: 0x000000, // Default text color
    });
    textObj.anchor.set(0.5); // Center the text
    textObj.position.set(rect.width / 2, rect.height / 2);

    container.addChild(rect);
    container.addChild(textObj);
    app.stage.addChild(container);


    return container;
}

