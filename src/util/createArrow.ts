import * as PIXI from 'pixi.js';

interface Arrowable {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Function to draw an arrow between two objects
export default function createArrow(obj1: Arrowable, obj2: Arrowable) {
    const arrow = new PIXI.Graphics();
    arrow.lineStyle(4, 0x00000); // Outline color and thickness

    const obj1CenterX = obj1.x + obj1.width / 2;
    const obj1CenterY = obj1.y + obj1.height / 2;
    const obj2CenterX = obj2.x + obj2.width / 2;
    const obj2CenterY = obj2.y + obj2.height / 2;

    const angle = Math.atan2(obj2CenterY - obj1CenterY, obj2CenterX - obj1CenterX);

    let fromX: number
    let fromY: number
    let toX: number
    let toY: number

    const buffer = 15;
    const slope = (obj2CenterY - obj1CenterY) / (obj2CenterX - obj1CenterX);
    const yintercept = obj1CenterY - slope * obj1CenterX;

    if (angle === Math.PI / 2) {
        fromX = obj1CenterX;
        toX = obj2CenterX
        fromY = obj1.y + obj1.height + buffer;
        toY = obj2.y - buffer;
    } else if (angle === -Math.PI / 2) {
        fromX = obj1CenterX;
        toX = obj2CenterX
        fromY = obj1.y - buffer;
        toY = obj2.y + obj2.height + buffer;
    } else if (angle >= 0 && angle < Math.PI / 2) {
        fromX = obj1.x + obj1.width + buffer;
        fromY = slope * fromX + yintercept;
        toX = obj2.x - buffer;
        toY = slope * toX + yintercept;
    } else if (angle > Math.PI / 2 && angle <= Math.PI) {
        fromX = obj1.x - buffer;
        fromY = slope * fromX + yintercept;
        toX = obj2.x + obj2.width + buffer;
        toY = slope * toX + yintercept;
    } else if (angle < -Math.PI / 2 && angle >= -Math.PI) {
        fromX = obj1.x - buffer;
        fromY = slope * fromX + yintercept;
        toX = obj2.x + obj2.width + buffer;
        toY = slope * toX + yintercept;
    } else if (angle < 0 && angle > -Math.PI / 2) {
        fromX = obj1.x + obj1.width + buffer;
        fromY = slope * fromX + yintercept;
        toX = obj2.x - buffer;
        toY = slope * toX + yintercept;
    } else {
        throw new Error('Angle not accounted for');
    }




    const arrowHeadSize = 20;

    arrow.moveTo(fromX, fromY);
    arrow.lineTo(toX, toY);

    // Draw arrowhead
    arrow.lineTo(
        toX - arrowHeadSize * Math.cos(angle - Math.PI / 6),
        toY - arrowHeadSize * Math.sin(angle - Math.PI / 6)
    );
    arrow.moveTo(toX, toY);
    arrow.lineTo(
        toX - arrowHeadSize * Math.cos(angle + Math.PI / 6),
        toY - arrowHeadSize * Math.sin(angle + Math.PI / 6)
    );

    return arrow;
}