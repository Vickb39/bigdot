import * as PIXI from 'pixi.js';
import app from 'app'

let dragTarget: PIXI.DisplayObject | null = null;
let hasUpdatedPivot = false;

export default function enableDragOnApp(app: PIXI.Application): void {
    app.stage.eventMode = 'static';
    app.stage.hitArea = { contains: (x: number, y: number): true => true }
    app.stage.on('pointerup', onDragEnd);
    app.stage.on('pointerupoutside', onDragEnd);
}

export function enableDragOnObject(object: PIXI.DisplayObject): void {
    object.on('pointerdown', onDragStart, object);
}

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
    const bunny = this as PIXI.DisplayObject;

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