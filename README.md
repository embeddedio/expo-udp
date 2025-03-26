# Expo UDP Module

## Overview

The Expo UDP Module is a custom module for Expo applications that facilitates UDP communication. This module allows you to create both UDP servers and clients within your Expo app, enabling bidirectional communication over UDP.

[GitHub Repository](https://github.com/embeddedio/expo-udp)

## Features
- Initialize and manage UDP servers and clients.
- Send and receive messages over UDP.
- Handle server and client disconnections and errors.
- Listen for incoming messages and errors.

## Installation
To use the Expo UDP Module, follow these steps:

```sh
expo install expo-udp
```

## Usage

### Importing the Module
```js
import { initServer, initClient, addServerMessageListener, addServerErrorListener, addServerDisconnectListener, addClientMessageListener, addClientErrorListener } from 'expo-udp';
```

### Initializing a UDP Server
To initialize a UDP server, use the `initServer` function:

```js
const server = await initServer(port, ip);
```
- `port`: The port number on which the server will listen.
- `ip`: The IP address on which the server will listen.

### Sending Messages from the Server
To send a message from the server to a client, use the `sendServerMessage` method:

```js
await server.sendServerMessage(clientIp, clientPort, message);
```
- `clientIp`: The IP address of the client.
- `clientPort`: The port number of the client.
- `message`: The message to send.

### Stopping the Server
To stop the server, use the `stop` method:

```js
await server.stop();
```

### Listening for Server Events
You can listen for various server events such as incoming messages, errors, and disconnections:

```js
const serverMessageSub = addServerMessageListener((event) => {
  console.log(`Server received: ${event.message} from ${event.fromIp}:${event.fromPort}`);
});

const serverErrorSub = addServerErrorListener((event) => {
  console.error(`Server error: ${event.error}`);
});

const serverDisconnectSub = addServerDisconnectListener((event) => {
  console.log(`Server disconnected: ${event.message}`);
});
```

### Initializing a UDP Client
To initialize a UDP client, use the `initClient` function:

```js
const client = await initClient(serverIp, serverPort);
```
- `serverIp`: The IP address of the server.
- `serverPort`: The port number of the server.

### Sending Messages from the Client
To send a message from the client to the server, use the `sendMessage` method:

```js
await client.sendMessage(serverIp, serverPort, message);
```
- `serverIp`: The IP address of the server.
- `serverPort`: The port number of the server.
- `message`: The message to send.

### Stopping the Client
To stop the client, use the `stop` method:

```js
await client.stop();
```

### Listening for Client Events
You can listen for various client events such as incoming messages and errors:

```js
const clientMessageSub = addClientMessageListener((event) => {
  console.log(`Client received: ${event.message} from ${event.fromIp}:${event.fromPort}`);
});

const clientErrorSub = addClientErrorListener((event) => {
  console.error(`Client error: ${event.error}`);
});
```

## **EAS Build Considerations**

### **Why EAS Build is Required?**
The Expo UDP module contains native code, which means it **does not work in Expo Go**. Instead, you must use a **development build** created with EAS.

### **Building for Development (Local & Cloud)**
#### **Option 1: EAS Build (Cloud Build)**
Run this command to build an Expo Development Build in the cloud:
```sh
eas build --profile development --platform android
```
After the build completes, install the APK or IPA on your device. Then, launch your app and select **"Switch to development build"** in Expo.

#### **Option 2: EAS Build (Local Build)**
If you want to build locally instead of using the cloud, run:
```sh
eas build --local --profile development --platform android
```
This will generate an APK locally, which you can install and test.

### **Running the App Without EAS Build?**
If you try to run the module in Expo Go, you will see the error:
```
(NOBRIDGE) ERROR  Error: Cannot find native module 'ExpoUdp'
```
This happens because **Expo Go does not support native modules**. Always use an **EAS development build** to test the UDP module.

## Example Node.js UDP Server and Client

### UDP Server (Node.js)
```js
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.error(`Server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`Server received: ${msg} from ${rinfo.address}:${rinfo.port}`);
  server.send('Message received', rinfo.port, rinfo.address);
});

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening ${address.address}:${address.port}`);
});

server.bind(12345, '127.0.0.1');
```

### UDP Client (Node.js)
```js
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

client.on('message', (msg, rinfo) => {
  console.log(`Client received: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

const message = Buffer.from('Hello, Server!');
client.send(message, 0, message.length, 12345, '127.0.0.1', (err) => {
  if (err) {
    console.error(`Client error: ${err}`);
  } else {
    console.log('Message sent');
  }
  client.close();
});
```

## Testing with the Expo Module App
1. Start the Node.js UDP Server on your local machine.
2. Run the Expo Module App on your device or emulator with an **EAS development build**.
3. Configure the app to connect to the Node.js server's IP and port.
4. Send and receive messages between the Expo app and the Node.js server to verify the communication.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This module is licensed under the MIT License.

