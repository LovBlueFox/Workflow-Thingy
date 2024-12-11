const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;

const wss = new WebSocketServer({port: 8080});
let userIdCounter = 0;

wss.on('connection', function connection(ws) {
    try {
        console.log('New Connection IP:', ws._socket.remoteAddress);
        ws.isAlive = true;

        ws.userData = {
            id: userIdCounter++,
            name: `User #${userIdCounter.toString().padStart(4, '0')}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            x: 0,
            y: 0,
        };

        ws.on('error', function error(error) {
            console.log('WebSocket error:', error);
        });

        ws.on('close', function close() {
            broadcast({
                type: 'user-disconnect',
                args: {
                    user: ws.userData
                }
            })
            console.log('WebSocket closed');
        });

        ws.on('open', function open() {
            console.log('WebSocket opened');
        });

        ws.on('message', function message(args) {
            let raw = JSON.parse(args);
            let type = raw.type;
            args = raw.args ?? [];

            console.log('RECEIVED: ', type, args);

            if (type === 'login') {
                ws.userData.name = args.name ?? ws.userData.name;
                ws.userData.color = args.color ?? ws.userData.color;
                ws.userData.x = args.x ?? ws.userData.x;
                ws.userData.y = args.y ?? ws.userData.y;

                console.log(ws.userData.name + ' has connected.');

                sendData(ws, {
                    type: 'login-success',
                    args: {
                        user: ws.userData
                    }
                });

                broadcast({
                    type: 'user-update',
                    args: {
                        user: ws.userData
                    }
                });
            } else if (type === 'message') {
                broadcast({
                    type: 'message',
                    args: {
                        user: ws.userData,
                        message: args.message
                    }
                });
            } else if (type === 'pong') {
                heartbeat(ws);
            } else if (type === 'user-update') {
                ws.userData.x = args.user.x ?? ws.userData.x;
                ws.userData.y = args.user.y ?? ws.userData.y;
                broadcast({
                    type: 'user-update',
                    args: {
                        user: ws.userData
                    }
                });
            }
        });

        sendData(ws, {
            type: 'login',
            version: '0.1.0'
        });

    } catch (error) {
        console.error('Error occurred:', error);
    }
});

wss.on('close', function close() {
    console.log('WebSocket server closed');
    clearInterval(interval);
});

function sendData(ws, data) {
    try {
        console.log('SENDING: ' + JSON.stringify(data));
        ws.send(JSON.stringify(data));
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}

function broadcast(data) {
    try {
        console.log('BROADCASTING: ' + JSON.stringify(data));
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive) {
                sendData(ws, data)
            }
        });
    } catch (error) {
        console.error('Failed to broadcast message:', error);
    }
}

function heartbeat(ws) {
    ws.isAlive = true;
}

const interval = setInterval(function ping() {
    try {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) {
                console.log('TERMINATING (timeout):', ws.userData.name);
                return ws.terminate();
            }
            ws.isAlive = false;
            sendData(ws, {
                type: 'ping'
            });
        });
    } catch (error) {
        console.error('Failed to ping clients:', error);
    }
}, 10000);

console.log('Server started on ws://localhost:8080');
