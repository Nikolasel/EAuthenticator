const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path');

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1)
    });

function getInstallerConfig () {
    console.log('creating windows installer');
    const rootPath = path.join('./');
    const outPath = path.join(rootPath, 'release-builds');

    return Promise.resolve({
        appDirectory: path.join(outPath, 'EAuthenticator-win32-ia32/'),
        authors: 'Nikolasel',
        noMsi: true,
        outputDirectory: path.join(outPath, 'installers'),
        exe: 'EAuthenticator.exe',
        setupExe: 'EAuthenticatorInstaller.exe',
        setupIcon: path.join(rootPath, 'img', 'icon300x300.png')
    })
}