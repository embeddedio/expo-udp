import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
  flatListRef: React.RefObject<FlatList<Message>>;
  children: React.ReactNode;
}

const MessageList: React.FC<MessageListProps> = ({ messages, flatListRef, children }) => (
  <FlatList<Message>
    ref={flatListRef}
    data={messages}
    keyExtractor={(_, index) => index.toString()}
    renderItem={({ item }) => (
      <View
        style={[
          styles.messageBubble,
          item.sender === 'me' ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>{item.timestamp.toLocaleTimeString()}</Text>
      </View>
    )}
    ListHeaderComponent={children}
    style={styles.messageList}
    keyboardShouldPersistTaps="always"
    contentContainerStyle={{ paddingBottom: 10 }}
  />
);

const styles = StyleSheet.create({
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default MessageList;