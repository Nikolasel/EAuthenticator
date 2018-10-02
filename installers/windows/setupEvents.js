/*
* Copyright (c) 2015 GitHub Inc.

* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
* and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
* THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
* TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const electron = require('electron');
const app = electron.app;

module.exports = {
    handleSquirrelEvent: function() {
        if (process.argv.length === 1) {
            return false;
        }

        const ChildProcess = require('child_process');
        const path = require('path');

        const appFolder = path.resolve(process.execPath, '..');
        const rootAtomFolder = path.resolve(appFolder, '..');
        const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
        const exeName = path.basename(process.execPath);
        const spawn = function(command, args) {
            let spawnedProcess, error;

            try {
                spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
            } catch (error) {}

            return spawnedProcess;
        };

        const spawnUpdate = function(args) {
            return spawn(updateDotExe, args);
        };

        const squirrelEvent = process.argv[1];
        switch (squirrelEvent) {
            case '--squirrel-install':
            case '--squirrel-updated':
                // Optionally do things such as:
                // - Add your .exe to the PATH
                // - Write to the registry for things like file associations and
                // explorer context menus

                // Install desktop and start menu shortcuts
                spawnUpdate(['--createShortcut', exeName]);

                setTimeout(app.quit, 1000);
                return true;

            case '--squirrel-uninstall':
                // Undo anything you did in the --squirrel-install and
                // --squirrel-updated handlers

                // Remove desktop and start menu shortcuts
                spawnUpdate(['--removeShortcut', exeName]);

                setTimeout(app.quit, 1000);
                return true;

            case '--squirrel-obsolete':
                // This is called on the outgoing version of your app before
                // we update to the new version - it's the opposite of
                // --squirrel-updated

                app.quit();
                return true;
        }
    }
};