class Drawing {

    active = false;
    pen = null;
    mouse = {
        x: 0,
        y: 0
    };
    strokes = [];
    size = 5;
    color = "rgba(218,101,0, 1)";
    toolbox = null;

    constructor() {
        this.color =getCookie('color') || this.color;
        this.createToolbox();
    }

    draw() {
        if (this.active) {
            drawing.drawCircle(controls.mouse.rx, controls.mouse.ry, this.size / 2, 'rgba(0,0,0,0)', {
                color: this.color,
                width: 1 / canvas.position.z
            });
        }

        if (this.strokes.length > 0) {
            for (const element of this.strokes) {
                if (element.length > 0) {
                    if (element.type === 'point' || element.length === 1) {
                        drawing.drawPoint(element[0].x, element[0].y, element[0].color, element[0].size);
                    } else {
                        drawing.drawPoint(element[0].x, element[0].y, element[0].color, element[0].size);
                        for (let j = 1; j < element.length; j++) {
                            drawing.drawPoint(element[j].x, element[j].y, element[j].color, element[j].size);
                            drawing.drawLine(element[j - 1].x, element[j - 1].y, element[j].x, element[j].y, element[j].color, element[j].size);
                        }
                    }
                }
            }
        }
    }

    createToolbox() {
        let menu = document.getElementById('menu');
        let menuHeight = menu.offsetHeight;

        let toolbox = document.createElement('div');
        toolbox.id = 'toolbox';
        toolbox.style.position = 'absolute';
        toolbox.style.top = '45px';
        toolbox.style.right = '10px';
        toolbox.style.width = '170px';
        toolbox.style.borderRadius = '5px';
        toolbox.style.height = `calc(100% - ${menuHeight}px - 65px)`;
        toolbox.style.display = 'flex';
        toolbox.style.flexDirection = 'column';
        // toolbox.style.justifyContent = 'center';
        // toolbox.style.alignItems = 'center';
        toolbox.style.backgroundColor = '#08090f';
        toolbox.style.zIndex = '1000';
        toolbox.style.display = 'none';
        document.body.appendChild(toolbox);

        let colorWheel = document.createElement('div');
        colorWheel.id = 'colorWheel';
        colorWheel.style.backgroundColor = this.color;
        colorWheel.style.width = 'calc(100% - 10px)';
        colorWheel.style.borderRadius = '5px';
        colorWheel.style.height = '20px';
        colorWheel.style.border = 'none';
        colorWheel.style.margin = '5px';
        toolbox.appendChild(colorWheel);

        const createSlider = (label, initialValue, min, max, onChange) => {
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.margin = '5px';

            const sliderLabel = document.createElement('span');
            sliderLabel.textContent = label;
            sliderLabel.style.marginRight = '5px';
            sliderLabel.style.color = 'white';
            container.appendChild(sliderLabel);

            const sliderInput = document.createElement('input');
            sliderInput.type = 'range';
            sliderInput.min =min;
            sliderInput.max = max;
            sliderInput.value = initialValue;
            sliderInput.style.width = '100px';
            sliderInput.oninput = onChange;
            container.appendChild(sliderInput);

            return container;
        }

        let rgb = this.color.match(/\d+/g).map(Number);
        let hsl = rgbaToHsl(rgb);
        let hueSlider = createSlider('H', hsl[0], 0, 360, (event) => {
            hsl[0] = event.target.value;
            rgb = hslToRgba(hsl);
            this.changeColor(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
        });
        toolbox.appendChild(hueSlider);

        let saturationSlider = createSlider('S', hsl[1], 0, 100, (event) => {
            hsl[1] = event.target.value;
            rgb = hslToRgba(hsl);
            this.changeColor(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
        });
        toolbox.appendChild(saturationSlider);

        let lightnessSlider = createSlider('L', hsl[2], 0, 100, (event) => {
            hsl[2] = event.target.value;
            rgb = hslToRgba(hsl);
            this.changeColor(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
        });
        toolbox.appendChild(lightnessSlider);

        let sizeSlider = createSlider('S', this.size, 5, 500, (event) => {
            this.size = event.target.value;
        });
        toolbox.appendChild(sizeSlider);

        this.toolbox = toolbox;
    }

    changeColor(color) {
        this.color = color;
        document.getElementById('colorWheel').style.backgroundColor = color;
        setCookie('color', color);
    }

    startingPoint(options = {}) {
        const {
            startX,
            startY
        } = controls.mouse;
        this.mouse = {
            x: startX,
            y: startY
        };

        const point = {
            type: this.pen,
            x: startX,
            y: startY,
            color: this.color,
            size: this.size
        };

        if (this.strokes.length === 0 || !options.shift) {
            this.strokes.push([point]);
        } else {
            this.strokes[this.strokes.length - 1].push(point);
        }
    }

    move(moveX, moveY, options = {}) {
        if (options.shift) {
            //keep the draw in a straight line relative to the starting point
            if (Math.abs(moveX) > Math.abs(moveY)) {
                moveY = 0;
            } else {
                moveX = 0;
            }
        }

        this.mouse.x += moveX / canvas.position.z;
        this.mouse.y += moveY / canvas.position.z;

        if (this.active) {
            this.strokes[this.strokes.length - 1].push({
                type: this.pen,
                x: this.mouse.x,
                y: this.mouse.y,
                color: this.color,
                size: this.size
            });
        }
    }

//draw a point
    drawPoint(x, y, color, width) {
        canvas.ctx.beginPath();
        canvas.ctx.arc(x, y, width / 2, 0, 2 * Math.PI);
        canvas.ctx.fillStyle = color;
        canvas.ctx.fill();
    }

//draw a line
    drawLine(x1, y1, x2, y2, color, width) {
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(x1, y1);
        canvas.ctx.lineTo(x2, y2);
        canvas.ctx.strokeStyle = color;
        canvas.ctx.lineWidth = width;
        canvas.ctx.stroke();
    }

    //draw a circle
//draw a circle
    drawCircle(x, y, radius, color, border) {
        canvas.ctx.beginPath();
        canvas.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        canvas.ctx.fillStyle = color;
        canvas.ctx.fill();
        if (border) {
            canvas.ctx.strokeStyle = border.color;
            canvas.ctx.lineWidth = border.width;
            canvas.ctx.stroke();
        }
    }

    //draw a rectangle
    drawRect(x, y, width, height, color) {
        canvas.ctx.fillStyle = color;
        canvas.ctx.fillRect(x, y, width, height);
    }

    //draw a text
    drawText(text, x, y, color, font) {
        canvas.ctx.fillStyle = color;
        canvas.ctx.font = font;
        canvas.ctx.fillText(text, x, y);
    }

    //draw a spline
    drawSpline(x1, y1, x2, y2, x3, y3, x4, y4, color, width) {
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(x1, y1);
        canvas.ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
        canvas.ctx.strokeStyle = color;
        canvas.ctx.lineWidth = width;
        canvas.ctx.stroke();
    }

    //draw a polygon
    drawPolygon(points, color) {
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            canvas.ctx.lineTo(points[i].x, points[i].y);
        }
        canvas.ctx.fillStyle = color;
        canvas.ctx.fill();
    }

    //draw an image
    drawImage(image, x, y, width, height) {
        canvas.ctx.drawImage(image, x, y, width, height);
    }

    //draw an ellipse
    drawEllipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, color) {
        canvas.ctx.beginPath();
        canvas.ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle);
        canvas.ctx.fillStyle = color;
        canvas.ctx.fill();
    }

