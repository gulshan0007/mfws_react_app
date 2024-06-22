import React from 'react';
import { StyleSheet, View, ActivityIndicator, Dimensions } from 'react-native';
import Video from 'react-native-video';

const SplashScreen = () => {
  // Adjust the source path as per your project structure
  const videoSource = require('./loading.mp4');

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Video
        source={videoSource}
        style={styles.backgroundVideo}
        resizeMode="cover"
        shouldPlay
        isLooping
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  backgroundVideo: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default SplashScreen;
