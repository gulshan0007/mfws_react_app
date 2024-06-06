import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit'; // Import only BarChart, since LineChart is not used
import { fetchAllData } from '../utils/widgetAPI';
import clou from '../assets/cloudy.png';
import img1 from '../assets/download.png';
import img2 from '../assets/download.png';
import img3 from '../assets/download.png';

const screenWidth = Dimensions.get('window').width;

interface StationData {
    temperature: number;
    humidity: number;
    pressure: number;
}

interface Station {
    id: string;
    name: string;
}

interface RainfallData {
    data: StationData;
    station: Station;
}

interface RainfallWidgetProps {
    selectedOption: Station;
}

const RainfallWidget: React.FC<RainfallWidgetProps> = ({ selectedOption }) => {
    const [data, setData] = useState<RainfallData | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    useEffect(() => {
        if (selectedOption) {
            fetchAllData(selectedOption.id)
                .then((data: RainfallData) => setData(data))
                .catch((error: any) => console.error('Error fetching station data:', error));
        }
    }, [selectedOption]);

    if (!data) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.infoBox}>
                    <Image source={clou} style={styles.icon} />
                    <Text style={styles.temperature}>{data.data.temperature}°C</Text>
                </View>
                <View style={styles.stationInfo}>
                    <Text style={styles.stationName}>{data.station.name}</Text>
                </View>
                <View style={styles.infoBox}>
                    <Text style={styles.humidity}>{data.data.humidity}</Text>
                    <Text style={styles.pressure}>{data.data.pressure}</Text>
                </View>
            </View>

            <Text style={styles.chartHeading1}>Hourly Rainfall Forecast (Experimental)</Text>
            <ScrollView horizontal>
                <View style={styles.chartContainer}>

                    <RainfallBarChart />
                </View>
            </ScrollView>
            <Text style={styles.chartHeading2}>Scroll</Text>
            <View style={styles.chartContainer}>

                <Text style={styles.chartHeading}>Daily Rainfall Forecast (Experimental)</Text>


                <DailyPredictionChart />
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalOpen(true)}
            >
                <Text style={styles.buttonText}>View Past Rainfall</Text>
            </TouchableOpacity>

            {modalOpen && (
                <Modal
                    transparent={true}
                    visible={modalOpen}
                    onRequestClose={() => setModalOpen(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalOpen(false)}
                            >
                                <Text style={styles.closeButtonText}>&times;</Text>
                            </TouchableOpacity>
                            {/* <ScrollView vertical>
                                <Image source={img1} style={styles.modalImage} />
                                <Image source={img2} style={styles.modalImage} />
                                <Image source={img3} style={styles.modalImage} />
                            </ScrollView> */}
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

function RainfallBarChart() {
    return (
        <BarChart
            data={{
                labels: ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3"],
                datasets: [
                    {
                        data: [1.5, 2, 0.5, 1, 3, 2.5, 0, 3, 4.5, 5, 3, 4.5, 5, 3.5, 2.5, 3, 4, 3.5, 3, 2.5, 4, 3, 2.5, 4, 3.5, 2, 4, 3, 3.5, 4, 5]
                    }
                ]
            }}
            width={screenWidth * 2} // Adjust width to accommodate all bars
            height={300} // Increased height for better visibility
            yAxisLabel=""
            yAxisSuffix="mm"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
                backgroundColor: "#000000",
                backgroundGradientFrom: "#1E2923",
                backgroundGradientTo: "#08130D",
                decimalPlaces: 2, // optional, defaults to 2dp
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
                barPercentage: 0.5, // Adjusted bar percentage for better spacing
                barRadius: 5, // Rounded bar edges for better aesthetics
                fillShadowGradient: "#76A7FA", // Bar fill color
                fillShadowGradientOpacity: 1,
            }}
            style={{
                marginVertical: 8,
                borderRadius: 16,

            }}
        />
    );
}

function DailyPredictionChart() {
    return (
        <BarChart
            data={{
                labels: ["2 Days Ago", "Yesterday", "Today", "Tomorrow  ", "D.A.Tomorrow"],
                datasets: [
                    {
                        data: [1.5, 2, 2.5, 3, 2]
                    }
                ]
            }}
            width={screenWidth - 16} // from react-native
            height={220}
            yAxisLabel=""
            yAxisSuffix="mm"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
                backgroundColor: "#000000",
                backgroundGradientFrom: "#1E2923",
                backgroundGradientTo: "#08130D",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(118, 167, 250, ${opacity})`, // Corrected to use a function
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                    borderRadius: 16
                },
                propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                }
            }}
            style={{
                marginVertical: 8,
                borderRadius: 16
            }}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 16,
        padding: 16,
        margin: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    infoBox: {
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
    stationInfo: {
        justifyContent: 'center',
    },
    stationName: {
        fontSize: 18,
        color: '#ffffff',
    },
    humidity: {
        fontSize: 16,
        color: '#47a0ff',
        marginTop: 16,
    },
    pressure: {
        fontSize: 16,
        color: '#47a0ff',
        marginTop: 16,
    },
    chartContainer: {
        marginVertical: 0,
    },
    chartHeading: {
        marginVertical: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#ffffff', // Text color white
        fontSize: 16, // Font size set to 16
    },
    chartHeading1: {
        marginVertical: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#ffffff', // Text color white
        fontSize: 16, // Font size set to 16
    },
    chartHeading2: {
        marginVertical: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'green', // Text color white
        fontSize: 16, // Font size set to 16
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 2,
        right: 2,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#000000',
    },
    modalImage: {
        width: 100,
        height: 100,
        margin: 0,
    },
});

export default RainfallWidget;

