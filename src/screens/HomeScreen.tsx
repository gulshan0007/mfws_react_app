import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput,Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchStations } from '../utils/widgetAPI';
import RainfallWidget from '../components/RainfallWidget';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ToastNotification from '../components/ToastNotification';

export default function HomeScreen() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0); 
  const [initialRefreshCount, setInitialRefreshCount] = useState(0); // State to trigger refresh

  const webviewRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 19.0760, // Mumbai latitude
    longitude: 72.8777, // Mumbai longitude
    latitudeDelta: 0.3,
    longitudeDelta: 0.3,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMapToast, setShowMapToast] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showMapAlert, setShowMapAlert] = useState(true); // State for showing alert

  useEffect(() => {
    const fetchStationsData = async () => {
      try {
        const data = await fetchStations();
        setStations(data.sort((a, b) => a.name.localeCompare(b.name))); // Sort stations alphabetically
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStationsData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshCount(prevCount => prevCount + 1);
    }, 1000);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
    }, 5000);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleMarkerPress = station => {
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
          selectedMarker: selectedMarker,
        })
      );
    }
  }, [region, stations, selectedMarker, modalVisible, refreshCount]); // Added refreshCount as dependency

  const handleSearchQueryChange = query => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = stations.filter(station =>
        station.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(stations); // Show all stations if query is empty
    }
  };

  const handleStationSelect = station => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
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

  const renderDropdown = () => (
    <ScrollView style={styles.dropdown}>
      {searchResults.map((result, index) => (
        <TouchableOpacity
          key={index}
          style={styles.dropdownItem}
          onPress={() => handleStationSelect(result)}
        >
          <Text style={styles.dropdownItemText}>{result.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const getTomorrowDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-IN', options).format(tomorrow);
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Leaflet Map</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"  />
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
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
        }).addTo(map);
        var markers = [];
        document.addEventListener('message', function(event) {
          var data = JSON.parse(event.data);
          var lat = data.latitude;
          var lng = data.longitude;
          var stations = data.stations;
          var selectedMarker = data.selectedMarker;
          map.setView([lat, lng], 10);
          markers.forEach(function(marker) {
            map.removeLayer(marker);
          });
          markers = [];
          stations.forEach(function(station) {
            var isSelected = selectedMarker && selectedMarker.id === station.id;
            var radius = isSelected ? 16 : 8;
            var color;
            if (station.rainfall > 204.4) {
              color = 'red';
            }
            else if (station.rainfall > 115.5) {
              color = 'orange';
            }
            else if (station.rainfall > 64.4) {
              color = 'yellow';
            }
            else if (station.rainfall > 15.5) {
              color = 'skyblue';
            }
            else if (station.rainfall > 0) {
              color = 'lightgreen';
            }
            else {
              color = 'grey';
            }
            var circleMarker = L.circleMarker([station.latitude, station.longitude], {
              color: 'black',
              fillColor: color,
              fillOpacity: 1,
              radius: radius,
            }).addTo(map);
            circleMarker.on('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify(station));
            });
            markers.push(circleMarker);
          });
        });
      </script>
    </body>
    </html>
  `;

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1); // Increment refreshCount to trigger useEffect
  };

  return (
    <View style={styles.container}>
      {showMapToast && (
        <ToastNotification
          message="Click colored dots on the map!!"
          onClose={() => setShowMapToast(false)}
        />
      )}
      

      {/* {showMapAlert && ( // Show the alert if showMapAlert is true
        <TouchableOpacity style={styles.alertContainer} onPress={() => setShowMapAlert(false)}>
          <Text style={styles.alertText}>
            If the station markers are not appearing on the map, tap refresh button.
          </Text>
          <TouchableOpacity style={styles.closeButton1} onPress={() => setShowMapAlert(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )} */}
            <Text style={styles.heading}>Experimental Rainfall Forecast</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Station..."
          placeholderTextColor="black"
          value={searchQuery}
          onFocus={() => setShowDropdown(true)}
          onChangeText={handleSearchQueryChange}
        />
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => {
            setShowDropdown(prev => !prev);
            if (!showDropdown) setSearchResults(stations);
          }}
        >
          <FontAwesome name={showDropdown ? 'caret-up' : 'caret-down'} size={40} color="black" />
        </TouchableOpacity>
      </View>
      {showDropdown && renderDropdown()}

      {stations ? (
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
      ) : (
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


      <View style={styles.legendContainer}>
      <Text style={styles.dateText}>Rainfall Forecast ({getTomorrowDate()})</Text>
      <View style={{ flexDirection: 'row', alignItems: 'left' }}>
    <View style={[styles.legendItem, { backgroundColor: 'red' }]} />
    <Text style={styles.legendText}>Extremely Heavy Rainfall</Text>
  </View>
  <View style={{ flexDirection: 'row', alignItems: 'left' }}>
    <View style={[styles.legendItem, { backgroundColor: 'orange' }]} />
    <Text style={styles.legendText}>Very Heavy Rainfall</Text>
  </View>
  <View style={{ flexDirection: 'row', alignItems: 'left' }}>
        <View style={[styles.legendItem, { backgroundColor: 'yellow' }]} />
        <Text style={styles.legendText}>Heavy Rainfall</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'left' }}>
        <View style={[styles.legendItem, { backgroundColor: 'skyblue' }]} />
        <Text style={styles.legendText}>Moderate Rainfall</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'left' }}>
        <View style={[styles.legendItem, { backgroundColor: 'lightgreen' }]} />
        <Text style={styles.legendText}>Light Rainfall</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'left' }}>
        <View style={[styles.legendItem, { backgroundColor: 'grey' }]} />
        <Text style={styles.legendText}>No Rainfall</Text>
        </View>
      </View>

      <Image
        source={require('../assets/mf.png')} // Replace with your image path
        style={{
          position: 'absolute',
          bottom: 90, 
          left: 10,// Adjust as needed
          alignSelf: 'center',
          opacity: 0.7, // Adjust opacity as needed
          height: 50, // Adjust height as needed
          width: 80, // Adjust width as needed
        }}
      />

      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <FontAwesome name="refresh" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
    marginTop: 0,
    marginBottom: 0,
    color: 'black',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  dropdownButton: {
    marginLeft: 10,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    right: 40,
    left: 10,
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    zIndex: 1,
    marginTop: 38,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    
  },
  dropdownItemText: {
    color: 'black',
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
  closeButton1: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
    
  },
  dateText: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 1,
    color: 'black',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  alertContainer: {
    position: 'relative',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'tomato',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  alertText: {
    color: 'white',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 27,
    right: 5,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 85,
    right: 10,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'left',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    zIndex: 1,
  },
  legendItem: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  legendText: {
    fontSize: 8,
    marginRight: 10,
    color: 'black',
  },
});
