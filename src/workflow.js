// create a class Workflow

class Workflow {
    status;
    progress;
    interval;
    intervalTwo;

    buttonElm;
    progressElm;
    queueProgressNumberElm;
    data;
    wfList;
    wfListBody;
    history;
    historyIndex;

    constructor() {
        this.status = 0;
        this.progress = 0;
        this.interval = null;
        this.intervalTwo = null;

        this.buttonElm = document.getElementById('menu-bar-button');
        this.progressElm = document.getElementById('queue-progress');
        this.queueProgressNumberElm = document.getElementById('queue-progress-number');
        this.wfList = document.getElementById('workflow-list');
        this.wfListBody = document.getElementById('workflow-list-body');

        this.history = [];
        this.historyIndex = 0;
        this.addToHistory();

        setInterval(() => {
            localStorage.setItem('workflow', JSON.stringify(this.data));
        }, theme.autosave.browserInterval);
    }

    start() {
        if (this.status === 0) {

            canvas.goTo(0, 0, 1, true);
            this.intervalTwo = setInterval(() => {
                let randomX = Math.floor(Math.random() * 100);
                let randomY = Math.floor(Math.random() * 100);
                let randomZ = Math.random() * (15 - 0.25) + 0.25;

                canvas.goTo(randomX, randomY, randomZ, true);
            }, 3000);

            //random message
            let messages = [
                'Starting the workflow...',
            ]
            let randomMessage = messages[Math.floor(Math.random() * messages.length)];

            consoleInstance.printToConsole(randomMessage, {user: 'Agent', userColor: 'rgb(221,0,255)'});

            this.status = 1;
            this.progress = 0;
            this.buttonElm.innerHTML = 'Stop';
            this.progressElm.classList.remove('progress-error', 'progress-wait');
            this.progressElm.classList.add('progress-active');
            this.interval = setInterval(() => {
                this.progress += parseFloat((Math.random() * 2).toFixed(2));
                this.progress = parseFloat(this.progress.toFixed(2));
                this.progressElm.value = this.progress;
                this.queueProgressNumberElm.innerText = this.progress + '%';
                if (this.progress >= 100) {
                    clearInterval(this.interval);
                    clearInterval(this.intervalTwo);
                    this.progress = 100;
                    this.status = 0;
                    this.buttonElm.innerHTML = 'Start';
                    this.progressElm.classList.remove('progress-active');
                    this.progressElm.classList.add('progress-wait');
                    this.queueProgressNumberElm.innerText = 'COMPLETED';
                }
            }, 100);
        } else {
            this.stop();
        }
    }

    stop() {
        clearInterval(this.interval);
        clearInterval(this.intervalTwo);
        this.status = 0;
        this.progress = 0;
        this.progressElm.value = 100;
        this.queueProgressNumberElm.innerText = 'STOPPED';
        this.buttonElm.innerHTML = 'Start';
        this.progressElm.classList.remove('progress-active');
        this.progressElm.classList.add('progress-error');
    }

    load(data) {
        this.data = data ?? this.data;
    }

    loadListItem(name) {
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'load',
                name: name
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    notify(data.message, data.status);
                    return;
                }
                this.load(data.workflow);
            });
    }

    save() {
        if (!this.data.name) {
            this.rename();
            if (!this.data.name) {
                notify('Workflow name is required', 'error');
                return;
            }
        }

        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'save',
                workflow: this.data
            })
        })
            .then(response => response.json())
            .then(data => {
                notify(data.message ?? 'Workflow Saved', data.status);
            });
    }

    saveAs() {
        this.rename();
        this.save();
    }

    rename() {
        this.addToHistory();
        this.data.name = prompt('Workflow name:', this.data.name);
    }

    clear() {
        this.addToHistory();
        this.load({
            nodes: [],
            diagrams: [],
            tables: [],
            simulation: [],
            network: [],
            history: []
        });
    }


    addToHistory() {
        this.history.push(JSON.stringify(this.data));
        this.historyIndex = this.history.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.data = JSON.parse(this.history[this.historyIndex]);
            this.load(this.data);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.data = JSON.parse(this.history[this.historyIndex]);
            this.load(this.data);
        }
    }

    openList() {
        let overlay = document.getElementById('overlay');
        overlay.style.display = 'block';
        this.wfList.style.display = 'block';

        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({action: 'list'})
        })
            .then(async response => await response.json())
            .then(data => {
                data.workflows = data.workflows ?? undefined;
                if (data.status !== 'success') {
                    notify(data.message, data.status);
                    return;
                }
                this.wfListBody.innerHTML = '';
                for (const key in data.workflows) {
                    if (data.workflows.hasOwnProperty(key)) {
                        let workflowData = {
                            id: key,
                            name: data.workflows[key]
                        };
                        let item = document.createElement('div');
                        item.className = 'workflow-list-item';

                        let span = document.createElement('span');
                        span.textContent = workflowData.name;
                        item.appendChild(span);

                        let loadButton = document.createElement('button');
                        loadButton.textContent = 'Load';
                        loadButton.onclick = () => workflow.loadListItem(workflowData.name);
                        item.appendChild(loadButton);

                        let deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.onclick = () => workflow.deleteListItem(workflowData.name);
                        item.appendChild(deleteButton);

                        let renameButton = document.createElement('button');
                        renameButton.textContent = 'Rename';
                        renameButton.onclick = () => workflow.renameListItem(workflowData.name);
                        item.appendChild(renameButton);

                        this.wfListBody.appendChild(item);
                    }
                }
            });
    }

    renameListItem(oldName) {
        let newName = prompt('Enter new name for the workflow:', oldName);
        if (newName) {
            fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'rename',
                    old_name: oldName,
                    new_name: newName
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        workflow.openList();
                    } else {
                        notify(data.message, data.status);
                    }
                });
        }
    }

    deleteListItem(name) {
        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'delete',
                name: name
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    this.openList();
                } else {
                    notify(data.message, data.status);
                }
            });
    }

    closeList() {
        let overlay = document.getElementById('overlay');
        overlay.style.display = 'none';
        this.wfList.style.display = 'none';
    }
}
