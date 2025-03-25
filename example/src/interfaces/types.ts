export interface Message {
    text: string;
    sender: 'me' | 'them';
    timestamp: Date;
  }
  
  export interface UdpEvent {
    message: string;
    fromIp: string;
    fromPort: number;
    error?: string;
  }
  
  export type AppMode = 'client' | 'server';