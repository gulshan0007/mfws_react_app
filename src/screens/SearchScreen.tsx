import React, { useState, useEffect } from 'react';
import { Modal, Text, TouchableOpacity, View, StyleSheet, Image,ScrollView, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const SearchScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [sensorList, setSensorList] = useState<any[]>([]);

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
    try {
      const response = await axios.get(`https://api.mumbaiflood.in/weather/waterleveldata/${marker.id}`);
      const data = response.data.data.map((entry: any) => ({
        time: entry.time * 1000,
        value: parseInt(entry.parameter_values.us_mb) > 347 ? 0 : parseInt(entry.parameter_values.us_mb)
      }));
      setChartData(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching water level data:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMarker(null);
    setChartData(null);
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
          L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=d42390ee-716f-47d9-b8e5-2b8b44c5d63f', {
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
          {selectedMarker && (
            <View style={styles.markerInfo}>
              
              <Text style={styles.chartTitle}>{selectedMarker.name}</Text>
              <Text style={styles.chartTitle}>{selectedMarker.address}</Text>
              {chartData && (
                <View style={styles.chartContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}  >
                  <LineChart
                    data={{
                      labels: chartData
      .filter((_, index) => index % 10 === 0) // Filter to include every 10th label
      .map(entry => new Date(entry.time).toLocaleTimeString()).reverse(),
                      datasets: [
                        {
                          data: chartData.map(entry => entry.value).reverse(),
                          color: () => 'rgb(0, 255, 255)',
                          withDots: false,
                          
                        },
                      ],
                    }}
                    width={screenWidth*15} // from react-native
                    height={420}
                    chartConfig={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      backgroundGradientFrom: "rgba(0,0,0,0.8)",
                      backgroundGradientTo: "rgba(0,0,0,0.8)",
                      decimalPlaces: 2,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                      barPercentage: 0.5,
                      strokeWidth: 2,
                      propsForBackgroundLines: {
                        strokeWidth: 1,
                        stroke: 'rgba(255,255,255,0.2)',
                      },
                      
                    }}
                    verticalLabelRotation={45}
                    style={styles.chart}
                    withShadow={false} 
                  />
                  </ScrollView>
                </View>
              )}
            </View>
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
    top: 40,
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
  chartContainer: {
    marginTop: 80,
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
