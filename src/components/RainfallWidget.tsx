import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import { fetchStationData } from '../utils/widgetAPI';
import clou from '../assets/cloudy.png';
import img1 from '../assets/download.png';
import img2 from '../assets/download.png';
import img3 from '../assets/download.png';

export default function RainfallWidget({ selectedOption }) {
  const [data, setData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const rainfallBarChartData = [
    ["Time", "Rainfall (Past 6 hrs)", "Rainfall (Next 24 hrs)"],
    ["10 AM", 1.5, 0],
    ["11 AM", 2, 0],
    ["12 PM", 0.5, 0],
    ["1 PM", 1, 0],
    ["2 PM", 3, 0],
    ["3 PM", 2.5, 0],
    ["4 PM", 0, 3],
    ["5 PM", 8, 4.5],
    ["6 PM", 9, 5],
    ["7 PM", 7, 3],
    ["8 PM", 8, 4.5],
    ["9 PM", 5, 5],
    ["10 PM", 3, 3.5],
    ["11 PM", 7, 2.5],
    ["12 AM", 9, 3],
    ["1 AM", 0, 4],
    ["2 AM", 0, 3.5],
    ["3 AM", 0, 3],
    ["4 AM", 0, 2.5],
    ["5 AM", 0, 4],
    ["6 AM", 0, 3],
    ["7 AM", 0, 2.5],
    ["8 AM", 0, 4],
    ["9 AM", 0, 3.5],
    ["10 AM", 0, 2],
    ["11 AM", 0, 4],
    ["12 PM", 0, 3],
    ["1 PM", 0, 3.5],
    ["2 PM", 0, 4],
    ["3 PM", 0, 5],
  ];

  const dailyPredictionChartData = [
    ["Day", "Rainfall"],
    ["2 Days Ago", 1.5],
    ["Day Before Yesterday", 2],
    ["Yesterday", 2.5],
    ["Today", 3],
    ["Tomorrow", 2],
    ["Day After Tomorrow", 3.5]
  ];

  useEffect(() => {
    if (selectedOption) {
      console.log('Station data:', selectedOption);
      fetchStationData(selectedOption.station_id)
        .then(data => setData(data))
        .catch(error => console.error('Error fetching station data:', error));
    }
  }, [selectedOption]);

  if (!data) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.widgetContainer}>
      <View style={styles.row}>
        <Image source={clou} style={styles.icon} />
        <Text >{data.station.name}</Text>
        <Text >{data.station.curr_windspeed}</Text>
        {/* <Text>{data.data.humidity}</Text> */}
      </View>
      <View style={styles.row}>
      <Text style={styles.temperature}>{data.station.curr_temp}°C</Text>
        
        <Text>Rainfall: {data.station.curr_rainfall}</Text>
      </View>
<ScrollView horizontal>
  <BarChart
    data={{
      labels: rainfallBarChartData.slice(1).map(item => item[0]),
      datasets: [
        {
          data: rainfallBarChartData.slice(1).map(item => item[1]),
        },
        {
          data: rainfallBarChartData.slice(1).map(item => item[2]),
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
      barPercentage: 0.5, // Adjust bar width
      // paddingVertical: 10, // Adjust vertical padding
    }}
    
    verticalLabelRotation={90} // Rotate x-axis labels
  />
</ScrollView>

      <BarChart
        data={{
          labels: dailyPredictionChartData.slice(1).map(item => item[0]),
          datasets: [
            {
              data: dailyPredictionChartData.slice(1).map(item => item[1]),
            },
          ],
        }}
        width={400}
        height={200}
        style={{marginTop: 0}}
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

