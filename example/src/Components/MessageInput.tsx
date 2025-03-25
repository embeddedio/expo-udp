import React from 'react';
import { KeyboardAvoidingView, View, TextInput, Button, Platform, StyleSheet } from 'react-native';

interface MessageInputProps {
  message: string;
  setMessage: (text: string) => void;
  onSend: () => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ message, setMessage, onSend, disabled }) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    style={styles.messageInputContainer}
  >
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.messageInput}
        placeholder="Type a message..."
        value={message}
        onChangeText={setMessage}
        multiline
        returnKeyType="default"
      />
      <Button
        title="Send"
        onPress={onSend}
        disabled={disabled}
      />
    </View>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  messageInputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 100,
  },
});

export default MessageInput;