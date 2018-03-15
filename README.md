# An Electron Desktop app compatible with Google Authenticator

<img src="img/title.png" alt="EAuthenticator" width=517 height=233>

This is an open source two-factor authentication software which encrypts your data by default. It uses [electron](https://electronjs.org/) and it is similarly designed to [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2). This gives it the name 'EAuthenticator'. EAuthenticator is an easy to use Authenticator for desktop operating systems. At the moment EAuthenticator only supports Time-based One-Time Password algorithm (TOTP) [RFC 6238](https://tools.ietf.org/html/rfc6238).

## Security Information

**The basic idea of two-factor authentication is the use of different devices for your password and TOTP pin. Using this software on the same device as your login reduces the security level. Nevertheless, the use of this software on the same device is safer than completely waiving no two-factor authentication.**

## How to USE

The following should help you to use EAuthenticator.

### Standard view
The following picture shows the standard functionalities of the application:

<img src="img/standardInfo.png" alt="Standard view" width=800 height= 600>



### On first start
On the first start, a dialog will be shown. This dialog let you specify a password for your accounts. If you click 'CLOSE' the accounts will also be encrypted, but with a default password. The dialog looks like this:

<img src="img/onStart.png" alt="On start view" width=800 height= 600>


### Add an account
To add a account you have to click the red plus button

<img src="img/add1Arrow.png" alt="Add 1 view" width=800 height= 600>

In the new window you can specify the account name and the shared secret of your two-factor authentication account.

<img src="img/add2.png" alt="Add 2 view" width=800 height= 600>

Only time based two-factor authentication is possible in the current version.

### Delete an account
To delete a account you have to click the corresponding bin icon.

The following dialog will pop up:

<img src="img/delete.png" alt="Delete view" width=800 height= 600>


### Rename an account
To rename a account you have to click the corresponding pencil icon.

The following dialog will pop up:

<img src="img/rename.png" alt="Rename view" width=800 height= 600>


### Lock app
If you click the lock icon on the title bar the app will be locked. This means your in memory data will be removed. If you don't specify a password it's not possible to lock the app.


### Add encryption
To add a personal password you need to go to the settings view. Therefor click the gear icon in the title bar.

There specify a new password:

<img src="img/addPassword.png" alt="Add password view" width=800 height= 600>


### Reset encryption

To reset the personal password you need to go to the settings view. Therefor click the gear icon in the title bar.

There fill in the old password and click 'Reset encryption'.

<img src="img/changeOrResetPassword.png" alt="Change or reset password view" width=800 height= 600>

If you fill in a new password you can change your password with clicking 'Save'.

## How to BUILD

### Requirements for all platforms

1. Install [Node.js](https://nodejs.org/en/download/) and npm for your operating system

2. Clone the repository
    ```
    git clone https://github.com/Nikolasel/EAuthenticator.git
    ```

3. Change to the correct directory
    ```
    cd EAuthenticator
    ```
4. Install dependencies

   ```
   npm install
   ```

5. Generate the licenses.json file. This is necessary to show the licenses in the application

    ```
    npm run license
    ```
6. **Optional**: Run unit tests

    ```
    npm test
    ```
7. **Optional**: To try the software run the following command

    ```
    npm start
    ```
### Build for Linux
**Note: Build this on a Linux operating system.**

8. Run the following command to build executables
    ```
    npm run package-linux
    ```

#### Build .deb (for Ubuntu/Debian)

9. Create an installer with
     ```
     npm run create-installer-deb
     ```

#### Build .rpm (for Fedora/OpenSuse)

9. Install **rpmbuild**

    * Ubuntu
        ```
        sudo apt-get install rpm
        ```
    * Fedora
      ```
      sudo dnf install rpm-build
       ```
10. Create an installer with
     ```
     npm run create-installer-rpm
     ```

### Build for Windows
**Note: Build this on Windows.**

8. Run the following command to build executables
    ```
    npm run package-win
    ```
9. Create an installer with
     ```
     npm run create-installer-win
     ```
     
### Build for macOS
**Note: Build this on macOS.**

8. Run the following command to build executables
    ```
    npm run package-mac
    ```
9. Create an installer with
     ```
     npm run create-installer-mac
     ```


## Storage design

**Coming soon**

## License

This software is licensed under GPL-3.0.

## Contributing

Feel free to contribute to this project. Look at the issues or add issues.
