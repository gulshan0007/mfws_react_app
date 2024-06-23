import React, { useState, useEffect } from 'react';
import { fetchLocationData, sendFormData } from '../utils/crowdSourceAPI';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Image, PermissionsAndroid, Platform, Modal } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { Picker } from '@react-native-picker/picker';
import WebView from 'react-native-webview';

const FormCrowd = () => {
  const [feet, setFeet] = useState<string | null>(null);
  const [inches, setInches] = useState<string | null>(null);
  const [waterlevelfactor, setWaterlevelfactor] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [activeOption, setActiveOption] = useState<number>(0);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; long: number } | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; long: number } | null>(null);
  const [csPinToggle, setCsPinToggle] = useState<boolean>(false);
  const [csPinDropLocation, setCsPinDropLocation] = useState<{ lat: number; long: number } | null>(null);

  const handleSubmit = async () => {
    if (waterlevelfactor === 0) {
      setMessage('Please select water level!!!');
      return;
    }

    if (!feet || !inches) {
      setMessage('Please enter your height!!!');
      return;
    }

    if (!location && !selectedMapLocation) {
      setMessage('Please enter location or select one from the map!!!');
      return;
    }

    const adjustedWaterLevel = (parseInt(feet) * 12 + parseInt(inches)) * waterlevelfactor;
    const adjustedFeet = Math.floor(adjustedWaterLevel / 12);
    const adjustedInches = adjustedWaterLevel % 12;

    try {
      if (selectedMapLocation) {
        await sendData({ latitude: selectedMapLocation.lat, longitude: selectedMapLocation.long, feet: adjustedFeet, inches: adjustedInches });
      } else if (gpsLocation) {
        await sendData({ latitude: gpsLocation.lat, longitude: gpsLocation.long, feet: adjustedFeet, inches: adjustedInches });
      } else if (csPinToggle && csPinDropLocation) {
        await sendData({ latitude: csPinDropLocation.lat, longitude: csPinDropLocation.long, feet: adjustedFeet, inches: adjustedInches });
      } else {
        await sendData({ latitude: null, longitude: null, feet: adjustedFeet, inches: adjustedInches });
      }
      setModalVisible(true); // Show modal on successful submission
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage('Error: Unable to submit form.');
    }
  };

  const sendData = async (data: { latitude: number | null; longitude: number | null; feet: number; inches: number }) => {
    const formData = {
      feet: data.feet,
      inch: data.inches,
      location: location || (selectedMapLocation ? `Latitude: ${selectedMapLocation.lat}, Longitude: ${selectedMapLocation.long}` : ''),
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
    if(selectedMapLocation){
      setCsPinDropLocation(selectedMapLocation)
    }
    setMapModalVisible(false); // Close map modal if open
  };

  useEffect(() => {
    if (csPinDropLocation) {
      (async () => {
        
          const currLocation = await fetchLocationData({ lat: csPinDropLocation.lat, long: csPinDropLocation.long });
          console.log(currLocation);
          setLocation(currLocation);
        
      })();
    }
  }, [csPinDropLocation]);

  const closeModal = () => {
    setModalVisible(false);
    setFeet(null);
    setInches(null);
    setWaterlevelfactor(0);
    setLocation('');
    setFeedback('');
    setMessage('');
    setActiveOption(0);
    setGpsLocation(null);
    setSelectedMapLocation(null);
    setCsPinToggle(false);
    setCsPinDropLocation(null);
  };

  const mapHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Leaflet Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      #map { height: 100%; }
      html, body { height: 100%; margin: 0; padding: 0; }
    </style>
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      // Define the region coordinates (can be dynamically set as needed)
      var region = { latitude: 19.0760, longitude: 72.8777 }; // Example coordinates for Mumbai

      var map = L.map('map').setView([region.latitude, region.longitude], 12);
      L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=d42390ee-716f-47d9-b8e5-2b8b44c5d63f', {
        maxZoom: 18,
      }).addTo(map);

      // Initialize a fixed marker at the center of the map
      var marker = L.marker(map.getCenter(), {
        draggable: true // Make the marker draggable
      }).addTo(map);

      // Update marker position when map is dragged
      map.on('move', function(e) {
        marker.setLatLng(map.getCenter()); // Update marker position to map center
        var position = marker.getLatLng();

        // Send the coordinates back to React Native
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat: position.lat, long: position.lng }));
      });

      // Event listener for dragging marker
      marker.on('dragend', function(event) {
        var marker = event.target;
        var position = marker.getLatLng();

        // Send the coordinates back to React Native
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat: position.lat, long: position.lng }));
      });

    </script>
  </body>
  </html>
