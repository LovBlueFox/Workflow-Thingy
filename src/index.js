const win = nw.Window.get(undefined);

win.setMinimumSize(900, 600);

let port = 8080;

let currentVersion = 'v0.1.0';

function checkForUpdates() {
    document.getElementById('version').innerText = currentVersion;
    fetch('https://api.github.com/repos/bradleybossard/workflow/releases/latest').then(response => response.json()).then(data => {
        if (data.status !== 200) return
        if (data.tag_name !== currentVersion) {
            if (confirm('A new version of Workflow Thingy is available. Would you like to download it?')) {
                window.open('https://github.com/', '_blank');
            }
        }
    });
}

function startWorkflow() {
    nw.Window.open('./pages/server.html', {
        width: 800,
        height: 600,
        title: 'Workflow Server',
        frame: true,
        resizable: true
    }, function(win) {});
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
        }, function(win) {});
    } else {
        location.href = `editor.html?connect=${server}&client=1`;
    }
}
