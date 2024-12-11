class Console {

    open = false;
    atBottom = true;

    constructor() {
        this.commands = [
            {
                command: 'help',
                action: () => {
                    const helpMessage = 'Available commands:\n' + this.commands.map(cmd => cmd.command).join('\n');
                    this.printToConsole(helpMessage, {color: 'orange'});
                }
            },
            {
                command: 'clear',
                action: this.clearConsole.bind(this)
            },
            {
                command: 'ping',
                action: () => {
                    this.printToConsole('Pong');
                }
            },
            {
                command: 'goto',
                usage: '/goto <x> <y> <z>',
                action: (args) => {
                    let [x, y, z] = args;

                    x = parseFloat(x) ?? canvas.position.x;
                    y = parseFloat(y) ?? canvas.position.y;
                    z = parseFloat(z) ?? canvas.position.z;

                    if (isNaN(x) || isNaN(y) || isNaN(z)) {
                        this.printToConsole('Invalid coordinates', {color: 'red'});
                        return;
                    }

                    this.printToConsole(`Going to ${x}, ${y}, ${z}`);

                    canvas.goTo(x, y, z, true);

                }
            }
        ];
        this.consoleElement = this.createConsoleElement();
        document.body.appendChild(this.consoleElement);
        this.consoleElement.style.display = 'none';
    }

    createConsoleElement() {
        const consoleElement = document.createElement('div');
        consoleElement.style.position = 'fixed';
        consoleElement.style.bottom = '70px';
        consoleElement.style.width = '100%';
        consoleElement.style.backgroundColor = 'rgb(8, 9, 15)';
        consoleElement.style.color = 'white';
        consoleElement.style.zIndex = '1000';
        consoleElement.style.fontFamily = 'monospace';
        consoleElement.style.display = 'block';
        consoleElement.style.left = '10px';
        consoleElement.style.padding = '10px';
        consoleElement.style.maxWidth = '600px';
        consoleElement.style.maxHeight = '50vh';
        consoleElement.style.border = '1px solid #191b24';
        consoleElement.style.borderRadius = '5px';

        const messagesElement = document.createElement('div');
        messagesElement.id = 'console-messages';
        messagesElement.style.maxHeight = '300px';
        messagesElement.style.overflowY = 'auto';
        consoleElement.appendChild(messagesElement);

        messagesElement.appendChild(document.createElement('div'));

        messagesElement.addEventListener('scroll', () => {
            this.atBottom = messagesElement.scrollHeight - messagesElement.scrollTop === messagesElement.clientHeight;
        });

        const inputContainer = document.createElement('div');
        inputContainer.style.display = 'flex';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.marginTop = '10px';

        const sendButton = document.createElement('button');
        sendButton.className = 'console-button send';
        sendButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
        sendButton.addEventListener('click', () => {
            if (textarea.value.trim() !== '') {
                this.executeCommand(textarea.value);
                textarea.value = '';
            }
        });

        const textarea = document.createElement('textarea');
        textarea.style.backgroundColor = '#11131f';
        textarea.style.color = '#c6c6c6';
        textarea.style.border = '1px solid #191b24';
        textarea.style.outline = 'none';
        textarea.style.padding = '5px';
        textarea.style.flex = '1';
        textarea.style.borderRadius = '5px 0 0 5px';
        textarea.style.resize = 'none'; // Disable manual resizing
        textarea.style.maxHeight = '100px'; // Set max height
        textarea.style.minHeight = '16px'; // Set max height
        textarea.style.height = '16px';
        textarea.style.overflowY = 'auto'; // Enable vertical scrolling
        const lineHeight = 15; // Approximate line height in pixels
        textarea.style.lineHeight = `${lineHeight}px`; // Initial height for one line
        textarea.rows = 1; // Initial rows

        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto'; // Reset height
            const maxLines = 10;
            const newHeight = Math.min(textarea.scrollHeight, lineHeight * maxLines);
            textarea.style.height = `calc(${newHeight}px - 10px)`; // Set new height

            const lines = Math.ceil(textarea.scrollHeight / lineHeight);

            if (lines > 2) { // 2 lines is actually 1 line
                textarea.style.borderRadius = '5px';
                textarea.style.marginRight = '5px';
                sendButton.style.borderRadius = '5px';
            } else {
                textarea.style.borderRadius = '5px 0 0 5px';
                textarea.style.marginRight = '0';
                sendButton.style.borderRadius = '0 5px 5px 0';
            }
        });

        textarea.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                textarea.style.borderRadius = '5px 0 0 5px';
                textarea.style.marginRight = '0';
                sendButton.style.borderRadius = '0 5px 5px 0';

                if (textarea.value.trim() !== '') {
                    this.executeCommand(textarea.value.trim());
                    textarea.value = '';
                    textarea.style.height = `${lineHeight}px`; // Reset height after sending
                }
            }
        });

        inputContainer.appendChild(textarea);
        inputContainer.appendChild(sendButton);

        const appsButton = document.createElement('button');
        appsButton.className = 'console-button additional';
        appsButton.innerHTML = '<i class="fa-solid fa-icons"></i>'; // Font Awesome apps icon
        appsButton.title = 'Show list of commands'; // Tooltip text
        inputContainer.appendChild(appsButton);

        // Create the modal for the list of commands
        const modal = document.createElement('div');
        modal.style.display = 'none';
        modal.style.position = 'absolute';
        modal.style.backgroundColor = '#050609';
        modal.style.width = '100px';
        modal.style.padding = '10px';
        modal.style.borderRadius = '5px';
        modal.style.border = '1px solid #11131f';
        modal.style.color = 'white';
        modal.style.zIndex = '1001';
        document.body.appendChild(modal);

        // Add event listener to the APPS button to show the modal
        appsButton.addEventListener('click', () => {
            const rect = appsButton.getBoundingClientRect();
            modal.style.bottom = `120px`;
            modal.style.left = `${rect.left}px`;
            modal.style.display = 'block';
            modal.innerHTML = ''; // Clear previous content

            // Create a list of commands
            this.commands.forEach(cmd => {
                const commandElement = document.createElement('div');
                commandElement.textContent = cmd.command;
                commandElement.style.cursor = 'pointer';
                commandElement.style.marginBottom = '10px';
                commandElement.addEventListener('click', () => {
                    modal.style.display = 'none';
                    const args = prompt(`Enter arguments for ${cmd.command} (separated by space):`);
                    if (args !== null) {
                        this.executeCommand(`/${cmd.command} ${args}`);
                    }
                });
                modal.appendChild(commandElement);
            });
        });

        // Close the modal when clicking outside of it
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        consoleElement.appendChild(inputContainer);
        return consoleElement;
    }

    printToConsole(message, options = {}) {
        const {
            user = 'System',
            time = new Date().toLocaleTimeString(),
            color = 'white',
            userColor = 'cyan',
            userImage = 'https://picsum.photos/50/50'
        } = options;

        const messageElement = document.createElement('div');
        messageElement.style.display = 'flex';
        messageElement.style.padding = '5px';

        const userElement = document.createElement('div');
        userElement.style.flex = '0 0 40px'; // Fixed width for user and time column

        const imageElement = document.createElement('img');
        imageElement.src = userImage;
        imageElement.style.width = '30px';
        imageElement.style.height = '30px';
        imageElement.style.borderRadius = '50%';
        imageElement.onerror = () => {
            imageElement.style.display = 'none';
        };
        userElement.appendChild(imageElement);
        messageElement.appendChild(userElement);

        const contentElement = document.createElement('div');

        const detailElement = document.createElement('div');
        detailElement.innerHTML = `${user}`;
        detailElement.style.color = userColor;
        detailElement.style.marginBottom = '5px';
        detailElement.style.fontWeight = 'bold';
        detailElement.style.flex = '0 0 150px'; // Fixed width for user and time column
        contentElement.appendChild(detailElement);

        const messageContent = document.createElement('div');
        messageContent.style.flex = '1'; // Take the remaining space
        messageContent.className = 'markdown';
        try {
            messageContent.innerHTML = marked.parse(message); // Parse Markdown to HTML
        } catch (e) {
            messageContent.textContent = message;
        }
        messageContent.style.color = color;
        messageContent.style.wordWrap = 'anywhere';
        messageContent.style.maxWidth = '70vw';

        contentElement.appendChild(messageContent);


        messageElement.appendChild(contentElement);

        const messagesElement = this.consoleElement.querySelector('#console-messages');
        messagesElement.insertBefore(messageElement, messagesElement.lastChild);

        // Scroll to bottom if atBottom flag is true
        if (this.atBottom) {
            messagesElement.scrollTop = messagesElement.scrollHeight;
        }

        if (this.consoleElement.style.display === 'none') {
            this.showTemporaryMessage(messageElement);
        }
    }

    showTemporaryMessage(messageElement) {
        const tempMessageElement = messageElement.cloneNode(true);
        tempMessageElement.style.position = 'fixed';
        tempMessageElement.style.bottom = '10%';
        tempMessageElement.style.left = '20px';
        tempMessageElement.style.backgroundColor = 'rgba(0, 0, 0)';
        tempMessageElement.style.padding = '10px';
        tempMessageElement.style.zIndex = '1001';
        tempMessageElement.style.minWidth = '300px';
        tempMessageElement.style.width = '100%';
        tempMessageElement.style.maxWidth = '50vw';
        document.body.appendChild(tempMessageElement);

        setTimeout(() => {
            document.body.removeChild(tempMessageElement);
        }, 10000);
    }

    clearConsole() {
        const messagesElement = this.consoleElement.querySelector('#console-messages');
        messagesElement.innerHTML = '';
        messagesElement.appendChild(document.createElement('div'));
    }

    executeCommand(input) {

        this.printToConsole(input, {
            user: multiplayer.user.name,
            userColor: multiplayer.user.color,
            userImage: `https://picsum.photos/id/${multiplayer.user.id}/50`
        });

        if (input.startsWith('/')) {
            const [command, ...args] = input.slice(1).split(' ');
            const cmd = this.commands.find(c => c.command === command);
            if (cmd) {
                if (cmd.usage && args.length === 0) {
                    this.printToConsole(`Usage: ${cmd.usage}`, {color: 'orange'});
                } else {
                    cmd.action(args);
                }
            } else {
                this.printToConsole(`Unknown command: ${command}`, {color: 'red'});
            }
        } else {
            multiplayer.send({
                type: 'message',
                args: {
                    user: multiplayer.user.id,
                    message: input
                }
            });
        }
    }

    toggleConsole() {
        if (this.consoleElement.style.display === 'none') {
            this.open = true;
            this.consoleElement.style.display = 'block';
            this.consoleElement.querySelector('textarea').focus(); // Focus the input element
        } else {
            this.open = false;
            this.consoleElement.style.display = 'none';
        }
    }

    incoming(data) {

    }
}
