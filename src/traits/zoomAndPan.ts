import * as PIXI from 'pixi.js';

export default function enableZoomAndPan(app: PIXI.Application): void {
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
        event.stopImmediatePropagation();
        event.preventDefault();
    })

}
