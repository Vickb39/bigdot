import * as PIXI from 'pixi.js';

export default function createBunny(x: number, y: number): PIXI.Sprite {
    const texture = PIXI.Texture.from(`<svg width="134pt" height="188pt" viewBox="0.00 0.00 134.00 188.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(4 184)"> <g id="node1" class="node"> <title>A</title> <ellipse fill="white" stroke="red" cx="63" cy="-162" rx="27" ry="18"/> <text text-anchor="middle" x="63" y="-158.3" font-family="Times,serif" font-size="14.00">A</text> </g> </g> </svg>`);

    // create our little bunny friend..
    const bunny = new PIXI.Sprite(texture);

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    bunny.eventMode = 'static';

    // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    bunny.cursor = 'pointer';

    // center the bunny's anchor point
    // bunny.anchor.set(0.5);

    // make it a bit bigger, so it's easier to grab
    bunny.scale.set(3);

    // setup events for mouse + touch using
    // the pointer events
    // bunny.on('pointerdown', onDragStart, bunny);

    // move the sprite to its designated position
    bunny.x = x;
    bunny.y = y;

    // add it to the stage
    return bunny
}
