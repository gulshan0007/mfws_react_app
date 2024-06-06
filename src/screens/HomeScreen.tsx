import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Dimensions, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'react-native-svg';

export default function HomeScreen() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchStationsData = async () => {
      try {
        const response = await fetch('http://192.168.0.113:8000/widget/stations/');
        const data = await response.json();
        setStations(data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      }
    };

    fetchStationsData();
  }, []);

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

          var stations = ${JSON.stringify(stations)};

          stations.forEach(station => {
            L.marker([station.latitude, station.longitude]).addTo(map)
              .bindPopup(station.name)
              .on('click', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify(station));
              });
          });

          document.addEventListener('message', function(e) {
            var station = JSON.parse(e.data);
            alert('Station clicked: ' + station.name);
          });
        </script>
      </body>
    </html>
  `;

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStation(null);
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        onMessage={(event) => {
          const station = JSON.parse(event.nativeEvent.data);
          setSelectedStation(station);
          setModalVisible(true);
        }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>
          {selectedStation && (
            <View style={styles.stationInfoContainer}>
              {/* <Text style={styles.stationName}>{selectedStation.name}</Text> */}
              <View style={styles.weatherInfo}>
                <Text style={styles.temperature}>Temperature: 25°C</Text>
                <Text style={styles.humidity}>Humidity: 70%</Text>
              </View>
              <Text style={styles.chartHeading}>Hourly Rainfall Forecast</Text>
              <ScrollView horizontal>
              <BarChart
    data={{
        labels: ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3"],
        datasets: [
            {
                data: [1.5, 2, 0.5, 1, 3, 2.5, 0, 3, 4.5, 5, 3, 4.5, 5, 3.5, 2.5, 3, 4, 3.5, 3, 2.5, 4, 3, 2.5, 4, 3.5, 2, 4, 3, 3.5, 4, 5]
            }
        ]
    }}
    width={screenWidth * 2}
    height={300}
    yAxisLabel=""
    chartConfig={{
        backgroundGradientFrom: "#1E2923",
        backgroundGradientTo: "#08130D",
        color: (opacity = 1) => `rgba(118, 167, 250, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#ffa726"
        },
        barPercentage: 0.5,
        barRadius: 5,
        fillShadowGradient: "#76A7FA",
        fillShadowGradientOpacity: 1,
         // Add the yAxisSuffix property here
    }}
    style={{
        marginVertical: 8,
        borderRadius: 16
    }}
/></ScrollView>

              <Text style={styles.chartHeading}>Daily Rainfall Forecast</Text>
              <ScrollView horizontal>
              <BarChart
    data={{
        labels: ['2 Days Ago', 'Yesterday', 'Today', 'Tomorrow', 'D.A.Tomorrow'],
        datasets: [{ data: Array.from({ length: 5 }, () => Math.random() * 20) }]
    }}
    width={screenWidth}
    height={200}
    yAxisLabel="mm"
    chartConfig={{
        backgroundGradientFrom: '#1E2923',
        backgroundGradientTo: '#08130D',
        color: (opacity = 1) => `rgba(118, 167, 250, ${opacity})`,
         // Add the yAxisSuffix property here
    }}
    style={styles.chart}
/></ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#000', // Set background color to black
  },
  map: {
      flex: 1,
  },
  modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#151515', // Dark gray background color
  },
  closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      zIndex: 1,
  },
  closeButtonText: {
      fontSize: 24,
      color: '#fff', // White text color
  },
  stationInfoContainer: {
      backgroundColor: '#fff', // White background color
      padding: 20,
      borderRadius: 10,
      width: '90%',
  },
  stationName: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  weatherInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
  },
  temperature: {
      fontSize: 16,
      color: '#000', // Black text color
  },
  humidity: {
      fontSize: 16,
      color: '#000', // Black text color
  },
  chartHeading: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#fff', // White text color
  },
  chart: {
      marginVertical: 10,
      borderRadius: 10,
  },
});

