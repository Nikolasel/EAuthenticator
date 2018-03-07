# An Electron Desktop app compatible with Google Authenticator

<img src="img/title.png" alt="EAuthenticator" width=517 height=233>

This is an open source two-factor authentication software which encrypts your data by default. It uses [electron](https://electronjs.org/) and it is similarly designed to [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2). This gives it the name 'EAuthenticator'. At the moment EAuthenticator only supports Time-based One-Time Password algorithm (TOTP) [RFC 6238](https://tools.ietf.org/html/rfc6238).

## Security Information

The basic idea of two-factor authentication is the use of different devices for your password and TOTP pin. Using this software on the same device as your login reduces the security level. Nevertheless, the use of this software on the same device is safer than completely waiving no two-factor authentication.

## How to USE


## How to BUILD

First start to generate the licenses.json file. This is necessary to show the licenses in the application

    npm run license

To try the software run following command

    npm start


## Storage design

## License

This software is licensed under GPL-3.0.

## Contributing
