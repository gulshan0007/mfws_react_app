import React, { useState, useEffect } from 'react';
import { fetchLocationData, sendFormData } from '../utils/crowdSourceAPI';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const FormCrowd = ({ setCsPinDropLocation, csPinDropLocation, setCsPinToggle, csPinToggle }) => {
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

    const adjustedWaterLevel = (parseInt(feet) * 12 + parseInt(inches)) * waterlevelfactor;
    const adjustedFeet = Math.floor(adjustedWaterLevel / 12);
    const adjustedInches = adjustedWaterLevel % 12;

    try {
      if (gpsLocation) {
        await sendData({ latitude: gpsLocation.lat, longitude: gpsLocation.long, feet: adjustedFeet, inches: adjustedInches });
      } else if (csPinToggle && csPinDropLocation) {
        await sendData({ latitude: csPinDropLocation.lat, longitude: csPinDropLocation.long, feet: adjustedFeet, inches: adjustedInches });
      } else {
        await sendData({ latitude: null, longitude: null, feet: adjustedFeet, inches: adjustedInches });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Error: Unable to submit form.');
    }
  };

  const sendData = async (data: { latitude: number | null; longitude: number | null; feet: number; inches: number }) => {
    const formData = {
      feet: feet,
      inches: inches,
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

  const handlePinDropToggle = () => {
    if (!gpsLocation) {
      setCsPinToggle(!csPinToggle);
      setCsPinDropLocation(null);
      setLocation('');
    }
  };

  useEffect(() => {
    if (csPinToggle) {
      (async () => {
        try {
          const currLocation = await fetchLocationData({ lat: csPinDropLocation.lat, long: csPinDropLocation.long });
          setLocation(currLocation);
          console.log('Current location:', currLocation);
        } catch (error) {
          console.error('Error fetching location data:', error);
        }
      })();
    }
  }, [csPinToggle, csPinDropLocation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit Data</Text>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {gpsLocation ? (
          <TouchableOpacity style={[styles.locationButton, styles.locationButtonDisabled]}>
            <Text style={styles.buttonText}>Using current location...</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={getGps} style={[styles.locationButton, csPinToggle ? styles.locationButtonDisabled : styles.locationButtonActive]}>
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
          style={[styles.input, gpsLocation && styles.inputDisabled]}
          placeholder="Location"
          placeholderTextColor="black"
          value={location}
          onChangeText={(text) => setLocation(text)}
          editable={!gpsLocation}
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

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    marginVertical: 20,
    color: 'black',
  },
  formContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  locationButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationButtonActive: {
    backgroundColor: '#3b82f6',
  },
  locationButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
  },
  heightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: 'black',
    marginVertical: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    color: 'black',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
  },
  textArea: {
    height: 50,
    width: 250,
  },
  waterLevelContainer: {
    width: '100%',
    marginVertical: 10,
  },
  waterLevelOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  waterLevelOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '22%',
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  waterLevelOptionActive: {
    borderColor: '#3b82f6',
  },
  waterLevelImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  waterLevelText: {
    marginTop: 5,
    textAlign: 'center',
    color: 'black',
  },
  message: {
    textAlign: 'center',
    color: 'red',
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
});

export default FormCrowd;
