let port = 8080;

function startWorkflow() {
    nw.Window.open('./pages/server.html', {
        width: 800,
        height: 600,
        title: 'Workflow Server',
        frame: true,
        resizable: true
    }, function (win) {
    });
    setTimeout(() => location.href = `editor.html?connect=127.0.0.1:${port}`, 1000);
}

function joinWorkflow(newWindow = false) {
    let server = prompt('Enter the server address:', `127.0.0.1:${port}`);
    if (newWindow) {
        nw.Window.open(`./pages/editor.html?connect=${server}&client=1`, {
            width: 800,
            height: 600,
            title: 'Workflow Editor',
            frame: true,
            resizable: true
        }, function (win) {
        });
    } else {
        location.href = `editor.html?connect=${server}&client=1`;
    }
}

export { startWorkflow, joinWorkflow };
