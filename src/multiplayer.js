class Multiplayer {

    server = null;
    client = null;
    pingTimeout;
    user = {};
    users = [];

    draw() {
        //render out users blips
        this.users.forEach(user => {
            drawing.drawEllipse(user.x, user.y, 10, 10, 0, 0, 2 * Math.PI, user.color);
            drawing.drawEllipse(user.x, user.y, 5, 5, 0, 0, 2 * Math.PI, 'white');
            drawing.drawEllipse(user.x, user.y, 2, 2, 0, 0, 2 * Math.PI, user.color);
            drawing.drawText(user.name, user.x + 10, user.y + 10, 10, user.color);
        });
    }

    async connect(server) {
        this.server = server;
        this.client = new WebSocket(this.server);

        await new Promise((resolve, reject) => {
            this.client.addEventListener('open', (event) => {
                this.heartbeat();
                notify('Connected to server.', 'success');
                resolve();
            });

            this.client.addEventListener('error', (event) => {
                console.log('WebSocket Error:', event);
                notify('WebSocket Error', 'error');
                reject(event);
            });
        });

        this.client.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);
            this.execute(data.type, data.args || []);
        });

        this.client.addEventListener('close', (event) => {
            console.log('WebSocket closed:', event);
            this.server = null;
            this.client = null;
            notify('Disconnected from server.', 'warning');
            this.check();
        });

        //send update very 5 seconds
        setInterval(() => {
            this.sendDataUpdate();
        }, 5000);

        return this.client;
    }

    send(data) {
        console.log('Sending:', data);
        try {
            this.client.send(JSON.stringify(data));
        } catch (error) {
            console.log('Failed to send message:', error);
        }
    }

    check() {
        let loading = loadingScreen();
        loading.text = 'Lost Connection to Server';

        setTimeout(() => {
            if (confirm('Lost connection to server. Retry?')) {
                location.reload();
            } else {
                location.href = 'index.html';
            }
        }, 2000);
    }

    close() {
        this.client.close();
    }

    execute(command, args = []) {
        switch (command) {
            case 'login':
                this.login();
                break;
            case 'notify':
                notify(args.message, 'info');
                break;
            case 'ping':
                this.heartbeat();
                this.send({
                    type: 'pong'
                });
                break;
            case 'message':
                if (this.user.id === args.user.id) return;
                consoleInstance.printToConsole(args.message, {
                    user: args.user.name || 'Unknown',
                    userColor: args.user.color || 'white',
                    userImage: `https://picsum.photos/id/${args.user.id}/50`
                });
                break;
            case 'login-success':
                this.user = args.user;
                notify('Logged in successfully', 'success');
                break;
            case 'user-update':
                if (args.user.id === this.user.id) {
                    break;
                }
                let existingUser = this.users.find(u => u.id === args.user.id);
                if (existingUser) {
                    Object.assign(existingUser, args.user);
                } else {
                    notify(args.user.name + ' has connected.', 'info');
                    this.users.push(args.user);
                }
                break
            case 'user-disconnect':
                let index = this.users.findIndex(u => u.id === args.user.id);
                if (index >= 0) {
                    this.users.splice(index, 1);
                    notify(args.user.name + ' has disconnected.', 'info');
                }
                break;
            default:
                console.log('Unknown command:', command);
        }
    }

    login() {
        this.send({
            type: 'login'
        });
    }

    sendDataUpdate() {
        if (!this.client) return;

        this.send({
            type: 'user-update',
            args: {
                user: this.user
            }
        });
    }

    heartbeat() {
        console.log('Heartbeat');
        clearTimeout(this.pingTimeout);
        this.pingTimeout = setTimeout(() => {
            console.log('no ping received');
            this.close();
        }, 30000);
    }

}
