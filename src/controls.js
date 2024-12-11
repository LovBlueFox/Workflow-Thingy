class Controls {
    keybinds;
    mouse;

    shift = false;
    control = false;
    alt = false;

    constructor() {
        this.keybinds = [
            {
                keys: ['escape'],
                action: 'close'
            },
            {
                keys: ['control', 'a'],
                action: 'selectAll',
                canvas: true
            },
            {
                keys: ['control', 'z'],
                action: 'undo',
                canvas: true
            },
            {
                keys: ['control', 'r'],
                action: 'redo',
                canvas: true
            },
            {
                keys: ['delete'],
                action: 'delete',
                canvas: true
            },
            {
                keys: ['tab'],
                action: 'toggleConsole'
            },
            {
                keys: ['p'],
                action: 'togglePen',
                canvas: true,
            },
            {
                keys: ['['],
                action: 'brush-decrease',
                canvas: true,
                drawing: true
            },
            {
                keys: [']'],
                action: 'brush-increase',
                canvas: true,
                drawing: true
            },
            {
                keys: ['f5'],
                action: 'refresh'
            }
        ];

        this.mouse = {
            x: 0,
            y: 0,
        }
    }

    keydown(event) {
        const pressedKeys = new Set();
        if (event.ctrlKey) pressedKeys.add('control');
        if (event.shiftKey) pressedKeys.add('shift');
        if (event.altKey) pressedKeys.add('alt');
        pressedKeys.add(event.key.toLowerCase());

        this.shift = event.shiftKey;
        this.control = event.ctrlKey;
        this.alt = event.altKey;

        for (const keybind of this.keybinds) {
            if (keybind.canvas && consoleInstance.open) continue;

            const keybindKeys = new Set(keybind.keys);
            if (pressedKeys.size === keybindKeys.size && [...pressedKeys].every(key => keybindKeys.has(key))) {

                //if overlay is open, don't allow keybinds
                if (document.getElementById('overlay').style.display === 'block') {
                    return;
                }

                // if (!drawing.active && !keybind.drawing) {
                //     return;
                // }

                event.preventDefault();
                this.executeAction(keybind.action);
                break;
            }
        }
    }

    keyup(event) {
        this.shift = event.shiftKey;
        this.control = event.ctrlKey;
        this.alt = event.altKey;
    }

    wheel(event) {
        canvas.zoom(event.deltaY * -0.005, event.clientX, event.clientY);
    }

    executeAction(action) {
        switch (action) {
            case 'selectAll':
                console.log('Select All Nodes');
                break;
            case 'undo':
                workflow.undo();
                break;
            case 'redo':
                workflow.redo();
                break;
            case 'delete':
                console.log('Remove Node');
                break;
            case 'close':
                if (consoleInstance.open) {
                    consoleInstance.toggleConsole();
                    break;
                }
                console.log('Close');
                break;
            case 'unselectNodes':
                console.log('Unselect Nodes');
                break;
            case 'toggleConsole':
                consoleInstance.toggleConsole()
                break;
            case 'togglePen':
                drawing.togglePen();
                break;
            case 'brush-decrease':
                drawing.decreaseBrush();
                break;
            case 'brush-increase':
                drawing.increaseBrush();
                break;
            case 'refresh':
                location.reload();
                break;
        }
    }

    mousemove(event) {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;

        const { rx, ry } = canvas.getRelativePosition(event.clientX, event.clientY);

        this.mouse.rx = rx;
        this.mouse.ry = ry;

        const { cx, cy }  = canvas.convertMouseToCanvasCoordinates(event.clientX, event.clientY);

        this.mouse.cx = cx;
        this.mouse.cy = cy;

        if (event.buttons === 1) {
            drawing.move(event.movementX, event.movementY, {
                shift: this.shift,
                control: this.control,
                alt: this.alt
            });
        }

        if (event.buttons === 4) {
            canvas.move(event.movementX, event.movementY);
        }
    }

    mousedown(event) {
        const { rx, ry } = canvas.getRelativePosition(event.clientX, event.clientY);
        const { cx, cy }  = canvas.convertMouseToCanvasCoordinates(event.clientX, event.clientY);
        if (event.button === 2) {
            canvas.pingLocation(cx, cy);
        }
        if (event.button === 0) {
            this.mouse.startX = rx;
            this.mouse.startY = ry;

            if (drawing.active)
                drawing.startingPoint({
                    shift: this.shift,
                    control: this.control,
                    alt: this.alt
                });
        }
    }

    eventListeners() {
        document.addEventListener('keydown', this.keydown.bind(this));
        document.addEventListener('keyup', this.keyup.bind(this));
        canvas.canvas.addEventListener('wheel', this.wheel.bind(this));
        canvas.canvas.addEventListener('mousemove', this.mousemove.bind(this));
        canvas.canvas.addEventListener('mousedown', this.mousedown.bind(this));
    }
}
