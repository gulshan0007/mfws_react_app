import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchStations } from '../utils/widgetAPI';
import RainfallWidget from '../components/RainfallWidget';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Video from 'react-native-video'; // Import Video component from react-native-video

const HomeScreen = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0); // State to trigger refresh
  const [videoLoaded, setVideoLoaded] = useState(false); // State to control video loading

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
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showMapAlert, setShowMapAlert] = useState(true); // State for showing alert

  useEffect(() => {
    const fetchStationsData = async () => {
      try {
        const data = await fetchStations();
        setStations(data.sort((a, b) => a.name.localeCompare(b.name))); // Sort stations alphabetically
        setVideoLoaded(true); // Mark video as loaded once data is fetched
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStationsData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoLoaded(true); // Simulate video loading after 4 seconds
    }, 4000);

    return () => clearTimeout(timer);
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
  }, [region, stations, selectedMarker, modalVisible, refreshCount]);

  const handleSearchQueryChange = query => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = stations.filter(station =>
        station.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(stations);
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
        L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=d42390ee-716f-47d9-b8e5-2b8b44c5d63f', {
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
    setRefreshCount(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      {videoLoaded ? (
        <>
          {showMapAlert && (
            <TouchableOpacity style={styles.alertContainer} onPress={() => setShowMapAlert(false)}>
              <Text style={styles.alertText}>
                If the station markers are not appearing on the map, tap refresh button.
              </Text>
              <TouchableOpacity style={styles.closeButton1} onPress={() => setShowMapAlert(false)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Station..."
              placeholderTextColor="black"
              value={searchQuery}
              onFocus={() => {
                setShowDropdown(true);
                setSearchResults(stations);
              }}
              onChangeText={handleSearchQueryChange}
            />
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <FontAwesome name={showDropdown ? 'caret-up' : 'caret-down'} size={20} color="black" />
            </TouchableOpacity>
          </View>
          {showDropdown && renderDropdown()}

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

          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <FontAwesome name="refresh" size={24} color="black" />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Video
            source={require('../assets/loading.mp4')} // Replace with your actual video source
            style={styles.video}
            resizeMode="cover"
            onLoad={() => setVideoLoaded(true)} // Set videoLoaded to true once the video is loaded
            onError={error => console.error('Error loading video:', error)}
            repeat
          />
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    right: 20,
    left: 20,
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
    zIndex: 1,
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
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default HomeScreen;
