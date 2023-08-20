// Initialize Pixi.js
const app = new PIXI.Application({ background: '#1099bb', resizeTo: window });


// Add the canvas to the DOM
document.body.appendChild(app.view);


// Your application code goes here
// For example, you can create sprites, graphics, etc.

// create a texture from an image path
const texture = PIXI.Texture.from('https://pixijs.com/assets/bunny.png');

// Scale mode for pixelation
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

for (let i = 0; i < 10; i++) {
    createBunny(
        Math.floor(Math.random() * app.screen.width),
        Math.floor(Math.random() * app.screen.height),
    );
}

function createBunny(x, y) {
    // create our little bunny friend..
    const bunny = new PIXI.Sprite(texture);

    // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
    bunny.interactive = true;

    // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
    bunny.cursor = 'pointer';

    // center the bunny's anchor point
    bunny.anchor.set(0.5);

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
}

let dragTarget = null;

app.stage.interactive = true;
app.stage.hitArea = app.screen;
app.stage.on('pointerup', onDragEnd);
app.stage.on('pointerupoutside', onDragEnd);

function onDragMove(event) {
    if (dragTarget) {
        dragTarget.parent.toLocal(event.global, null, dragTarget.position);
    }
}

function onDragStart() {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // this.data = event.data;
    this.alpha = 0.5;
    dragTarget = this;
    app.stage.on('pointermove', onDragMove);
}

function onDragEnd() {
    if (dragTarget) {
        app.stage.off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        dragTarget = null;
    }
}



// Set the initial scale and the scale factor for zooming
let currentScale = 1;
const scaleFactor = 0.05; // Adjust this value to control the zoom speed

// Function to handle the wheel event
function handleWheel(event) {
    event.preventDefault();

    const delta = Math.sign(event.deltaY); // Get the scroll direction (1 for zoom in, -1 for zoom out)

    // Calculate the new scale based on the scroll direction
    const newScale = currentScale + delta * scaleFactor;

    // Clamp the scale to avoid extreme zoom levels
    currentScale = Math.max(0.5, Math.min(newScale, 2));

    // Apply the new scale to the stage
    app.stage.scale.set(currentScale);
}

// Listen for the wheel event on the canvas
app.view.addEventListener('wheel', handleWheel);


// Render the stage
app.ticker.add(() => {
    // Your game loop code goes here
    // For example, you can update sprite positions, animations, etc.
});
