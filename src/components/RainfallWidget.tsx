import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart,StackedBarChart } from 'react-native-chart-kit';
import { fetchStationData } from '../utils/widgetAPI';
import plac from '../assets/loc.png';

const screenWidth = Dimensions.get('window').width;

export default function RainfallWidget({ selectedOption }) {
  const [stationData, setStationData] = useState(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) + "  " + new Date().toLocaleTimeString();
      setTime(newTime);
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

  const { station, hrly_data, mobile_daily_data, seasonal_data } = stationData;

  // Adding a dummy y value of 200 at the end of hrly_data
  const hrlyDataWithDummy = [...hrly_data, { hour: '.', total_rainfall: 30 }];

  // const formattedHrlyData = {
  //   labels: hrlyDataWithDummy.map((item, index) => index % 2 === 0 ? item.hour : ''), // Display labels every second hour
  //   datasets: [
  //     {
  //       data: hrlyDataWithDummy.map(item => item.total_rainfall),
  //       colors: hrlyDataWithDummy.map((value, index) =>
  //         index < 6 ? () => 'rgba(211,211,211,1)' : () => index === hrlyDataWithDummy.length - 1 ? 'black' : 'rgb(0,255,255)'
  //       ),
  //     },
  //   ],
  // };
  const formattedHrlyData = {
    labels: hrlyDataWithDummy.map((item, index) => index % 2 === 0 ? item.hour : ''), // Display labels every second hour
    datasets: [
      {
        data: hrlyDataWithDummy.map(item => item.total_rainfall),
        colors: hrlyDataWithDummy.map((value, index) =>
          index < 6 ? () => 'rgba(211,211,211,1)' : () => index === hrlyDataWithDummy.length - 1 ? 'black' : 'rgba(211,211,211,1)'
        ),
      },
    ],
  };

  const seasonalDataWithDummy = [...seasonal_data, { date: 'Dummy', observed: 250, predicted: 0 }];

  const formattedSeasonalData = {
    labels: seasonal_data.map(item => {
      if (item.date === 'Dummy') {
        return ' ';
      } else {
        return new Date(item.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      }
    }).reverse(), // Reverse the array to display labels in reverse order
  
    datasets: [
      {
        data: seasonal_data.map(item => item.observed).reverse(), // Reverse the observed data array
        color: () => 'rgba(211, 211, 211, 1)', // color of the observed line
      },
      {
        data: seasonal_data.map(item => item.predicted).reverse(), // Reverse the predicted data array
        color: () => 'rgb(119, 153, 51)' // color of the predicted line
      }
    ]
  };


  // Adding dummy data to mobile_mobile_daily_data
// Convert mobile_daily_data to an array of objects
const mobileDailyDataArray = Object.entries(mobile_daily_data).map(([date, value]) => ({ date, value }));

// Add the 'Dummy' entry
const dailyDataWithDummy = [...mobileDailyDataArray, { date: 'Dummy', value: 250 }];

// Format the data for the chart
const formattedDailyData = {
  labels: dailyDataWithDummy.map(item => {
    if (item.date === 'Dummy') {
      return '';
    } else {
      return new Date(item.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    }
  }),
  datasets: [
    {
      data: dailyDataWithDummy.map(item => item.value),
      colors: dailyDataWithDummy.map((item, index) =>
        index < 3 ? () => 'rgba(211,211,211,1)' : () => getColor(item.value)
      ),
    },
  ],
};




  // console.log(formattedDailyData.barColors);

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
        <Text style={styles.chartTitle}>Observed Hourly Rainfall </Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: 'rgba(211,211,211,1)' }]} />
            <Text style={styles.legendText}>Observed data from MCGM   </Text>
            {/* <View style={[styles.legendColorBox, { backgroundColor: 'rgb(0,255,255)' }]} />
            <Text style={styles.legendText}>Forecasted</Text> */}
            <Text style={styles.legendText1}>Y-axis : Rainfall (in mm)</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <BarChart
            data={formattedHrlyData}
            width={600}
            height={250}
            segments={3}
            chartConfig={{
              ...barChartConfig,
              decimalPlaces: 0
            }}
            verticalLabelRotation={0}
            style={styles.chart}
            showBarTops={false}
            fromZero
            withCustomBarColorFromData
            flatColor
          />
        </ScrollView>

        <Text style={styles.chartTitle}>Daily Rainfall Forecast</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(205.5) }]} />
            <Text style={styles.legendText}>Extremely Heavy Rainfall (>=204.5 mm) </Text>
            
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(115.6) }]} />
            <Text style={styles.legendText}>Very Heavy Rainfall (115.6-204.4 mm)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: getColor(64.5) }]} />
            <Text style={styles.legendText}>Heavy Rainfall (64.5-115.5 mm)  </Text>
            
          </View>
          <View style={styles.legendItem}>
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
          height={250}
          segments={5}
          bezier
          chartConfig={{
            ...dailyChartConfig,
            decimalPlaces: 0
          }}
          style={styles.chart}
          showBarTops={false}
          fromZero
          withCustomBarColorFromData
          flatColor
        />
      </View>
      <Text style={styles.chartTitle}>Past Forecasted Rainfall (1-day lead) for this season</Text>
      <View style={styles.legendItem}>
        <View style={[styles.legendColorBox, { backgroundColor: 'rgba(211,211,211,1)' }]} />
        <Text style={styles.legendText}>Observed     </Text>
        <View style={[styles.legendColorBox, { backgroundColor: 'rgb(119,153,51)' }]} />
        <Text style={styles.legendText}>Past Predicted</Text>
        <Text style={styles.legendText1}>Y-axis : Rainfall (in mm)</Text>
      </View>
      <View style={{ overflow: 'hidden', width: screenWidth }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}  >
          <LineChart
            data={formattedSeasonalData}
            width={screenWidth * 3}
            height={350}
            chartConfig={{
              ...pastChartConfig,
              decimalPlaces: 0

            }}
            verticalLabelRotation={45}
            style={styles.chart}
            segments={5}
            withShadow={false} 
            fromZero
            withCustomBarColorFromData
            flatColor
          />
        </ScrollView>
        <Text style={styles.chartTitle1}>Scroll ---> </Text>

      </View>
    </ScrollView>
    
  );
}

// Function to determine color based on rainfall value
const getColor = (rainfall) => {
  if (rainfall >= 250) {
    return "black"; // Red
  } 
  else if (rainfall >= 205.5 && rainfall < 250) {
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
  propsForLabels: { fill: "transparent", },
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
const pastChartConfig = {
  backgroundGradientFrom: "rgba(0,0,0,0.7)",
  backgroundGradientTo: "rgba(0,0,0,0.8)",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  barPercentage: 0.5,
  fillShadowGradient: 'rgba(0,0,0,0)',
  fillShadowGradientOpacity: 0,
  strokeWidth: 2,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: 'rgba(255,255,255,0.2)',
  },
};

const getPercentageWidth = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 5,
  },
  container1: {
    padding: 0,
    marginLeft: getPercentageWidth(10), // Set marginLeft dynamically using percentage
  },
  container2: {
    padding: 0,
    marginLeft: getPercentageWidth(0), // Set marginLeft dynamically using percentage
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    color: 'tomato',
    fontSize: 12,
    fontWeight: 'bold',
  },
  widgetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    borderRadius: 10,
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
    color: 'tomato',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  chartTitle1: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 8,
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
    fontSize: 8,
    marginRight: 2,
    textAlign: 'right',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  chart: {
    marginVertical: 6,
    marginLeft: -getPercentageWidth(0),  },
});

export { barChartConfig, dailyChartConfig, styles };