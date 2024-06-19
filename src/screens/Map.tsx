import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchCrowdData } from '../utils/crowdSourceAPI';

const Map = () => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  const [minLevel, setMinLevel] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await fetchCrowdData();
        setMapData(data);
        const levels = data.map(d => d.waterlevel);
        setMinLevel(Math.min(...levels));
        setMaxLevel(Math.max(...levels));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching map data:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to fetch map data. Please try again.');
      }
    };

    fetchMapData();
  }, []);

  const interpolateColor = (color1, color2, factor) => {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return result;
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  };

  const rgbToHex = (rgb) => {
    return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`;
  };

  const getColorByWaterLevel = (waterlevel, minLevel, maxLevel) => {
    const lowColor = hexToRgb("#00FF00"); // Green
    const highColor = hexToRgb("#FF0000"); // Red
    const factor = (waterlevel - minLevel) / (maxLevel - minLevel);
    const interpolatedColor = interpolateColor(lowColor, highColor, factor);
    return rgbToHex(interpolatedColor);
  };

  const createCustomIcon = (waterlevel, minLevel, maxLevel) => {
    const color = getColorByWaterLevel(waterlevel, minLevel, maxLevel);
    return `
      <div style="
        background-color: ${color};
        border-radius: 30%;
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        font-weight: bold;
        font-size: 14px;
        text-align: center;
        line-height: 40px;
        box-shadow: 0 0 5px rgba(0,0,0,0.3);
      ">
        ${waterlevel.toFixed()}
      </div>
    `;
  };

  const generateMarkersScript = (markers) => {
    return markers.map(marker => {
      const iconHtml = createCustomIcon(marker.waterlevel, minLevel, maxLevel);
      return `
        L.marker([${marker.latitude}, ${marker.longitude}], { icon: L.divIcon({ html: \`${iconHtml}\`, className: "" }) })
          .bindPopup('<b>Water Level:</b> ${marker.waterlevel.toFixed(2)} mm')
          .addTo(map);
      `;
    }).join('');
  };

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
            var map = L.map('map').setView([19.0760, 72.8777], 12);

            L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=d42390ee-716f-47d9-b8e5-2b8b44c5d63f', {
              maxZoom: 18,
            }).addTo(map);

            ${generateMarkersScript(mapData)}

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
        onError={(error) => console.error('WebView error:', error)}
      />
      {loading && (
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
