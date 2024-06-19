import React, { useState } from 'react';
import { fetchLocationData, sendFormData } from '../utils/crowdSourceAPI';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const FormCrowd = () => {
  const [feet, setFeet] = useState<string | null>(null);
  const [inches, setInches] = useState<string | null>(null);
  const [waterlevelfactor, setWaterlevelfactor] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [activeOption, setActiveOption] = useState<number>(0);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; long: number } | null>(null);

  const handleSubmit = async () => {
    if (waterlevelfactor === 0) {
      setMessage('Please select water level!!!');
      return;
    }

    if (!feet || !inches) {
      setMessage('Please enter your height!!!');
      return;
    }

    if (!location) {
      setMessage('Please enter location!!!');
      return;
    }

    const waterLevelAdjusted = waterlevelfactor * (30.48 * parseInt(feet!) + 2.54 * parseInt(inches!));

    try {
      if (gpsLocation) {
        await sendData({ waterLevelAdjusted, latitude: gpsLocation.lat, longitude: gpsLocation.long });
      } else {
        await sendData({ waterLevelAdjusted, latitude: null, longitude: null });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Error: Unable to submit form.');
    }
  };

  const sendData = async (data: { waterLevelAdjusted: number; latitude: number | null; longitude: number | null }) => {
    const formData = {
      waterlevel: data.waterLevelAdjusted,
      location: location,
      latitude: data.latitude,
      longitude: data.longitude,
      feedback: feedback,
    };

    try {
      const response = await sendFormData(formData);
      setMessage(response.message);
    } catch (error) {
      console.error('Error storing data:', error);
      setMessage('Error: Unable to store data.');
    }
  };

  const handleOption = (value: number, option: number) => () => {
    setWaterlevelfactor(value);
    setActiveOption(option);
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const rationale: PermissionsAndroid.Rationale = {
          title: 'Location Permission',
          message: 'This app needs access to your location to get the current GPS coordinates.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        };
  
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          rationale
        );
  
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getGps = async () => {
    const hasLocationPermission = await requestLocationPermission();

    if (!hasLocationPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to get the current location.');
      return;
    }

    const timeoutId = setTimeout(() => {
      
      
    }, 15000); // Timeout after 15 seconds


    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const currLocation = await fetchLocationData({ lat: position.coords.latitude, long: position.coords.longitude });
          setLocation(currLocation);
          setGpsLocation({ lat: position.coords.latitude, long: position.coords.longitude });
        } catch (error) {
          console.error('Error fetching location data:', error);
        }
      },
      (error) => {
        console.error('Error getting GPS location:', error);
        Alert.alert('Error', 'Error getting GPS location.');
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit Data</Text>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {gpsLocation ? (
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.buttonText}>Using current location...</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={getGps} style={[styles.locationButton, styles.locationButtonActive]}>
            <Text style={styles.buttonText}>Use my current location</Text>
          </TouchableOpacity>
        )}

        <View style={styles.heightContainer}>
          <Text style={styles.label}>Your Height:</Text>
          <TextInput
            style={styles.input}
            placeholder="Feet"
            placeholderTextColor="black" 
            value={feet || ''}
            onChangeText={(text) => setFeet(text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Inches"
            placeholderTextColor="black" 
            value={inches || ''}
            onChangeText={(text) => setInches(text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.waterLevelContainer}>
          <Text style={styles.label}>Water Level (choose one):</Text>
          <View style={styles.waterLevelOptions}>
            <TouchableOpacity
              style={[styles.waterLevelOption, activeOption === 1 ? styles.waterLevelOptionActive : null]}
              onPress={handleOption(0.2, 1)}
            >
              <Image source={require('../assets/crowdsource/1.png')} style={styles.waterLevelImage} />
              <Text style={styles.waterLevelText}>Ankle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.waterLevelOption, activeOption === 2 ? styles.waterLevelOptionActive : null]}
              onPress={handleOption(0.4, 2)}
            >
              <Image source={require('../assets/crowdsource/2.png')} style={styles.waterLevelImage} />
              <Text style={styles.waterLevelText}>Knee</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.waterLevelOption, activeOption === 3 ? styles.waterLevelOptionActive : null]}
              onPress={handleOption(0.6, 3)}
            >
              <Image source={require('../assets/crowdsource/3.png')} style={styles.waterLevelImage} />
              <Text style={styles.waterLevelText}>Waist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.waterLevelOption, activeOption === 4 ? styles.waterLevelOptionActive : null]}
              onPress={handleOption(0.9, 4)}
            >
              <Image source={require('../assets/crowdsource/4.png')} style={styles.waterLevelImage} />
              <Text style={styles.waterLevelText}>Neck & above</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Location:</Text>
        <TextInput
          style={styles.input}
          placeholder="Location"
          placeholderTextColor="black" 
          value={location}
          onChangeText={(text) => setLocation(text)}
        />

        <Text style={styles.label}>Feedback:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Optional"
          placeholderTextColor="black" 
          multiline
          value={feedback}
          onChangeText={(text) => setFeedback(text)}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <Text style={styles.message}>{message}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  locationButton: {
    backgroundColor: '#4287f5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  locationButtonActive: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  heightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    color: 'white',
    marginBottom: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    color: 'black',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    color: 'black',
  },
  waterLevelContainer: {
    marginBottom: 20,
  },
  waterLevelOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterLevelOption: {
    alignItems: 'center',
  },
  waterLevelOptionActive: {
    borderColor: '#ff0000',
    borderWidth: 2,
  },
  waterLevelImage: {
    width: 80,
    height: 80,
  },
  waterLevelText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#0056b3',
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  message: {
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default FormCrowd;
