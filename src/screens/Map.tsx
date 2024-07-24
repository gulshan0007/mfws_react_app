import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, Text, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchCrowdData } from '../utils/crowdSourceAPI';

const Map = ({ csPinToggle, csPinDropLocation, setCsPinDropLocation }) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await fetchCrowdData();
        setMapData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching map data:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to fetch map data. Please try again.');
      }
    };

    // Fetch initial data
    fetchMapData();

    // Set interval to fetch data every 1 second
    const interval = setInterval(fetchMapData, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
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

  const createCustomIcon = (feet, inch) => {

    const getColorByFeetAndInches = (feet, inch) => {
      const totalInches = feet * 12 + inch;
      if (totalInches < 24) {
        return "#FFFF00"; 
      } else if (totalInches >= 24 && totalInches <= 60) {
        return "#FFA500"; 
      } else {
        return "#FF0000";
      }
    };

    // if (waterlevel === undefined) {
    //   return `
    //     <div style="
    //       background-color: #CCCCCC;
    //       border-radius: 30%;
    //       width: 25px;
    //       height: 25px;
    //       display: flex;
    //       align-items: center;
    //       justify-content: center;
    //       color: black;
    //       font-weight: bold;
    //       font-size: 14px;
    //       text-align: center;
    //       line-height: 40px;
    //       box-shadow: 0 0 5px rgba(0,0,0,0.3);
    //     ">
    //       N/A
    //     </div>
    //   `;
    // }

    const color = getColorByFeetAndInches(feet, inch);
        return `
       <div style="
      background-color: ${color};
      border-radius: 30%;
      width: 40px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: black;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
      line-height: 1.2;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    ">
      ${feet}'${inch}"
    </div>
    `;
  };
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    };
    return date.toLocaleTimeString('en-US', options);
};


const generateMarkersScript = (markers) => {
  const latestMarker = markers.reduce((latest, marker) => {
    return marker.timestamp > latest.timestamp ? marker : latest;
  }, markers[0]);

  return markers.map(marker => {
    const iconHtml = createCustomIcon(marker.feet, marker.inch);
    const popupHtml = `
      <div>
      <h4 class="text-sm font-semibold text-white" style="color: black;">Name: ${marker.name}</h4>
        <h4 class="text-lg font-semibold text-blue-600" style="color: blue;">Reported Water Level: ${marker.feet}' ${marker.inch}"</h4>
        <h4 class="text-sm font-semibold text-green-600" style="color: green;">Location: ${marker.location}</h4>
        
        <h4 class="text-sm font-semibold text-red-600" style="color: red;">Time: ${formatTime(marker.timestamp)}</h4>
      </div>
    `;
    const markerScript = `
      var marker = L.marker([${marker.latitude}, ${marker.longitude}], { icon: L.divIcon({ html: \`${iconHtml}\`, className: "" }) })
        .bindPopup(\`${popupHtml}\`)
        .addTo(map);
    `;

    if (marker === latestMarker) {
      return `${markerScript} marker.openPopup();`;
    }

    return markerScript;
  }).join('');
};
  

  const handleMapClick = async (event) => {
    const { lat, lng } = event.latlng;
    setCsPinDropLocation({ lat, long: lng });
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
            var map = L.map('map').setView([19.0760, 72.8777], 10);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 18,
            }).addTo(map);

            ${generateMarkersScript(mapData)}

            if (${csPinToggle}) {
              map.on('click', function(e) {
                var lat = e.latlng.lat;
                var lng = e.latlng.lng;
                window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
              });
            }

            console.log("Map and markers have been initialized");
          });
        </script>
      </body>
    </html>
  `;

  const handleWebViewMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setCsPinDropLocation({ lat: data.lat, long: data.lng });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reported Flood Hotspots</Text>
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
        onMessage={handleWebViewMessage}
        onError={(error) => console.error('WebView error:', error)}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: 'black',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default Map;
