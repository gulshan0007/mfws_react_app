// BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FormCrowd from '../screens/FormCrowd';
import ProfileScreen from '../screens/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar'; // Import CustomTabBar
import Map from '../screens/Map';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />} // Use CustomTabBar as tabBar
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Rainfall':
              iconName = focused ? 'rainy' : 'rainy-outline';
              break;
            case 'Waterlevel':
              iconName = focused ? 'water' : 'water-outline';
              break;
            case 'Crowdsourcing':
              iconName = focused ? 'accessibility' : 'accessibility-outline';
              break;
            case 'Messages':
              iconName = focused ? 'mail' : 'mail-outline';
              break;
            case 'Profile':
              iconName = focused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Rainfall" component={HomeScreen} />
      <Tab.Screen name="Waterlevel" component={SearchScreen} />
      <Tab.Screen name="Crowdsourcing" component={Map} />
      <Tab.Screen name="Form" component={FormCrowd} />
      <Tab.Screen name="About-Us" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
