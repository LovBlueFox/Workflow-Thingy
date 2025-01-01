import * as fastGlob from 'fast-glob';
import * as dirGlob from 'dir-glob';
import * as merge2 from 'merge2';
import {globby, globbySync} from 'globby';
import { deleteAsync, deleteSync } from 'del';
import * as child_process from "child_process";
// import updater from '@nwutils/updater';

try {
    setTimeout(async () => {

        const pkg = global.window.require('../package.json');
        const gui = global.window.require('nw.gui');
        const win = gui.Window.get(undefined);
        win.window.document.getElementById('version').innerText = `v${pkg.version}`;
        win.showDevTools();

        // let copyPath, execPath;
        // if (gui.App.argv.length) {
        //     [copyPath, execPath] = gui.App.argv;
        // }

        setTimeout(() => {
            nw.Window.open('../views/index.html', {
                width: 800,
                height: 400,
                title: 'Workflow Thingy',
                position: 'center',
                frame: true,
                resizable: true
            }, (win) => {
                // win.window.document.getElementById('version').innerText = `v${pkg.version}`;
            });
            win.close();
        }, 1000);
    }, 1000);
} catch (e) {
    alert(`Error: ${e.message}`);
}
