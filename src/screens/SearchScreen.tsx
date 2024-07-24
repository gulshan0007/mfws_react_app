import React, { useState, useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
// import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-react-native';

const screenWidth = Dimensions.get('window').width;

const SearchScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [sensorList, setSensorList] = useState<any[]>([]);
  const [averages, setAverages] = useState<any>({
    last5Min: 0,
    last15Min: 0,
    last12Hour: 0,
    last24Hour: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSensorListData();
  }, []);

  const fetchSensorListData = async () => {
    const accessId = 'lX1d9akADFVLiYhB';
    const accessKey = 'NsKeyQDu9zgbED9KINEeYhIvRzbcSr1VKtDhbTMaUQMlAtPA8sOyjDm8Q85CBH9d';
    const url = 'https://app.aurassure.com/-/api/iot-platform/v1.1.0/clients/10684/applications/16/things/list';

    try {
      const response = await axios.get(url, {
        headers: {
          'Access-Id': accessId,
          'Access-Key': accessKey,
          'Content-Type': 'application/json'
        }
      });

      const sensorList = response.data.things.map((sensor: any) => ({
        id: sensor.id,
        name: sensor.name,
        latitude: sensor.latitude,
        longitude: sensor.longitude,
        address: sensor.address
      }));

      setSensorList(sensorList);
    } catch (error) {
      console.error('Error fetching sensor list:', error);
    }
  };

  const handleMarkerPress = async (marker: any) => {
    setSelectedMarker(marker);
    setModalVisible(true);
    setLoading(true);
    try {
      const response = await axios.get(`https://api.mumbaiflood.in/weather/waterleveldata/${marker.id}`);
      const data = response.data.data.map((entry) => ({
        time: entry.time * 1000,
        value: parseInt(entry.parameter_values.us_mb) > 300 ? 0 : parseInt(entry.parameter_values.us_mb)
      }));
      const cleanedData = removeSpikes(data);
      setChartData(cleanedData);
      setAverages(calculateAverages(cleanedData));
      setLoading(false); 
    } catch (error) {
      console.error('Error fetching water level data:', error);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMarker(null);
    setChartData(null);
    setAverages({});
  };

  const removeSpikes = (data) => {
    if (data.length < 2) return data; // Not enough data points to compare
  
    const adjustedData = [...data];
  
    for (let i = 1; i < data.length; i++) {
      const timeDiff = (data[i].time - data[i - 1].time) / (60 * 1000); // Time difference in minutes
      const valueDiff = data[i].value - data[i - 1].value; // Water level difference
      const slope = valueDiff / timeDiff; // Slope
  
      if (Math.abs(slope) > 10) { // Adjust the threshold if needed
        adjustedData[i].value = adjustedData[i - 1].value; // Replace with the previous value
      }
    }
  
    return adjustedData;
  };
  

  const numberFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const calculateAverages = (data) => {
    const now = Date.now();
    const intervals = {
      last5Min: 5 * 60 * 1000,
      last15Min: 15 * 60 * 1000,
      last12Hour: 12 * 60 * 60 * 1000,
      last24Hour: 24 * 60 * 60 * 1000,
    };

    const averages = {
      last5Min: calculateAverage(data, now - intervals.last5Min),
      last15Min: calculateAverage(data, now - intervals.last15Min),
      last12Hour: calculateAverage(data, now - intervals.last12Hour),
      last24Hour: calculateAverage(data, now - intervals.last24Hour),
    };

    return averages;
  };

  const calculateAverage = (data, startTime) => {
    const filteredData = data.filter(entry => entry.time >= startTime);
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((total, entry) => total + entry.value, 0);
    return sum / filteredData.length;
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
          var map = L.map('map').setView([19.0760, 72.8777], 10);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
          }).addTo(map);

          var markers = ${JSON.stringify(sensorList)};

          markers.forEach(marker => {
            L.marker([marker.latitude, marker.longitude]).addTo(map)
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
      <Text style={styles.headerText}>LIVE water-level values</Text>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        onMessage={(event) => {
          const marker = JSON.parse(event.nativeEvent.data);
          handleMarkerPress(marker);
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
  
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            selectedMarker && (
              <View style={styles.markerInfo}>
                <Text style={styles.chartTitle}>{selectedMarker.name}</Text>
                <Text style={styles.chartTitle}>{selectedMarker.address}</Text>
  
                <View style={styles.averageTitle}>
                  <Text style={styles.averageText}>Average Last 5 Minutes: {numberFormatter.format(averages.last5Min)} cm</Text>
                  <Text style={styles.averageText}>Average Last 15 Minutes: {numberFormatter.format(averages.last15Min)} cm</Text>
                  <Text style={styles.averageText}>Average Last 12 Hours: {numberFormatter.format(averages.last12Hour)} cm</Text>
                  <Text style={styles.averageText}>Average Last 24 Hours: {numberFormatter.format(averages.last24Hour)} cm</Text>
                </View>
  
                {chartData && (
                  <ScrollView horizontal>
                    <LineChart
                      data={{
                        labels: chartData.map((entry, index) => index % 80 === 0 ? new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''),

                        datasets: [
                          {
                            data: chartData.map(entry => entry.value),
                            color: () => 'rgb(0, 255, 255)',
                            withDots: false,
                          },
                        ],
                      }}
                      width={screenWidth}
                      height={380}
                      chartConfig={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        backgroundGradientFrom: 'rgba(0,0,0,0.8)',
                        backgroundGradientTo: 'rgba(0,0,0,0.8)',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        barPercentage: 0.5,
                        strokeWidth: 1,
                        propsForBackgroundLines: {
                          strokeWidth: 0,  // Set strokeWidth to 0 to remove background lines
                        },
                        yAxisLabel: {
                          fontSize: 12,  // Adjust the font size for y-axis labels
                        },
                        xAxisLabel: {
                          fontSize: 12,  // Adjust the font size for x-axis labels
                        },
                      }}
                      verticalLabelRotation={90}
                      style={styles.chart}
                      withShadow={false}
                    />
                  </ScrollView>
                )}
              </View>
            )
          )}
        </View>
      </Modal>
  
      <Image
        source={require('../assets/mf.png')}
        style={styles.logo}
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
  chartTitle: {
    color: 'tomato',
    fontSize: 12,
    top: 0,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: 'black',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
  },
  markerInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  markerImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  averageText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  averageTitle: {
    marginTop: 10,
    marginBottom: 10,

  },
  averageTitle1: {
    marginTop: 160,

  },
  chartContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  logo: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    alignSelf: 'center',
    opacity: 0.7,
    height: 50,
    width: 80,
  },
});

export default SearchScreen;
