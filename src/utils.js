window.onerror = (msg, url, lineNo, columnNo, error) => {
    console.log(msg, url, lineNo, columnNo, error);
    alert('Open console for more information:\n' + JSON.stringify(msg));
    return false;
};

function getCookie(name) {
    const parts = `; ${document.cookie}`.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

function setCookie(name, value, days) {
    const date = new Date();
    if (days) date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = days ? `; expires=${date.toUTCString()}` : '';
    document.cookie = `${name}=${value || ''}${expires}; path=/;`;
}

function fetchData(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

function getTouchPos(e) {
    const touch = e.touches[0];
    return {
        x: (touch.clientX - offsetX) / scale,
        y: (touch.clientY - offsetY) / scale
    };
}

function loadingScreen() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.style.position = 'absolute';
    loader.style.top = '0';
    loader.style.left = '0';
    loader.style.right = '0';
    loader.style.bottom = '0';
    loader.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loader.style.display = 'flex';
    loader.style.flexDirection = 'column';
    loader.style.alignItems = 'center';
    loader.style.justifyContent = 'center';
    loader.style.zIndex = '1000';
    loader.innerHTML = '<div class="lds-ripple"><div></div><div></div></div>';


    const textElement = document.createElement('div');
    textElement.style.color = '#fff';
    textElement.style.marginTop = '10px';
    textElement.innerText = 'Initializing...';
    loader.appendChild(textElement);

    Object.defineProperty(loader, 'text', {
        set: function (value) {
            textElement.innerText = value;
        }
    });

    document.body.appendChild(loader);

    return loader;
}


function notify(message, status = 'info') {
    const notifyBox = document.getElementById('notify-box');
    const notification = document.createElement('div');
    notification.className = `notification notification-${status}`;
    notification.innerHTML = `${message}<div class="progress-bar"></div>`;
    notifyBox.appendChild(notification);

    let timeout = 5000;
    let startTime = Date.now();
    let remainingTime = timeout;
    let progressBar = notification.querySelector('.progress-bar');
    let interval;

    function updateProgressBar() {
        let elapsedTime = Date.now() - startTime;
        let progress = Math.min((elapsedTime / timeout) * 100, 100);
        progressBar.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 1000);
        }
    }

    function startTimeout() {
        startTime = Date.now();
        interval = setInterval(updateProgressBar, 100);
    }

    function pauseTimeout() {
        clearInterval(interval);
        remainingTime -= Date.now() - startTime;
    }

    notification.addEventListener('mouseenter', pauseTimeout);
    notification.addEventListener('mouseleave', startTimeout);

    setTimeout(() => {
        notification.classList.add('show');
        startTimeout();
    }, 10);
}


function loadTheme(theme) {
    document.body.style.backgroundColor = theme.background.primary;
}

function modal(title, fields, onSubmit) {
    let overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    let modal = document.createElement('div');
    modal.className = 'modal';

    let modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.textContent = title;
    modal.appendChild(modalHeader);


    let modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    let form = document.createElement('form');

    // Create input fields
    fields.forEach(field => {
        let label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.color = '#f0f0f0'; // Light gray color for the label
        label.textContent = field.label + ":";
        form.appendChild(label);

        let input = document.createElement('input');
        input.type = field.type || 'text';
        input.name = field.name;
        input.value = field.value || '';
        input.placeholder = field.placeholder || '';
        input.className = 'modal-input';
        form.appendChild(input);
    });

    // Create submit button
    let submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Submit';
    submitButton.className = 'submit-button';

    let cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'close-button';

    cancelButton.onclick = () => {
        overlay.style.display = 'none';
        document.body.removeChild(modal);
    };

    // Handle form submission
    form.onsubmit = (event) => {
        event.preventDefault();
        let formData = new FormData(form);
        let data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        onSubmit(data);
        overlay.style.display = 'none';
        document.body.removeChild(modal);
    };

    form.appendChild(submitButton);
    form.appendChild(cancelButton);
    modalBody.appendChild(form);
    modal.appendChild(modalBody);

    document.body.appendChild(modal);
}

const performanceHistory = [];

for (let i = 59; i >= 0; i--) {
    performanceHistory.push({
        inFocus: false,
        timestamp: new Date(Date.now() - i * 1000),
        fps: 0,
        nodes: 0
    });
}

