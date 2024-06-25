import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { fetchStationData } from '../utils/widgetAPI';
import plac from '../assets/loc.png';

const screenWidth = Dimensions.get('window').width;

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

  const { station, hrly_data, daily_data, seasonal_data } = stationData;

  const formattedHrlyData = {
    labels: hrly_data.map((item, index) => index % 2 === 0 ? item.hour : ''), // Display labels every second hour
    datasets: [
      {
        data: hrly_data.map(item => item.total_rainfall),
        colors: hrly_data.map((value, index) =>
          index < 6 ? () => 'rgba(211,211,211,1)' : () => 'rgb(0,255,255)'
        ),
      },
    ],
  };

  const formattedSeasonalData = {
    labels: seasonal_data.flatMap(item => [new Date(item.date).toLocaleDateString('en-US',{day: '2-digit',month:'short'})]),
    datasets: [
      {
        data: seasonal_data.reduce((acc, item) => acc.concat([item.observed, item.predicted]), []),
        colors: seasonal_data.reduce((acc, item) => acc.concat([() => 'rgba(211,211,211,1)', () => 'rgb(0,255,255)']), []),
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


const minValue = 0;

function* yLabel() {
  yield* [minValue, 50, 100,150,200];
}
const yLabelIterator = yLabel();

  return (
    <ScrollView style={styles.container}>
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
            <Text style={styles.legendText}>Observed     </Text>
            <View style={[styles.legendColorBox, { backgroundColor: 'rgb(0,255,255)' }]} />
            <Text style={styles.legendText}>Forecasted</Text>
            <Text style={styles.legendText1}>Y-axis : Rainfall (in mm)</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <BarChart
            data={formattedHrlyData}
            width={600}
            height={300}
            
            chartConfig={{
              ...barChartConfig,
              formatYLabel: () => yLabelIterator.next().value,
            }}
            verticalLabelRotation={0}
            style={styles.chart}
            fromZero
            withCustomBarColorFromData
            flatColor
          />
        </ScrollView>
       
        <Text style={styles.chartTitle}>Daily Rainfall Forecast</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(205.5) }]} />
            <Text style={styles.legendText}>Extremely Heavy Rainfall (>=204.5 mm)    </Text>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(115.6) }]} />
            <Text style={styles.legendText}>Very Heavy Rainfall (115.6-204.4 mm)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(64.5) }]} />
            <Text style={styles.legendText}>Heavy Rainfall (64.5-115.5 mm)                   </Text>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(15.6) }]} />
            <Text style={styles.legendText}>Moderate Rainfall (15.6-64.4 mm)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(0) }]} />
            <Text style={styles.legendText}>Very Light to Light Rainfall (0.1-15.6 mm)</Text>
          </View>
        </View>
        <BarChart
          data={formattedDailyData}
          width={screenWidth}
          height={200}
          segments={5}
          bezier
          chartConfig={{
            ...dailyChartConfig,
            
          }}
          style={styles.chart}
          fromZero
          withCustomBarColorFromData
          flatColor
        />
      </View>
      <Text style={styles.chartTitle}>Seasonal Rainfall Forecast</Text>
      <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: 'rgba(211,211,211,1)' }]} />
            <Text style={styles.legendText}>Observed        </Text>
            <View style={[styles.legendColorBox, { backgroundColor: 'rgb(0,255,255)' }]} />
            <Text style={styles.legendText}>Past Predicted</Text>
            <Text style={styles.legendText1}>Y-axis : Rainfall (in mm)</Text>
          </View>
        </View>
        <ScrollView horizontal>
          <BarChart
            data={formattedSeasonalData}
            width={screenWidth * 2.5}
            height={300}
            chartConfig={{
              ...barChartConfig,
              
            }}
            verticalLabelRotation={0}
            style={styles.chart}
            fromZero
            withCustomBarColorFromData
            flatColor
          />
        </ScrollView>
    </ScrollView>
  );
}

// Function to determine color based on rainfall value
const getColor = (rainfall) => {
  if (rainfall >= 205.5) {
    return "#FF0000"; // Red
  } else if (rainfall >= 115.6 && rainfall <= 204.4) {
    return "orange"; // Orange
  } else if (rainfall >= 64.5 && rainfall <= 115.5) {
    return "yellow"; // Yellow
  } else if (rainfall >= 15.6 && rainfall <= 64.4) {
    return "skyblue"; // Sky Blue
  } else {
    return "green"; // Green
  }
};

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
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 5,
  },
  timeContainer: {
    alignItems: 'center',
    
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  widgetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    borderRadius: 10,
    margin: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  icon: {
    width: 10,
    height: 20,
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
    marginVertical: 5,
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
    paddingLeft: 10,
  },
  legendColorBox: {
    width: 10,
    height: 10,
    marginRight: 1,
    borderWidth: 1,
    borderColor: 'white',
  },
  legendText: {
    color: 'white',
    fontSize: 8,
    alignItems: 'center',
  },
  legendText1: {
    color: 'white',
    fontSize: 10,
    marginRight: 2,
    textAlign: 'right',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  chart: {
    marginVertical: 6,
  },
});