`;



  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit Data</Text>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
        {gpsLocation ? (
          <TouchableOpacity style={[styles.locationButton, styles.locationButtonDisabled]}>
            <Text style={styles.buttonText}>Using current location...</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={getGps} style={[styles.locationButton, csPinToggle || mapModalVisible ? styles.locationButtonDisabled : styles.locationButtonActive]}>
            <Text style={styles.buttonText}>Use my current location</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setMapModalVisible(true)} style={[styles.locationButton, csPinToggle || gpsLocation ? styles.locationButtonDisabled : styles.locationButtonActive]}>
          <Text style={styles.buttonText}>Select location from map</Text>
        </TouchableOpacity>

        <View style={styles.heightContainer}>
  <Text style={styles.label}>Height:</Text>
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={feet}
      onValueChange={(itemValue) => setFeet(itemValue)}
      style={[styles.picker, { color: 'black' }]}
      itemStyle={styles.pickerItem}
    >
      <Picker.Item label="In Feet" value={null} />
      <Picker.Item label="0" value="0"  />
      <Picker.Item label="1" value="1"  />
      <Picker.Item label="2" value="2"  />
      <Picker.Item label="3" value="3"  />
      <Picker.Item label="4" value="4"  />
      <Picker.Item label="5" value="5" />
      <Picker.Item label="6" value="6" />
      <Picker.Item label="7" value="7" />
    </Picker>

    <Picker
      selectedValue={inches}
      onValueChange={(itemValue) => setInches(itemValue)}
      style={styles.picker}
      itemStyle={styles.pickerItem}
    >
      <Picker.Item label="In Inches" value={null} />
      <Picker.Item label="0" value="0" />
      <Picker.Item label="1" value="1"/>
      <Picker.Item label="2" value="2"  />
      <Picker.Item label="3" value="3"  />
      <Picker.Item label="4" value="4" />
      <Picker.Item label="5" value="5"  />
      <Picker.Item label="6" value="6"  />
      <Picker.Item label="7" value="7"  />
      <Picker.Item label="8" value="8" />
      <Picker.Item label="9" value="9" />
      <Picker.Item label="10" value="10" />
      <Picker.Item label="11" value="11"  />
    </Picker>
  </View>
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
          value={location} // Display selected location here
          onChangeText={(text) => setLocation(text)}
          editable={!gpsLocation}
        />
        <Text style={styles.label}>Feedback:</Text>
        <TextInput
          placeholder="Enter your feedback (optional)"
          style={styles.feedbackInput}
          value={feedback}
          onChangeText={(text) => setFeedback(text)}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{message}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.modalButton}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={false}
          visible={mapModalVisible}
          onRequestClose={() => setMapModalVisible(false)}
        >
          <View style={{ flex: 1 }}>
            <WebView
              originWhitelist={['*']}
              source={{ html: mapHtml }}
              onMessage={(event) => {
                const location = JSON.parse(event.nativeEvent.data);
                setSelectedMapLocation({ lat: location.lat, long: location.long });
              }}
            />

            <TouchableOpacity onPress={handlePinDropToggle} style={styles.confirmButton}>
              <Text style={styles.buttonText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007bff',
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  locationButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  locationButtonActive: {
    backgroundColor: '#28a745',
  },
  locationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 8,
  },
  picker: {
    flex: 1,
    marginLeft: 5,
    color: 'black', 
  },
  pickerItem: {
    color: 'black', // Set the text color of each item
  },
  heightContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
    color: 'black',
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
    width: 60,
    height: 80,
    resizeMode: 'contain',
  },
  waterLevelText: {
    marginTop: 5,
    textAlign: 'center',
    color: 'black',
    fontSize: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    marginBottom: 10,
    color: 'black',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: 'black'
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});


export default FormCrowd;
