import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { PERMISSIONS, request } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { fetchStations } from '../utils/widgetAPI';
import RainfallWidget from '../components/RainfallWidget';

export default function HomeScreen() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const webviewRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 19.0760, // Mumbai latitude
    longitude: 72.8777, // Mumbai longitude
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchStationsData = async () => {
      try {
        const data = await fetchStations();
        setStations(data);
        setLoading(false); // Set loading to false after data is fetched
        requestLocationPermission();
      } catch (error) {
        console.error('Error fetching stations:', error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchStationsData();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (granted !== 'granted') {
        // Alert.alert(
        //   'Permission Denied',
        //   'Location permission is required to show the nearest station.',
        //   [{ text: 'OK' }]
        // );
        return;
      }

      locateCurrentPosition();
    } catch (err) {
      console.warn(err);
    }
  };

  const locateCurrentPosition = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const nearestStation = findNearestStation(latitude, longitude);
        if (nearestStation) {
          const newRegion = {
            latitude: nearestStation.latitude,
            longitude: nearestStation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };

          setRegion(newRegion);
          handleMarkerPress(nearestStation);
        } else {
          const newRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };

          setRegion(newRegion);
        }
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const findNearestStation = (latitude, longitude) => {
    if (stations.length === 0) return null;

    let nearestStation = null;
    let minDistance = Number.MAX_VALUE;

    stations.forEach(station => {
      const distance = getDistanceFromLatLonInKm(
        latitude,
        longitude,
        station.latitude,
        station.longitude
      );

      if (distance < minDistance) {
        nearestStation = station;
        minDistance = distance;
      }
    });

    return nearestStation;
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const deg2rad = deg => {
    return deg * (Math.PI / 180);
  };

  const handleMarkerPress = station => {
    console.log(station);
    setSelectedStation(station);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStation(null);
  };

  useEffect(() => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(
        JSON.stringify({
          latitude: region.latitude,
          longitude: region.longitude,
          stations: stations,
        })
      );
    }
  }, [region, stations]);

  const handleSearchQueryChange = query => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = stations.filter(station =>
        station.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleStationSelect = station => {
    setSearchQuery('');
    setSearchResults([]);
    zoomToStation(station);
  };

  const zoomToStation = station => {
    const newRegion = {
      latitude: station.latitude,
      longitude: station.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
    setRegion(newRegion);
    handleMarkerPress(station);
  };

  const leafletHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Leaflet Map</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>
      #map {
        height: 100%;
        width: 100%;
      }
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script>
      var map = L.map('map').setView([${region.latitude}, ${region.longitude}], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);
      var markers = [];
      document.addEventListener('message', function(event) {
        console.log('Received message from React Native:', event.data);
        var data = JSON.parse(event.data);
        var lat = data.latitude;
        var lng = data.longitude;
        var stations = data.stations;
        map.setView([lat, lng], 10);
        markers.forEach(function(marker) {
          map.removeLayer(marker);
        });
        markers = [];
        stations.forEach(function(station) {
          console.log('Adding marker for station:', station);
          var marker = L.marker([station.latitude, station.longitude]).addTo(map);
          marker.bindPopup('<b>' + station.name + '</b>');
          marker.on('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify(station));
          });
          markers.push(marker);
        });
      });
    </script>
  </body>
  </html>
  `;
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Station..."
          value={searchQuery}
          onChangeText={handleSearchQueryChange}
          />
          {searchResults.length > 0 && (
          <View style={styles.searchResults}>
          {searchResults.map((result, index) => (
          <TouchableOpacity
          key={index}
          style={styles.searchResultItem}
          onPress={() => handleStationSelect(result)}
          >
          <Text>{result.name}</Text>
          </TouchableOpacity>
          ))}
          </View>
          )}
          </View>
          <WebView
    ref={webviewRef}
    originWhitelist={['*']}
    source={{ html: leafletHTML }}
    style={styles.map}
    javaScriptEnabled={true}
    domStorageEnabled={true}
    onMessage={(event) => {
      const data = JSON.parse(event.nativeEvent.data);
      handleMarkerPress(data);
    }}
  />
  
  {loading && (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  )}

  <Modal
    visible={modalVisible}
    animationType="slide"
    transparent={true}
    onRequestClose={closeModal}
  >
    <View style={styles.modalContainer}>
      <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      {selectedStation && <RainfallWidget selectedOption={selectedStation} />}
    </View>
  </Modal>
</View>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black with 50% opacity
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
  },
  searchResults: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  searchResultItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  map: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white background
  },
});

