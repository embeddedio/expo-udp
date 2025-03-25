import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
} from 'react-native';
import {
  initServer,
  addServerMessageListener,
  addServerDisconnectListener,
  initClient,
  addClientMessageListener,
  addClientErrorListener,
} from 'expo-udp';
import { AppMode, Message, UdpEvent } from './interfaces/types';
import ModeSelector from './Components/ModeSelector';
import MessageList from './Components/MessageList';
import MessageInput from './Components/MessageInput';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('server');
  const [serverIp, setServerIp] = useState<string>('127.0.0.1');
  const [serverPort, setServerPort] = useState<string>('12345');
  const [clientIp, setClientIp] = useState<string>('255.255.255.255');
  const [clientPort, setClientPort] = useState<string>('12345');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
  const [isClientConnected, setIsClientConnected] = useState<boolean>(false);
  const [clientInstance, setClientInstance] = useState<any>(null);
  const [serverInstance, setServerInstance] = useState<any>(null);
  const [clientAddress, setClientAddress] = useState<{ ip: string; port: number } | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Refs to store subscriptions for cleanup
  const clientMessageSub = useRef<{ remove: () => void } | null>(null);
  const clientErrorSub = useRef<{ remove: () => void } | null>(null);
  const serverMessageSub = useRef<{ remove: () => void } | null>(null);
  const serverDisconnectSub = useRef<{ remove: () => void } | null>(null);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopServer();
      stopClient();
    };
  }, []);

  // Handle mode switch
  useEffect(() => {
    if (mode === 'server' && isClientConnected) {
      stopClient();
    } else if (mode === 'client' && isServerRunning) {
      stopServer();
    }
    setMessages([]);
  }, [mode]);

  const addMessage = (text: string, sender: 'me' | 'them'): void => {
    setMessages((prev) => [...prev, { text, sender, timestamp: new Date() }]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const startServer = async (): Promise<void> => {
    try {
      const port = parseInt(serverPort, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        addMessage('Invalid port number', 'them');
        return;
      }
      const server = await initServer(port, serverIp);
      setServerInstance(server);
      setIsServerRunning(true);
      addMessage(`Server started on ${serverIp}:${port}`, 'me');

      // Remove existing subscriptions if any
      serverMessageSub.current?.remove();
      serverDisconnectSub.current?.remove();

      // Listen for messages
      serverMessageSub.current = addServerMessageListener((event: UdpEvent) => {
        const receivedMsg = `Server received: ${event.message} from ${event.fromIp}:${event.fromPort}`;
        addMessage(receivedMsg, 'them');
        setClientAddress({ ip: event.fromIp, port: event.fromPort });
      });

      // Handle disconnection
      serverDisconnectSub.current = server.onDisconnect(() => {
        console.log('Server disconnected, cleaning up...');
        serverMessageSub.current?.remove();
        serverDisconnectSub.current?.remove();
        setIsServerRunning(false);
        setServerInstance(null);
        addMessage('Server stopped', 'me');
        setMessages([]);
      });
    } catch (error: any) {
      addMessage(`Server initialization failed: ${error.message}`, 'them');
    }
  };

  const stopServer = async (): Promise<void> => {
    try {
      if (serverInstance) {
        await serverInstance.stop();
        serverMessageSub.current?.remove();
        serverDisconnectSub.current?.remove();
        setIsServerRunning(false);
        setServerInstance(null);
        addMessage('Server stopped', 'me');
        setMessages([]);
      }
    } catch (error: any) {
      addMessage(`Failed to stop server: ${error.message}`, 'them');
    }
  };

  const startClient = async (): Promise<void> => {
    try {
      const port = parseInt(clientPort, 10);
      if (isNaN(port)) {
        addMessage('Invalid port number', 'them');
        return;
      }
      const client = await initClient(clientIp, port);
      setClientInstance(client);
      setIsClientConnected(true);
      addMessage(`Client initialized for ${clientIp}:${port}`, 'me');

      // Remove existing subscriptions if any
      clientMessageSub.current?.remove();
      clientErrorSub.current?.remove();

      // Listen for messages
      clientMessageSub.current = addClientMessageListener((event: UdpEvent) => {
        const receivedMsg = `Client received: ${event.message} from ${event.fromIp}:${event.fromPort}`;
        addMessage(receivedMsg, 'them');
      });

      // Listen for errors
      clientErrorSub.current = addClientErrorListener((event: UdpEvent) => {
        addMessage(`Client warning: ${event.error}`, 'them');
      });
    } catch (error: any) {
      addMessage(`Client initialization failed: ${error.message}`, 'them');
      console.error('Client initialization error:', error);
    }
  };

  const stopClient = async (): Promise<void> => {
    try {
      if (clientInstance) {
        await clientInstance.stop();
        clientMessageSub.current?.remove();
        clientErrorSub.current?.remove();
        setIsClientConnected(false);
        setClientInstance(null);
        addMessage('Client disconnected', 'me');
        setMessages([]);
      }
    } catch (error: any) {
      addMessage(`Failed to disconnect client: ${error.message}`, 'them');
    }
  };

  const sendMessageFromServer = async (): Promise<void> => {
    if (!serverInstance || !message.trim() || !clientAddress) return;
    try {
      console.log('Sending message from server:', message);
      await serverInstance.sendServerMessage(clientAddress.ip, clientAddress.port, message);
      addMessage(`Server sent: ${message}`, 'me');
      setMessage('');
    } catch (error: any) {
      console.error('Failed to send message from server:', error);
      addMessage(`Failed to send message: ${error.message}`, 'them');
    }
  };

  const sendMessageFromClient = async (): Promise<void> => {
    if (!clientInstance || !message.trim()) return;
    try {
      await clientInstance.sendMessage(clientIp, parseInt(clientPort, 10), message);
      addMessage(`Client sent: ${message}`, 'me');
      setMessage('');
    } catch (error: any) {
      addMessage(`Failed to send message: ${error.message}`, 'them');
    }
  };

  const clearChat = (): void => {
    setMessages([]);
  };

  const renderServerControls = (): JSX.Element => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>UDP Server</Text>
      <TextInput
        style={styles.input}
        placeholder="Server IP"
        value={serverIp}
        onChangeText={setServerIp}
        editable={!isServerRunning}
      />
      <TextInput
        style={styles.input}
        placeholder="Server Port"
        value={serverPort}
        onChangeText={setServerPort}
        keyboardType="numeric"
        editable={!isServerRunning}
      />
      {!isServerRunning ? (
        <Button title="Start Server" onPress={startServer} />
      ) : (
        <Button title="Stop Server" onPress={stopServer} color="red" />
      )}
      <Text style={styles.status}>
        Status: {isServerRunning ? 'Running' : 'Stopped'}
      </Text>
    </View>
  );

  const renderClientControls = (): JSX.Element => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>UDP Client</Text>
      <TextInput
        style={styles.input}
        placeholder="Server IP"
        value={clientIp}
        onChangeText={setClientIp}
        editable={!isClientConnected}
      />
      <TextInput
        style={styles.input}
        placeholder="Server Port"
        value={clientPort}
        onChangeText={setClientPort}
        keyboardType="numeric"
        editable={!isClientConnected}
      />
      {!isClientConnected ? (
        <Button title="Connect" onPress={startClient} />
      ) : (
        <Button title="Disconnect" onPress={stopClient} color="red" />
      )}
      <Text style={styles.status}>
        Status: {isClientConnected ? 'Connected' : 'Disconnected'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <MessageList messages={messages} flatListRef={flatListRef}>
          <>
            <ModeSelector mode={mode} setMode={setMode} />
            {mode === 'server' ? renderServerControls() : renderClientControls()}
            <View style={styles.logHeader}>
              <Text style={styles.sectionTitle}>Message Log</Text>
              <Button title="Clear Chat" onPress={clearChat} color="red" />
            </View>
          </>
        </MessageList>
        <MessageInput
          message={message}
          setMessage={setMessage}
          onSend={mode === 'server' ? sendMessageFromServer : sendMessageFromClient}
          disabled={!message.trim() || (mode === 'server' ? !isServerRunning : !isClientConnected)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  status: {
    marginTop: 10,
    fontStyle: 'italic',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default App;