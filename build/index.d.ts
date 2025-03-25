export interface UdpServer {
    sendServerMessage(ip: string, port: number, message: string): Promise<string>;
    stop(): Promise<string>;
    onDisconnect(callback: () => void): {
        remove: () => void;
    };
}
export interface UdpClient {
    sendMessage(ip: string, port: number, message: string): Promise<string>;
    stop(): Promise<string>;
}
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
export interface ExpoUdpModule {
    initServer(port: number, ip: string): Promise<string>;
    sendServerMessage(ip: string, port: number, message: string): Promise<string>;
    stopServer(): Promise<string>;
    initClient(ip: string, port: number): Promise<string>;
    sendMessage(ip: string, port: number, message: string): Promise<string>;
    stopClient(): Promise<string>;
    addListener(event: 'onServerMessage', listener: (event: ServerMessageEvent) => void): {
        remove: () => void;
    };
    addListener(event: 'onServerError', listener: (event: ErrorEvent) => void): {
        remove: () => void;
    };
    addListener(event: 'onServerDisconnected', listener: (event: DisconnectEvent) => void): {
        remove: () => void;
    };
    addListener(event: 'onClientMessage', listener: (event: ServerMessageEvent) => void): {
        remove: () => void;
    };
    addListener(event: 'onClientError', listener: (event: ErrorEvent) => void): {
        remove: () => void;
    };
}
declare const nativeModule: ExpoUdpModule;
export declare const initServer: (port: number, ip: string) => Promise<UdpServer>;
export declare const initClient: (ip: string, port: number) => Promise<UdpClient>;
export declare const addServerMessageListener: (callback: (event: ServerMessageEvent) => void) => {
    remove: () => void;
};
export declare const addServerErrorListener: (callback: (event: ErrorEvent) => void) => {
    remove: () => void;
};
export declare const addServerDisconnectListener: (callback: (event: DisconnectEvent) => void) => {
    remove: () => void;
};
export declare const addClientMessageListener: (callback: (event: ServerMessageEvent) => void) => {
    remove: () => void;
};
export declare const addClientErrorListener: (callback: (event: ErrorEvent) => void) => {
    remove: () => void;
};
export default nativeModule;
//# sourceMappingURL=index.d.ts.map