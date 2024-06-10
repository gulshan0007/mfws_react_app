import axios from 'axios';

const baseURL = 'https://api.mumbaiflood.in/aws/';

export const fetchStations = async () => {
    try {
        const response = await axios.get(`${baseURL}stations/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching stations:', error);
        throw error;
    }
};

export const fetchStationData = async (stationId: string) => {
    try {
        const response = await axios.get(`${baseURL}stations/${stationId}/`);
        const stationData = response.data;
        // Transform stationData if needed
        return stationData;
    } catch (error) {
        console.error('Error fetching station data:', error);
        throw error;
    }
};

// export const fetchRainfallData = async (stationId: string) => {
//     try {
//         const response = await axios.get(`${baseURL}rainfall/${stationId}/`);
//         const rainfallData = response.data;
//         // Transform rainfallData if needed
//         return rainfallData;
//     } catch (error) {
//         console.error('Error fetching rainfall data:', error);
//         throw error;
//     }
// };

// export const fetchAllData = async (stationId: string) => {
//     try {
//         const response = await axios.get(`${baseURL}alldata/${stationId}`);
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching all data:', error);
//         throw error;
//     }
// };
