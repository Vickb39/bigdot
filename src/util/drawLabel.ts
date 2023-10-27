import * as PIXI from 'pixi.js';
import app from "app";

export default function drawLabel(text: string, point: number[]) {
    const textObj = new PIXI.Text(text, {
        fontSize: 14,
        fill: 0, // Default text color
    });
    textObj.anchor.set(0.5); // Center the text
    textObj.position.set(point[0], point[1]);

    app.stage.addChild(textObj);
}
