import { requireNativeModule } from 'expo-modules-core';
// Get the native module
const nativeModule = requireNativeModule('ExpoUdp');
// Export server instance wrapper
export const initServer = async (port, ip) => {
    await nativeModule.initServer(port, ip);
    return {
        sendServerMessage: (ip, port, message) => nativeModule.sendServerMessage(ip, port, message),
        stop: () => nativeModule.stopServer(),
        onDisconnect: (callback) => nativeModule.addListener('onServerDisconnected', () => callback())
    };
};
// Export client instance wrapper
export const initClient = async (ip, port) => {
    await nativeModule.initClient(ip, port);
    return {
        sendMessage: (msgIp, msgPort, message) => nativeModule.sendMessage(msgIp, msgPort, message),
        stop: () => nativeModule.stopClient()
    };
};
// Listener functions
export const addServerMessageListener = (callback) => nativeModule.addListener('onServerMessage', callback);
export const addServerErrorListener = (callback) => nativeModule.addListener('onServerError', callback);
export const addServerDisconnectListener = (callback) => nativeModule.addListener('onServerDisconnected', callback);
export const addClientMessageListener = (callback) => nativeModule.addListener('onClientMessage', callback);
export const addClientErrorListener = (callback) => nativeModule.addListener('onClientError', callback);
// Export the full module as default
export default nativeModule;
//# sourceMappingURL=index.js.map