import { requireNativeModule } from 'expo-modules-core';

// Define the server interface
export interface UdpServer {
  sendServerMessage(ip: string, port: number, message: string): Promise<string>;
  stop(): Promise<string>;
  onDisconnect(callback: () => void): { remove: () => void };
}

// Define the client interface
export interface UdpClient {
  sendMessage(ip: string, port: number, message: string): Promise<string>;
  stop(): Promise<string>;
}

// Define event types
interface ServerMessageEvent {
  message: string;
  fromIp: string;
  fromPort: number;
}

interface ErrorEvent {
  error: string;
}

interface DisconnectEvent {
  message: string;
}

// Define the module interface
export interface ExpoUdpModule {
  initServer(port: number, ip: string): Promise<string>;
  sendServerMessage(ip: string, port: number, message: string): Promise<string>;
  stopServer(): Promise<string>;
  initClient(ip: string, port: number): Promise<string>;
  sendMessage(ip: string, port: number, message: string): Promise<string>;
  stopClient(): Promise<string>;
  addListener(event: 'onServerMessage', listener: (event: ServerMessageEvent) => void): { remove: () => void };
  addListener(event: 'onServerError', listener: (event: ErrorEvent) => void): { remove: () => void };
  addListener(event: 'onServerDisconnected', listener: (event: DisconnectEvent) => void): { remove: () => void };
  addListener(event: 'onClientMessage', listener: (event: ServerMessageEvent) => void): { remove: () => void };
  addListener(event: 'onClientError', listener: (event: ErrorEvent) => void): { remove: () => void };
}

// Get the native module
const nativeModule: ExpoUdpModule = requireNativeModule('ExpoUdp');

// Export server instance wrapper
export const initServer = async (port: number, ip: string): Promise<UdpServer> => {
  await nativeModule.initServer(port, ip);
  return {
    sendServerMessage: (ip: string, port: number, message: string) => nativeModule.sendServerMessage(ip, port, message),
    stop: () => nativeModule.stopServer(),
    onDisconnect: (callback: () => void) => nativeModule.addListener('onServerDisconnected', () => callback())
  };
};

// Export client instance wrapper
export const initClient = async (ip: string, port: number): Promise<UdpClient> => {
  await nativeModule.initClient(ip, port);
  return {
    sendMessage: (msgIp: string, msgPort: number, message: string) => nativeModule.sendMessage(msgIp, msgPort, message),
    stop: () => nativeModule.stopClient()
  };
};

// Listener functions
export const addServerMessageListener = (callback: (event: ServerMessageEvent) => void): { remove: () => void } =>
  nativeModule.addListener('onServerMessage', callback);

export const addServerErrorListener = (callback: (event: ErrorEvent) => void): { remove: () => void } =>
  nativeModule.addListener('onServerError', callback);

export const addServerDisconnectListener = (callback: (event: DisconnectEvent) => void): { remove: () => void } =>
  nativeModule.addListener('onServerDisconnected', callback);

export const addClientMessageListener = (callback: (event: ServerMessageEvent) => void): { remove: () => void } =>
  nativeModule.addListener('onClientMessage', callback);

export const addClientErrorListener = (callback: (event: ErrorEvent) => void): { remove: () => void } =>
  nativeModule.addListener('onClientError', callback);

// Export the full module as default
export default nativeModule;