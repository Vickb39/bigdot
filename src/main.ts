import * as PIXI from 'pixi.js';
import createArrow from 'util/createArrow';
import createBunny from 'util/createBunny';
import createRect from 'util/createRect';
import app from 'app'
import enableDragOnApp from 'traits/drag';
import enableZoomAndPan from 'traits/zoomAndPan';

// @ts-expect-error
document.body.appendChild(app.view);

// Scale mode for pixelation
// texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

// zoom out a lot
app.stage.scale.set(0.5);


const bunnies = [
    createBunny(0, 500),
    createRect(400, 400),
    createRect(400, 600),
    createRect(800, 300),
    createRect(800, 500),
    createRect(800, 500),
    createRect(800, 700),
]

// for loop over bunnies and add them to the stage
for (let i = 0; i < bunnies.length; i++) {
    app.stage.addChild(bunnies[i]);
}


// Call the function to draw an arrow between the objects
app.stage.addChild(createArrow(bunnies[0], bunnies[1]));
app.stage.addChild(createArrow(bunnies[0], bunnies[2]));

app.stage.addChild(createArrow(bunnies[1], bunnies[3]));
app.stage.addChild(createArrow(bunnies[1], bunnies[4]));

app.stage.addChild(createArrow(bunnies[2], bunnies[5]));
app.stage.addChild(createArrow(bunnies[2], bunnies[6]));




enableDragOnApp(app)
enableZoomAndPan(app)








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