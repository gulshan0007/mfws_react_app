import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import axios from 'axios';

const MessageScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [waterLevelFactor, setWaterLevelFactor] = useState(0);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    // Validate form fields
    if (!name || !heightFeet || !heightInches || !waterLevelFactor || !location) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Calculate total height in inches
    const totalHeightInInches = parseInt(heightFeet) * 12 + parseInt(heightInches);

    // Calculate water level adjusted
    const waterLevelAdjusted = totalHeightInInches * waterLevelFactor;

    // Prepare data
    const data = {
      name,
      waterlevel: waterLevelAdjusted,
      location,
    };

    // Send data to server
    try {
      // Replace with your actual API endpoint
      // const response = await axios.post('http://your-api-endpoint.com/submit', data);
      // setMessage('Data submitted successfully');
    } catch (error) {
      console.error('Error submitting data:', error);
      setMessage('Failed to submit data');
    }
  };

  const handleOption = (value: number) => {
    setWaterLevelFactor(value);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Report Flood in your Area!!</Text>
        <Text style={styles.title2}>Enter your Height</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.feetInput]}
            placeholder="Feet"
            value={heightFeet}
            onChangeText={setHeightFeet}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.inchesInput]}
            placeholder="Inches"
            value={heightInches}
            onChangeText={setHeightInches}
            keyboardType="numeric"
          />
        </View>
        
        <View style={styles.waterLevelContainer}>
          <Text style={styles.waterLevelText}>Water Level (choose one):</Text>
          <View style={styles.waterLevelOptions}>
            {/* First pair */}
            <View style={styles.optionPair}>
              <TouchableOpacity
                style={[styles.option, waterLevelFactor === 0.4 && styles.activeOption]}
                onPress={() => handleOption(0.4)}
              >
                <Image source={require('../assets/crowdsource/1.png')} style={styles.image} />
                <Text style={styles.optionText}>Low (Ankle)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.option, waterLevelFactor === 0.9 && styles.activeOption]}
                onPress={() => handleOption(0.9)}
              >
                <Image source={require('../assets/crowdsource/3.png')} style={styles.image} />
                <Text style={styles.optionText}>High (Waist)</Text>
              </TouchableOpacity>
            </View>

            {/* Second pair */}
            <View style={styles.optionPair}>
              <TouchableOpacity
                style={[styles.option, waterLevelFactor === 0.6 && styles.activeOption]}
                onPress={() => handleOption(0.6)}
              >
                <Image source={require('../assets/crowdsource/2.png')} style={styles.image} />
                <Text style={styles.optionText}>Medium (Knee)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.option, waterLevelFactor === 0.9 && styles.activeOption]}
                onPress={() => handleOption(0.9)}
              >
                <Image source={require('../assets/crowdsource/4.png')} style={styles.image} />
                <Text style={styles.optionText}>Very High (Shoulder)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <TextInput
          style={styles.input}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        
        <Text style={styles.message}>{message}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  title2: {
    fontSize: 15,
    color: 'black',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#a8a8a8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 15,
    color: 'white',
    flex: 1,
  },
  waterLevelContainer: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterLevelText: {
    fontSize: 18,
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  waterLevelOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  optionPair: {
    flexDirection: 'column',
    marginHorizontal: 10,
  },
  option: {
    alignItems: 'center',
    marginBottom: 10,
  },
  activeOption: {
    transform: [{ scale: 1.1 }],
  },
  optionText: {
    color: 'black',
    marginTop: 5,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  message: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  },
  image: {
    width: 100,
    height: 100,
  },
  feetInput: {
    marginRight: 5,
    flex: 1,
  },
  inchesInput: {
    marginLeft: 5,
    flex: 1,
  },
});

export default MessageScreen;
