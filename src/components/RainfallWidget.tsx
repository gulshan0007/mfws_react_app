import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { fetchStationData } from '../utils/widgetAPI';
import clou from '../assets/cloudy.png';
import img1 from '../assets/download.png';
import img2 from '../assets/download.png';
import img3 from '../assets/download.png';

export default function RainfallWidget({ selectedOption }) {
  const [stationData, setStationData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (selectedOption) {
      console.log('Fetching data for station:', selectedOption.station_id);
      fetchStationData(selectedOption.station_id)
        .then(data => setStationData(data))
        .catch(error => console.error('Error fetching station data:', error));
    }
  }, [selectedOption]);

  if (!stationData) {
    return <Text>Loading...</Text>;
  }

  const { station, hourly_data, daily_data } = stationData;

  return (
    <View style={styles.widgetContainer}>
      <View style={styles.row}>
        
        <Text>{station.name}</Text>
        <Text>Rainfall: {station.curr_rainfall}</Text>
        
      </View>
      <View style={styles.row}>
        
        
      </View>
      <ScrollView horizontal>
        <BarChart
          data={{
            labels: hourly_data.map(item => item.hour.substr(11, 5)), // Extracting only the time part
            datasets: [
              {
                data: hourly_data.map(item => item.total_rainfall),
              },
            ],
          }}
          width={600}
          height={300}
          chartConfig={{
            backgroundGradientFrom: "#1E2923",
            backgroundGradientTo: "#08130D",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 2,
            barPercentage: 0.5,
          }}
          verticalLabelRotation={90}
        />
      </ScrollView>
      <BarChart
        data={{
          labels: daily_data.map(item => item.date),
          datasets: [
            {
              data: daily_data.map(item => item.total_rainfall),
            },
          ],
        }}
        width={400}
        height={200}
        style={{ marginTop: 0 }}
        chartConfig={{
          backgroundGradientFrom: '#1E2923',
          backgroundGradientTo: '#08130D',
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
        }}
      />
      <Button title="View Past Rainfall" onPress={() => setModalOpen(true)} />
      {modalOpen && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalOpen}
          onRequestClose={() => setModalOpen(!modalOpen)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalOpen(!modalOpen)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <View style={styles.imageRow}>
              <Image source={img1} style={styles.image} />
              <Image source={img2} style={styles.image} />
              <Image source={img3} style={styles.image} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  widgetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
  },
  temperature: {
    fontSize: 24,
    color: '#ff4500',
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
  },
});
