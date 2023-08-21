import * as PIXI from 'pixi.js';
import { enableDragOnObject } from 'traits/drag';

export default function createRect(x: number, y: number): PIXI.Graphics {
    const rect = new PIXI.Graphics();

    rect.beginFill(0xFFFFFF)
    rect.drawRoundedRect(0, 0, 200, 100, 30);
    rect.endFill();

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    rect.eventMode = 'static';

    // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    rect.cursor = 'pointer';

    // setup events for mouse + touch using
    // the pointer events
    // rect.on('pointerdown', onDragStart, rect);

    // move the sprite to its designated position
    rect.x = x;
    rect.y = y;

    enableDragOnObject(rect)

    return rect;
}

