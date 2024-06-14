import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { fetchStationData } from '../utils/widgetAPI';
import clou from '../assets/cloudy.png';
import img1 from '../assets/download.png';
import img2 from '../assets/download.png';
import img3 from '../assets/download.png';
import plac from '../assets/loc.png';

export default function RainfallWidget({ selectedOption }) {
  const [stationData, setStationData] = useState(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      const newtime = String(new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) + ", " + new Date().toLocaleTimeString());
      setTime(newtime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const { station, hrly_data, daily_data } = stationData;

  const formattedHrlyData = {
    labels: hrly_data.map(item => item.hour), // Keep labels as hour strings
    datasets: [
      {
        data: hrly_data.map(item => item.total_rainfall),
        colors: hrly_data.map((_, index) =>
          index < 6 ? () => 'rgba(211,211,211,1)' : () => 'rgba(0,0,255,1)'
        ),
      },
    ],
  };

  const formattedDailyData = {
    labels: Object.keys(daily_data).map(date => new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })),
    datasets: [
      {
        data: Object.values(daily_data),
        colors: Object.values(daily_data).map((value, index) =>
          index < 3 ? () => 'rgba(211,211,211,1)' : () => getColor(value)
        ),
      },
    ],
  };

  return (
    <>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>Current Time: {time}</Text>
      </View>
      <View style={styles.widgetContainer}>
        <View style={styles.header}>
          <Image source={plac} style={styles.icon} />
          <Text style={styles.stationName}>{station.name}</Text>
        </View>
        <Text style={styles.chartTitle}>Hourly Rainfall Forecast</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: 'rgba(211,211,211,1)' }]} />
            <Text style={styles.legendText}>Past Hours            </Text>
            <View style={[styles.legendColorBox, { backgroundColor: 'rgba(0,255,255,1)' }]} />
            <Text style={styles.legendText}>Current Hour</Text>
          </View>
          
        </View>
        <ScrollView horizontal>
          <BarChart
            data={formattedHrlyData}
            width={600}
            height={300}
            chartConfig={barChartConfig}
            verticalLabelRotation={90}
            style={styles.chart}
            fromZero
            withCustomBarColorFromData
            flatColor
          />
        </ScrollView>
        <Text style={styles.chartTitle}>Daily Rainfall Forecast</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#FF0000' }]} />
            <Text style={styles.legendText}>Heavy Rainfall (>124.4 mm)          </Text>
            <View style={[styles.legendColorBox, { backgroundColor: 'orange' }]} />
            <Text style={styles.legendText}>Moderate Rainfall (75.6-124.4 mm)</Text>
          </View>
         
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: 'yellow' }]} />
            <Text style={styles.legendText}>Light Rainfall (35.6-75.5 mm)       </Text>
            <View style={[styles.legendColorBox, { backgroundColor: 'green' }]} />
            <Text style={styles.legendText}>Very Light Rainfall (7.5-35.5 mm)</Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: 'cornflowerblue' }]} />
            <Text style={styles.legendText}>No Rainfall (&lt;7.5 mm)</Text>
          </View>
        </View>
        <BarChart
          data={formattedDailyData}
          width={400}
          height={250}
          chartConfig={dailyChartConfig}
          style={styles.chart}
          fromZero
          withCustomBarColorFromData
          flatColor
        />
      </View>
    </>
  );
}

// Function to determine color based on rainfall value
function getColor(rainfall) {
  if (rainfall > 124.4) {
    return "#FF0000"; // Red
  } else if (rainfall >= 75.6 && rainfall <= 124.4) {
    return "orange"; // Orange
  } else if (rainfall >= 35.6 && rainfall <= 75.5) {
    return "yellow"; // Yellow
  } else if (rainfall >= 7.5 && rainfall <= 35.5) {
    return "green"; // Green
  } else {
    return "cornflowerblue"; // Cornflower Blue
  }
}

const barChartConfig = {
  backgroundGradientFrom: "rgba(0,0,0,0.8)",
  backgroundGradientTo: "rgba(0,0,0,0.8)",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  barPercentage: 0.5,
  fillShadowGradient: 'rgba(0,0,0,0.8)',
  fillShadowGradientOpacity: 0.8,
  strokeWidth: 2,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: 'rgba(255,255,255,0.2)',
  },
  
};

const dailyChartConfig = {
  backgroundGradientFrom: "rgba(0,0,0,0.8)",
  backgroundGradientTo: "rgba(0,0,0,0.8)",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  barPercentage: 0.5,
  fillShadowGradient: 'rgba(0,0,0,0.8)',
  fillShadowGradientOpacity: 0.8,
  strokeWidth: 2,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: 'rgba(255,255,255,0.2)',
  },
};

const styles = StyleSheet.create({
  timeContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  widgetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 10,
    margin: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 15,
    height: 15,
  },
  stationName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  chartTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  legendContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  legendText: {
    color: 'white',
    fontSize: 8,
  },
  chart: {
    marginVertical: 6,
  },
});