function openPerformance() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';

    const modalTitle = document.createElement('span');
    modalTitle.textContent = 'Performance Metrics';
    modalHeader.appendChild(modalTitle);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.onclick = () => {
        overlay.style.display = 'none';
        document.body.removeChild(modal);
        clearInterval(refreshInterval);
    };
    modalHeader.appendChild(closeButton);

    modal.appendChild(modalHeader);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    const fpsHistoryContainer = document.createElement('div');
    fpsHistoryContainer.className = 'fps-history-container';
    fpsHistoryContainer.innerHTML = '<canvas id="fpsHistoryChart"></canvas>';
    modalBody.appendChild(fpsHistoryContainer);

    modal.appendChild(modalBody);
    document.body.appendChild(modal);

    const ctx = document.getElementById('fpsHistoryChart').getContext('2d');
    const performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            animation: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    suggestedMax: 100,
                    min: 1,
                    title: {
                        display: true,
                    }
                }
            }
        }
    });

// Register the custom plugin for drawing rectangles
    Chart.register({
        id: 'square',
        afterDraw: function (chart) {
            const ctx = chart.ctx;
            const rectangles = chart.data.datasets.filter(dataset => dataset.type === 'bar').flatMap(dataset => dataset.data);
            rectangles.forEach(rectangle => {
                const x = chart.scales.x.getPixelForValue(rectangle.x);
                const x2 = chart.scales.x.getPixelForValue(rectangle.x2);
                const width = x2 - x;
                const chartArea = chart.chartArea;
                ctx.fillStyle = rectangle.backgroundColor;
                ctx.fillRect(x, chartArea.top, width, chartArea.bottom - chartArea.top);
            });
        }
    });

    const MAX_DATA_POINTS = 60;

    const updateMetrics = () => {
        let labels = performanceHistory.slice(-MAX_DATA_POINTS).map(entry => entry.timestamp.toLocaleString('en-GB', {
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));

        let fpsData = performanceHistory.slice(-MAX_DATA_POINTS).map(entry => entry.fps);
        let nodesData = performanceHistory.slice(-MAX_DATA_POINTS).map(entry => entry.nodes);
        let inFocus = performanceHistory.slice(-MAX_DATA_POINTS).map(entry => entry.inFocus);
        let users = performanceHistory.slice(-MAX_DATA_POINTS).map(entry => entry.users);

        performanceChart.data.labels = labels;

        performanceChart.data.datasets[0] = {
            label: 'FPS',
            data: fpsData,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        };

        performanceChart.data.datasets[1] = {
            label: 'Nodes',
            data: nodesData,
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            type: 'bar',
        };

        const rectangles = [];
        let start = null;

        for (let i = 0; i < inFocus.length; i++) {
            if (inFocus[i] === true && start !== null) {
                rectangles.push({
                    x: start,
                    x2: i,
                    backgroundColor: 'rgb(255,153,0, 0.1)',
                    striped: true
                });
                start = null;
            } else if (inFocus[i] === false && start === null) {
                start = i;
            }
        }

        if (start !== null) {
            rectangles.push({
                x: start,
                x2: inFocus.length,
                backgroundColor: 'rgb(255,153,0, 0.1)'
            });
        }

        performanceChart.data.datasets[2] = {
            label: 'UnFocused',
            data: rectangles,
            type: 'bar',
        };

        performanceChart.data.datasets[3] = {
            label: 'Users',
            data: users,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        }

        performanceChart.update();
    };


    let refreshInterval = setInterval(updateMetrics, 1000);

}

function invertSign(number) {
    return number * -1;
}

//document onload event
window.onload = () => {
    setInterval(function () {
        performanceHistory.push({
            inFocus: document.hasFocus(),
            timestamp: new Date(),
            fps: canvas.performance.fps ?? 0,
            nodes: workflow.data.nodes.length ?? 0,
            users: multiplayer.users.length ?? 0
        });
    }, 1000);
};


function rgbaToHsl(rgba) {
    const r = rgba[0] / 255;
    const g = rgba[1] / 255;
    const b = rgba[2] / 255;
    const a = rgba[3];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return [h * 360, s * 100, l * 100, a];
}

function hslToRgba(hsl) {
    const h = hsl[0] / 360;
    const s = hsl[1] / 100;
    const l = hsl[2] / 100;
    const a = hsl[3] ?? 1;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
}
