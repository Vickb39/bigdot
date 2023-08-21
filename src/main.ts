import * as PIXI from 'pixi.js';
import createArrow from 'util/createArrow';
import createBunny from 'util/createBunny';
import createRect from 'util/createRect';
import app from 'app'
import enableDragOnApp from 'traits/drag';
import enableZoomAndPan from 'traits/zoomAndPan';

enableDragOnApp(app)
enableZoomAndPan(app)


// @ts-expect-error
document.body.appendChild(app.view);

// Scale mode for pixelation
// texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

// zoom out a lot
app.stage.scale.set(0.5);


const rects = [
    createRect(600, 600),

    createRect(600, 800),
    createRect(900, 600),
    createRect(300, 600),
    createRect(600, 400),

    createRect(900, 800),
    createRect(900, 400),
    createRect(300, 800),
    createRect(300, 400),

]

const arrows = [
    createArrow(rects[0], rects[1]),
    createArrow(rects[0], rects[2]),
    createArrow(rects[0], rects[3]),
    createArrow(rects[0], rects[4]),

    createArrow(rects[0], rects[5]),
    createArrow(rects[0], rects[6]),
    createArrow(rects[0], rects[7]),
    createArrow(rects[0], rects[8]),

]

// for loop over rects and add them to the stage
for (let i = 0; i < rects.length; i++) {
    app.stage.addChild(rects[i]);
}
for (let i = 0; i < arrows.length; i++) {
    app.stage.addChild(arrows[i]);
}










/** Text performance checks */

// function createText() {

//     const text = new PIXI.Text('Hello', {
//         fontSize: 36,
//         fill: 0xffffff,
//     });

//     // Generate random positions for the text
//     const randomX = Math.random() * (app.screen.width - text.width) * 10;
//     const randomY = Math.random() * (app.screen.height - text.height) * 10;

//     // Set the text's position
//     text.x = randomX;
//     text.y = randomY;

//     // Add the text to the stage
//     app.stage.addChild(text);
// }


// for (let i = 0; i < 1000; i++) {
//     createText()
// }