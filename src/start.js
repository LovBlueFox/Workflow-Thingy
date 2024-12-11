let theme = {
    autosave: {
        browserInterval: 1000,
    },
    background: {
        primary: '#11131f',
        secondary: '#2b2e3f',
        text: '#d4d4d4',
        centerLine: 'rgba(255, 0, 0, 0.1)',
    },
    node: {
        header: '#252526',
        body: '#000000',
        border: '#323232',
        shadow: 'rgba(0, 0, 0, 0.4)',
        text: '#d4d4d4',
        headerHeight: 8,
        textSize: 4,
        padding: 10,
        margin: 5,
    },
    line: {
        type: {
            '*': 'rgb(128,128,128)',
            'string': 'rgb(0,255,0)',
            'text': 'rgb(0,128,0)',
            'int': 'rgb(0,0,255)',
            'float': 'rgb(0,128,255)',
            'boolean': 'rgb(255,255,0)',
            'object': 'rgb(255,0,255)',
            'undefined': 'rgb(128,128,128)',
            'null': 'rgb(255,0,0)',
        },
        width: 2,
        spline: 'bezier',
    },
    grid: {
        step: 40,
        color: 'rgb(34,36,42)',
        snapping: 5,
        centerLine: true,
    },
};

let loading = loadingScreen();
let drawing = new Drawing();
let multiplayer = new Multiplayer();
let controls = new Controls();
let canvas = new Canvas();
let consoleInstance = new Console();
let workflow = new Workflow();

workflow.load({
    nodes: [],
    diagrams: [],
    tables: [],
    simulation: [],
    network: [],
    history: []
});

async function start() {
    loading.text = 'Loading Theme...';
    loadTheme(JSON.parse(localStorage.getItem('theme')) || theme);

    loading.text = 'Loading Keyboard & Mouse Events...';
    controls.eventListeners();

    loading.text = 'Checking for server...';
    if (location.search.includes('connect')) {
        try {
            const params = new URLSearchParams(location.search);
            const serverAddress = params.get('connect');
            await multiplayer.connect(`ws://${serverAddress}`);
            loading.text = 'Connected to server.';
        } catch (e) {
            notify('Failed to connect to server.', 'error');
            if (confirm('Failed to connect to server. Retry?')) {
                location.reload();
            } else {
                location.href = 'index.html';
            }
        }
    } else {
        loading.text = 'Loading Workflow, Nodes & Diagrams...';
        if (!localStorage.getItem('workflow')) {
            notify('No workflow found.', 'warning');
            workflow.openList();
        } else {
            notify('Workflow loaded.', 'success');
            workflow.load(JSON.parse(localStorage.getItem('workflow')));
        }
    }

    loading.text = 'Loading Canvas...';
    canvas.update();

    loading.remove();
}

start();


