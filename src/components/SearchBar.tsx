import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface Station {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface Props {
  setSelectedStation: (station: Station) => void;
  stations: Station[];
}

const SearchBar: React.FC<Props> = ({ setSelectedStation, stations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [filteredStations, setFilteredStations] = useState<Station[]>(stations);

  useEffect(() => {
    setFilteredStations(stations);
  }, [stations]);

  const handleInputChange = (text: string) => {
    setSearchTerm(text);
    if (text === '') {
      setFilteredStations(stations);
    } else {
      const filtered = stations.filter(station =>
        station.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStations(filtered);
    }
    setShowOptions(true);
  };

  const handleStationSelection = (station: Station) => {
    setSearchTerm(station.name);
    setShowOptions(false);
    setSelectedStation(station);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowOptions(false);
    setFilteredStations(stations);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search Station..."
          value={searchTerm}
          onChangeText={handleInputChange}
          onFocus={() => setShowOptions(true)}
        />
        {searchTerm !== '' && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      {showOptions && (
        <FlatList
          style={styles.list}
          data={filteredStations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleStationSelection(item)}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  clearButton: {
    paddingHorizontal: 10,
  },
  list: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
});

export default SearchBar;
