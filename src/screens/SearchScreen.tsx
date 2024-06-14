import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { BarChart } from 'react-native-chart-kit';

// Dummy markers for the map
const dummyMarkers = [
  { position: [19.12416667, 72.84694444], name: "Andheri Subway (bandh)" },
  { position: [19.12416867, 72.84685544], name: "Andheri Subway Pole (Alternate location)" },
  { position: [19.03127051, 72.85837318], name: "Gandhi Market below the King Circle bridge" },
  { position: [19.00870649, 72.84182174], name: "Hindmata (Pole 1)" },
  { position: [19.07529221, 72.84067776], name: "Khar Subway" },
  { position: [19.07525531, 72.84044246], name: "Khar subway (alternate location pole)" },
  { position: [19.07351796, 72.84974291], name: "Mumbai university" },
  { position: [18.97377629, 72.82290942], name: "Nair Hospital (Outside HDFC bank)" },
  { position: [18.9740177, 72.82299581], name: "Nair hospital (alternate location street pole)" },
  { position: [18.96205825, 72.81331529], name: "Nana chowk (Shri Krishna Hotel)" },
  { position: [19.06087774, 72.89412691], name: "16th Postal colony road" },
  { position: [19.13038919, 72.89581639], name: "BMC's 8 MLD plant behind L&T, Filterpada" }
];

const SearchScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const handleMarkerPress = (marker: React.SetStateAction<null>) => {
    setSelectedMarker(marker);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMarker(null);
  };

  const mapHTML = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      </head>
      <body style="margin: 0;">
        <div id="map" style="height: 100%;"></div>
        <script>
          var map = L.map('map').setView([19.0760, 72.8777], 12);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          var markers = ${JSON.stringify(dummyMarkers)};

          markers.forEach(marker => {
            L.marker(marker.position).addTo(map)
              .bindPopup(marker.name)
              .on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify(marker));
              });
          });

          document.addEventListener('message', function(e) {
            var marker = JSON.parse(e.data);
            alert('Marker clicked: ' + marker.name);
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.waterLevelText}>
        Waterlevel Monitoring Sensors are under installation. {"\n"}Dummy data is being displayed.
      </Text>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        onMessage={(event) => {
          const marker = JSON.parse(event.nativeEvent.data);
          handleMarkerPress(marker);
        }}
      />

      {/* <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          {selectedMarker && (
            <View style={styles.markerInfo}>
              <Image source={require('../assets/download.png')} style={styles.markerImage} />
              <Text>{selectedMarker.name}</Text>
              <BarChart
                style={styles.barChart}
                data={{
                  labels: ['Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5', 'Station 6'],
                  datasets: [{
                    data: [20, 45, 28, 80, 99, 43],
                  }],
                }}
                width={Dimensions.get('window').width - 40}
                height={200}
                yAxisSuffix=" m"
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          )}
        </View>
      </Modal> */}
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
  markerInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  markerImage: {
    width: 200,
    height: 200,
    marginBottom: 10  },
    barChart: {
      marginTop: 10,
    },
    waterLevelText: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: 10,
      backgroundColor: 'red',
      color: 'white',
      textAlign: 'center',
      zIndex: 1,
    },
  });
  
  export default SearchScreen;
  
