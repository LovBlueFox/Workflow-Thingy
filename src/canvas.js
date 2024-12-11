class Canvas {
    canvas;
    ctx;
    position;
    performance;
    zoomSpeed;
    pings = [];

    constructor() {
        this.canvas = document.getElementById('workflow-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.zoomSpeed = 1;

        this.performance = {
            frameCount: 0,
            lastFrameTime: 0,
            fps: 0,
            history: []
        };


        this.position = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            z: 1
        }

        this.goTo(
            parseFloat(getCookie('canvas-x')) || 0,
            parseFloat(getCookie('canvas-y')) || 0,
            parseFloat(getCookie('canvas-z')) || 5,
            false, false
        );

        window.addEventListener('resize', () => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            this.position.x += centerX - this.canvas.width / 2;
            this.position.y += centerY - this.canvas.height / 2;

            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        this.drawCenterLines = this.drawCenterLines.bind(this); // Bind the method
        this.update = this.update.bind(this); // Bind the update method
        requestAnimationFrame(this.update);
    }

    update() {
        let now = performance.now();
        this.performance.frameCount++;
        if (now - this.performance.lastFrameTime >= 1000) {
            this.performance.fps = this.performance.frameCount;
            this.performance.frameCount = 0;
            this.performance.lastFrameTime = now;
            this.performance.history.push({
                timestamp: new Date().toISOString(),
                fps: this.performance.fps
            });

            const frameRateBox = document.getElementById('frame-rate-box');
            frameRateBox.textContent = `FPS: ${this.performance.fps}`;

            if (this.performance.fps === 0) {
                frameRateBox.style.color = 'purple';
            } else if (this.performance.fps < 15) {
                frameRateBox.style.color = 'red';
            } else if (this.performance.fps < 30) {
                frameRateBox.style.color = 'orange';
            } else {
                frameRateBox.style.color = 'white';
            }
        }
        requestAnimationFrame(this.update);

        const infoBox = document.getElementById('info-box');

        //clear infoBox
        infoBox.innerHTML = '';

        let positionElm = document.createElement('div');
        positionElm.style.cursor = 'pointer';

        let x = (this.position.x - (this.canvas.width / 2)) / this.position.z;
        let y = (this.position.y - (this.canvas.height / 2)) / this.position.z;
        let z = this.position.z;

        positionElm.innerHTML = `C - 
        X: ${Math.floor(x)} (${Math.floor(this.position.x)})
        Y: ${Math.round(y)} (${Math.round(this.position.y)})
        Z: ${z.toFixed(2)}`;
        let {
            cx,
            cy
        } = this.convertMouseToCanvasCoordinates(controls.mouse.x, controls.mouse.y);
        positionElm.innerHTML += `<br>M -  X: ${Math.floor(cx)} Y: ${Math.round(cy)}`;
        positionElm.addEventListener('mousedown', () => {
            modal('Canvas Position', [
                {
                    type: 'number',
                    name: "x",
                    label: 'Position X',
                    placeholder: Math.round((this.position.x - (this.canvas.width / 2)) / this.position.z)
                },
                {
                    type: 'number',
                    name: "y",
                    label: 'Position Y',
                    placeholder: Math.round((this.position.y - (this.canvas.height / 2)) / this.position.z)
                },
                {
                    type: 'number',
                    name: "z",
                    label: 'Zoom',
                    placeholder: this.position.z
                }
            ], (values) => {
                let x = this.position.x - (this.canvas.width / 2);
                let y = this.position.y - (this.canvas.height / 2);
                let z = this.position.z;

                if (!isNaN(values.x) && values.x !== null && values.x !== undefined) {
                    x = (Number(values.x || x));
                }
                if (!isNaN(values.y) && values.y !== null && values.y !== undefined) {
                    y = (Number(values.y || y));
                }
                if (!isNaN(values.z) && values.z !== null && values.z !== undefined) {
                    z = Math.max(0.25, Math.min(Number(values.z) || z, 15));
                }

                this.goTo(x, y, z, true);
            });
        });

        infoBox.appendChild(positionElm);

        //info about selected node
        // selectedNodes.slice().reverse().forEach((node, index) => {
        //     if (index < 3) {
        //         document.getElementById('info-box').innerHTML += ` <br>Node: ${node.id} ${node.name} X: ${node.x} Y: ${node.y} W: ${node.width} H: ${node.height}`;
        //     }
        // });
        //
        // if (selectedNodes.length > 3) {
        //     document.getElementById('info-box').innerHTML += ` <br>...and ${selectedNodes.length - 3} more nodes selected`;
        // }

        // this.canvas.style.cursor = cursorStyle;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();

        // this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.translate(this.position.x, this.position.y);
        this.ctx.scale(this.position.z, this.position.z);

        this.drawGrid();
        this.drawPings();
        // drawSplines();
        // drawNodes();
        // drawTempSpline();
        drawing.draw();
        multiplayer.draw();

        this.ctx.restore();
    }

    drawPings() {
        const pulseDuration = 3000; // Duration of the pulse in milliseconds
        const baseRadius = 50; // Base radius of the pulse

        // Filter out pings that have expired
        this.pings = this.pings.filter(ping => performance.now() - ping.start < pulseDuration);

        // Draw each ping
        this.pings.forEach(ping => {
            const scaledX = ping.x;
            const scaledY = ping.y;
            const progress = (performance.now() - ping.start) / pulseDuration;
            const radius = baseRadius * progress / this.position.z;
            const opacity = (1 - progress);
            this.ctx.beginPath();
            this.ctx.arc(scaledX, scaledY, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = `rgba(${ping.color.r}, ${ping.color.g}, ${ping.color.b}, ${opacity})`;
            this.ctx.fill();
        });
    }

    drawGrid() {
        const {
            step,
            color,
            centerLine
        } = theme.grid;

        const {
            startX,
            endX,
            startY,
            endY
        } = this.calculateVisibleArea(step);

        const gridLevels = [
            {
                step: step,
                minScale: 0.75,
                scaleOpacity: 1.5,
                dash: [],
                lineDashOffset: 0,
            },
            {
                step: step,
                minScale: 1.5,
                maxScale: 4,
                scaleOpacity: 3,
                dash: [2],
                lineDashOffset: 5,
                innerOnly: true,
            },
            {
                step: step / 4,
                minScale: 3,
                scaleOpacity: 4,
                dash: [],
                lineDashOffset: 0,
            },
            {
                step: step / 4,
                minScale: 4,
                scaleOpacity: 5,
                dash: [1],
                lineDashOffset: 1.5,
                innerOnly: true
            }
        ];

        gridLevels.reverse();

        gridLevels.forEach(({
                                step,
                                minScale,
                                maxScale,
                                scaleOpacity,
                                dash,
                                lineDashOffset,
                                innerOnly
                            }) => {
            if (this.position.z < minScale || this.position.z > maxScale) return;

            let opacity = Math.min(Math.max((this.position.z - minScale) / (scaleOpacity - minScale), 0), 1);

            if (maxScale && this.position.z > scaleOpacity) {
                opacity = Math.min(Math.max((maxScale - this.position.z) / (maxScale - scaleOpacity), 0), 1);
            }

            this.ctx.beginPath();
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1 / this.position.z;
            this.ctx.globalAlpha = opacity;
            this.ctx.setLineDash(dash);
            this.ctx.lineDashOffset = lineDashOffset;

            if (innerOnly) {
                for (let x = startX; x < endX; x += step) {
                    this.ctx.moveTo(x + step / 2, startY + step / 2);
                    this.ctx.lineTo(x + step / 2, endY + step / 2);
                }
                for (let y = startY; y < endY; y += step) {
                    this.ctx.moveTo(startX + step / 2, y + step / 2);
                    this.ctx.lineTo(endX + step / 2, y + step / 2);
                }
            } else {
                for (let x = startX; x < endX; x += step) {
                    this.ctx.moveTo(x, startY);
                    this.ctx.lineTo(x, endY);
                }
                for (let y = startY; y < endY; y += step) {
                    this.ctx.moveTo(startX, y);
                    this.ctx.lineTo(endX, y);
                }
            }

            this.ctx.stroke();
        });

        this.ctx.globalAlpha = 1; // Reset opacity to default
        this.ctx.setLineDash([]); // Reset line style

        if (centerLine) this.drawCenterLines(startX, endX, startY, endY);
    }

    drawCenterLines(startX, endX, startY, endY) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = theme.background.centerLine;
        this.ctx.lineWidth = 1 / this.position.z;
        this.ctx.moveTo(0, startY);
        this.ctx.lineTo(0, endY);
        this.ctx.moveTo(startX, 0);
        this.ctx.lineTo(endX, 0);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.fillStyle = theme.background.centerLine;
        this.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    calculateVisibleArea(step) {
        const startX = Math.floor(-this.position.x / this.position.z / step) * step;
        const endX = Math.ceil((this.canvas.width - this.position.x) / this.position.z / step) * step;
        const startY = Math.floor(-this.position.y / this.position.z / step) * step;
        const endY = Math.ceil((this.canvas.height - this.position.y) / this.position.z / step) * step;

        return {
            startX,
            endX,
            startY,
            endY
        };
    }

    move(x, y) {
        this.position.x += x;
        this.position.y += y;

        this.savePosition(this.position.x, this.position.y, this.position.z);
    }

    savePosition(x, y, z) {
        let canvasX = ((this.position.x) - (this.canvas.width / 2)) / this.position.z;
        let canvasY = ((this.position.y) - (this.canvas.height / 2)) / this.position.z;

        multiplayer.user.x = invertSign(canvasX);
        multiplayer.user.y = invertSign(canvasY);

        multiplayer.sendDataUpdate();

        setCookie('canvas-x', canvasX, 7);
        setCookie('canvas-y', canvasY, 7);
        setCookie('canvas-z', z, 7);
    }

    zoom(z, x, y) {
        let targetZoomSpeed = this.position.z < 1 ? 0.1 : this.position.z < 3 ? 0.4 : 0.8;
        this.zoomSpeed += (targetZoomSpeed - this.zoomSpeed) * 0.1;

        //don't let the zoom speed go below 0.1
        this.zoomSpeed = Math.max(0.2, this.zoomSpeed);

        let newScale = Math.max(0.25, Math.min(this.position.z + z * this.zoomSpeed, 15));

        const snapPoints = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
        const tolerance = 0.06;

        newScale = snapPoints.find(point => Math.abs(newScale - point) <= tolerance) || newScale;

        const zoomFactor = newScale / this.position.z;
        this.position.x = x - zoomFactor * (x - this.position.x);
        this.position.y = y - zoomFactor * (y - this.position.y);

        this.position.z = parseFloat(newScale.toFixed(2));

        this.savePosition(this.position.x, this.position.y, this.position.z);
    }

    goTo(x, y, z, smooth = false, ping = true) {
        if (ping)
            this.pingLocation(
                (x),
                (y)
            );

        this.savePosition(x, y, z);

        x = x * z;
        y = y * z;

        x += this.canvas.width / 2;
        y += this.canvas.height / 2;


        if (!smooth) {
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
            return;
        }

        const startX = this.position.x;
        const startY = this.position.y;
        const startZ = this.position.z;

        const duration = 3000;
        const startTime = performance.now();

        const easeInOutCubic = (t) => {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animate = (time) => {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);

            const progress = easeInOutCubic(t);

            this.position.x = startX + (x - startX) * progress;
            this.position.y = startY + (y - startY) * progress;
            this.position.z = startZ + (z - startZ) * progress;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    pingLocation(x, y) {
        this.pings.push({
            x: invertSign(x),
            y: invertSign(y),
            start: performance.now(),
            color: {
                r: 255,
                g: 205,
                b: 0
            }
        });
    }

    getRelativePosition(x, y) {
        const relativeX = (x - this.position.x) / this.position.z;
        const relativeY = (y - this.position.y) / this.position.z;

        return {
            rx: relativeX,
            ry: relativeY
        };
    }

    convertMouseToCanvasCoordinates(x, y) {
        let {
            rx,
            ry
        } = this.getRelativePosition(x, y);

        const cx = invertSign(rx);
        const cy = invertSign(ry);

        return {
            cx,
            cy
        };
    }
}
