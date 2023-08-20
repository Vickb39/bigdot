import * as PIXI from 'pixi.js';

const app = new PIXI.Application({ background: '#1099bb', resizeTo: window, eventMode: 'passive' });

// @ts-expect-error
document.body.appendChild(app.view);

// create a texture from an image path
const texture = PIXI.Texture.from(`<svg width="134pt" height="188pt" viewBox="0.00 0.00 134.00 188.00" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> <g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(4 184)"> <g id="node1" class="node"> <title>A</title> <ellipse fill="white" stroke="red" cx="63" cy="-162" rx="27" ry="18"/> <text text-anchor="middle" x="63" y="-158.3" font-family="Times,serif" font-size="14.00">A</text> </g> </g> </svg>`);

// Scale mode for pixelation
// texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

// zoom out a lot
app.stage.scale.set(0.5);


const bunnies = []
bunnies.push(createBunny(0, 500));
bunnies.push(drawRoundedRectangle(400, 400));
bunnies.push(drawRoundedRectangle(400, 600));
bunnies.push(drawRoundedRectangle(800, 300));
bunnies.push(drawRoundedRectangle(800, 500));
bunnies.push(drawRoundedRectangle(800, 500));
bunnies.push(drawRoundedRectangle(800, 700));


function createBunny(x: number, y: number): PIXI.Sprite {
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
    bunny.on('pointerdown', onDragStart, bunny);

    // move the sprite to its designated position
    bunny.x = x;
    bunny.y = y;

    // add it to the stage
    app.stage.addChild(bunny);
    return bunny
}

function drawRoundedRectangle(x: number, y: number) {
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
    rect.on('pointerdown', onDragStart, rect);

    // move the sprite to its designated position
    rect.x = x;
    rect.y = y;

    app.stage.addChild(rect);


    return rect;
}


// Function to draw an arrow between two objects
function drawArrowBetweenObjects(obj1: PIXI.Sprite, obj2: PIXI.Sprite) {
    const arrow = new PIXI.Graphics();
    arrow.lineStyle(4, 0x000000); // Outline color and thickness

    const buffer = 15
    const obj1X = obj1.x + obj1.width + buffer;
    const obj1Y = obj1.y + obj1.height / 2;
    const obj2X = obj2.x - buffer;
    const obj2Y = obj2.y + obj2.height / 2;

    const angle = Math.atan2(obj2Y - obj1Y, obj2X - obj1X);
    const distance = Math.sqrt((obj2X - obj1X) ** 2 + (obj2Y - obj1Y) ** 2);

    const arrowHeadSize = 20;

    arrow.moveTo(obj1X, obj1Y);
    arrow.lineTo(obj2X, obj2Y);

    // Draw arrowhead
    arrow.lineTo(
        obj2X - arrowHeadSize * Math.cos(angle - Math.PI / 6),
        obj2Y - arrowHeadSize * Math.sin(angle - Math.PI / 6)
    );
    arrow.moveTo(obj2X, obj2Y);
    arrow.lineTo(
        obj2X - arrowHeadSize * Math.cos(angle + Math.PI / 6),
        obj2Y - arrowHeadSize * Math.sin(angle + Math.PI / 6)
    );

    app.stage.addChild(arrow);
}

// Call the function to draw an arrow between the objects
drawArrowBetweenObjects(bunnies[0], bunnies[1]);
drawArrowBetweenObjects(bunnies[0], bunnies[2]);

drawArrowBetweenObjects(bunnies[1], bunnies[3]);
drawArrowBetweenObjects(bunnies[1], bunnies[4]);

drawArrowBetweenObjects(bunnies[2], bunnies[5]);
drawArrowBetweenObjects(bunnies[2], bunnies[6]);



/** DRAG */

let dragTarget: PIXI.Sprite | null = null;
let hasUpdatedPivot = false;

app.stage.eventMode = 'static';
app.stage.hitArea = { contains: (x: number, y: number): true => true }
app.stage.on('pointerup', onDragEnd);
app.stage.on('pointerupoutside', onDragEnd);

function onDragMove(event: PIXI.FederatedPointerEvent): void {
    if (dragTarget && dragTarget.parent) {
        if (!hasUpdatedPivot) {
            const localPosition = dragTarget.toLocal(event.global);
            dragTarget.pivot.set(localPosition.x, localPosition.y);
            hasUpdatedPivot = true
        }
        dragTarget.parent.toLocal(event.global, undefined, dragTarget.position);
    }
}

function onDragStart(event: PIXI.FederatedPointerEvent): void {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // this.data = event.data;
    dragTarget = null;
    const bunny = this as PIXI.Sprite;

    bunny.alpha = 0.5;
    dragTarget = bunny;
    app.stage.on('pointermove', onDragMove);
}

function onDragEnd(event: PIXI.FederatedPointerEvent): void {
    if (dragTarget) {
        app.stage.off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        dragTarget = null;
        hasUpdatedPivot = false;
    }
}

/** ZOOM + PAN */
// Add a mouse wheel event listener to the canvas
app.stage.on('wheel', (event: PIXI.FederatedWheelEvent) => {
    // Prevent the default scrolling behavior on the canvas
    event.preventDefault();
    const container = app.stage;
    const { x, y } = container.position;
    const zoomLevel = container.scale.x

    if (!event.ctrlKey) {
        const [newX, newY] = [x + event.deltaX * -1, y + event.deltaY * -1]
        app.stage.setTransform(newX, newY, zoomLevel, zoomLevel)
    } else {
        const cursorX = event.clientX;
        const cursorY = event.clientY;

        // Calculate zoom direction and amount
        const zoomAmount = event.deltaY * -0.01;

        // Calculate zoom factor based on cursor position
        const newZoomLevel = Math.min(10, Math.max(0.1, zoomLevel + (zoomAmount)));
        const zoomFactor = newZoomLevel / zoomLevel;

        // Calculate new container position to zoom around the cursor
        const xDiff = cursorX - x;
        const yDiff = cursorY - y;
        const newX = cursorX - xDiff * zoomFactor;
        const newY = cursorY - yDiff * zoomFactor;

        // Apply zoom and position changes
        container.setTransform(newX, newY, newZoomLevel, newZoomLevel)

    }
});

// Stop pinch gesture events from minimizing the tab on safari.
// https://stackoverflow.com/a/39711930
// @ts-expect-error
document.addEventListener('gesturestart', (event: WheelEvent) => {
    event.preventDefault();
    event.stopImmediatePropagation();
})













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