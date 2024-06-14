import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchCrowdData } from '../utils/crowdSourceAPI';

const Map = () => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await fetchCrowdData(); // Fetch crowd data (markers data)
        setMapData(data); // Set map data state
        setLoading(false); // Set loading to false after data is fetched
        console.log('Fetched map data:', data);
      } catch (error) {
        console.error('Error fetching map data:', error);
        setLoading(false); // Handle loading state in case of error
        Alert.alert('Error', 'Failed to fetch map data. Please try again.');
      }
    };

    fetchMapData();
  }, []);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>Leaflet Map</title>
        <meta name="viewport" content="initial-scale=1.0">
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          #map { height: 100%; width: 100%; }
          body { margin: 0; padding: 0; }
          html, body, #map { height: 100%; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            var map = L.map('map').setView([19.0760, 72.8777], 12); // Set initial map view

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
            }).addTo(map);

            var markers = ${JSON.stringify(mapData)}; // Get markers data from React Native

            markers.forEach(function(marker) {
              L.marker([marker.latitude, marker.longitude]).addTo(map)
                .bindPopup('<b>Water Level:</b> ' + marker.waterlevel.toFixed(2) + ' mm')
                .openPopup();
            });

            console.log("Map and markers have been initialized");
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
        onError={(error) => console.error('WebView error:', error)} // Add error handling
      />
      {loading && ( // Display loading indicator conditionally
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default Map;
