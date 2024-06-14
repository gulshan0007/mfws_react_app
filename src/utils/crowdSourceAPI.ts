import axios from 'axios';

// Function to send form data
export async function sendFormData(formData: {
  waterlevel: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  feedback: string;
}) {
  try {
    const response = await axios.post('https://api.mumbaiflood.in/cs/data/', formData);
    return response.data;
  } catch (error) {
    console.error('Error storing data:', error);
    throw error;
  }
}

// Function to fetch crowdsource map data
export async function fetchCrowdData() {
  try {
    const response = await axios.get('https://api.mumbaiflood.in/cs/map/');
    return response.data;
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw error;
  }
}

// Function to fetch location data based on coordinates
export async function fetchLocationData(coords: { lat: number; long: number }) {
  try {
    const response = await axios.post('https://api.mumbaiflood.in/cs/location/', coords);
    return response.data.location;
  } catch (error) {
    console.error('Error fetching location data:', error);
    throw error;
  }
}
