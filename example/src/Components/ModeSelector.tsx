import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { AppMode } from './types';

interface ModeSelectorProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode }) => (
  <View style={styles.modeSelector}>
    <TouchableOpacity
      style={[styles.modeButton, mode === 'server' && styles.activeMode]}
      onPress={() => setMode('server')}
    >
      <Text>Server Mode</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.modeButton, mode === 'client' && styles.activeMode]}
      onPress={() => setMode('client')}
    >
      <Text>Client Mode</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modeButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeMode: {
    backgroundColor: '#e0e0e0',
    borderColor: '#999',
  },
});

export default ModeSelector;