import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ToastNotification = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible((prevVisible) => !prevVisible);
    }, 1000); // Toggle visibility every 0.5 seconds

    const timer = setTimeout(() => {
      clearInterval(interval);
      onClose();
    }, 7000); // Close toast after 5 seconds

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <View style={[styles.container, { opacity: isVisible ? 1 : 0 }]}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 40,
    right: 20,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
    opacity: 1, // Initially visible
  },
  message: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    marginLeft: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ToastNotification;