    //draw a rounded rectangle
    drawRoundedRect(x, y, width, height, radius, color) {
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(x + radius, y);
        canvas.ctx.arcTo(x + width, y, x + width, y + height, radius);
        canvas.ctx.arcTo(x + width, y + height, x, y + height, radius);
        canvas.ctx.arcTo(x, y + height, x, y, radius);
        canvas.ctx.arcTo(x, y, x + width, y, radius);
        canvas.ctx.fillStyle = color;
        canvas.ctx.fill();
    }

    //draw a path
    drawPath(points, color, width) {
        canvas.ctx.beginPath();
        canvas.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            canvas.ctx.lineTo(points[i].x, points[i].y);
        }
        canvas.ctx.strokeStyle = color;
        canvas.ctx.lineWidth = width;
        canvas.ctx.stroke();
    }

    togglePen(type = 'line') {
        this.active = !this.active;
        if (this.active) {
            this.pen = type;
            this.toolbox.style.display = 'flex';
        } else {
            this.pen = null;
            this.toolbox.style.display = 'none';
        }

        console.log('Pen is now ' + (this.active ? 'active' : 'inactive') + ' with type ' + this.pen);
    }

    decreaseBrush() {
        this.size = Math.max(0.25, this.size - 0.25);
    }

    increaseBrush() {
        this.size = Math.min(1000, this.size + 0.25);
    }
}
