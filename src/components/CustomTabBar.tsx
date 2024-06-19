import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Easing, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const buttonSize = new Animated.Value(1);
  const blinkAnimation = useRef(new Animated.Value(0)).current;
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const currentRouteName = state.routes[state.index].name;
      setIsButtonVisible(currentRouteName !== 'Form');
    }, [state.index, state.routes])
  );

  const startBlinkingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    // Start blinking animation when component mounts
    startBlinkingAnimation();
  }, []);

  useEffect(() => {
    if (isButtonVisible) {
      // Restart blinking animation when the button becomes visible
      startBlinkingAnimation();
    }
  }, [isButtonVisible]);

  const handlePress = () => {
    navigation.navigate('Form');
    Animated.sequence([
      Animated.timing(buttonSize, {
        toValue: 1.5,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonSize, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        let iconName;
        if (route.name === 'Rainfall') {
          iconName = isFocused ? 'rainy' : 'rainy-outline';
        } else if (route.name === 'Waterlevel') {
          iconName = isFocused ? 'water' : 'water-outline';
        } else if (route.name === 'Crowdsourcing') {
          iconName = isFocused ? 'accessibility' : 'accessibility-outline';
        } else if (route.name === 'Rail') {
          iconName = isFocused ? 'train' : 'train-outline';
        } else if (route.name === 'About-Us') {
          iconName = isFocused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
        } else if (route.name === 'Form') { // Conditionally render "Form" screen
          return null;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tab}
          >
            <Ionicons name={iconName} size={24} color={isFocused ? 'tomato' : 'gray'} />
            <Text style={[styles.label, { color: isFocused ? 'tomato' : 'gray' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
      {isButtonVisible && (
        <TouchableOpacity onPress={handlePress} style={styles.buttonContainer}>
          <Animated.View style={[styles.button, { transform: [{ scale: buttonSize }] }]}>
            <Animated.Text style={[styles.buttonText, { opacity: blinkAnimation }]}>
              Click to Report Flood in Your Area
            </Animated.Text>
            <Ionicons name="add-circle" size={32} color="white" />
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 320,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'tomato',
    marginLeft: 5,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  label: {
    fontSize: 8, // Adjust the font size as needed
    marginTop: 2, // Adjust the spacing between icon and label as needed
  },
});

export default CustomTabBar;

// import React, { useRef, useEffect, useState } from 'react';
// import { View, TouchableOpacity, StyleSheet, Animated, Easing, Text } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useFocusEffect } from '@react-navigation/native';

// const CustomTabBar = ({ state, descriptors, navigation }) => {
//   const buttonSize = useRef(new Animated.Value(1)).current;
//   const buttonWidth = useRef(new Animated.Value(60)).current; // Initial collapsed width
//   const blinkAnimation = useRef(new Animated.Value(0)).current;
//   const [isButtonVisible, setIsButtonVisible] = useState(true);
//   const [isButtonExpanded, setIsButtonExpanded] = useState(false);

//   useFocusEffect(
//     React.useCallback(() => {
//       const currentRouteName = state.routes[state.index].name;
//       setIsButtonVisible(currentRouteName !== 'Form');
//       if (currentRouteName !== 'Form') {
//         setIsButtonExpanded(false); // Ensure button is collapsed when returning from Form
//         buttonWidth.setValue(60); // Reset button width to collapsed state
//       }
//     }, [state.index, state.routes])
//   );

//   const startBlinkingAnimation = () => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(blinkAnimation, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(blinkAnimation, {
//           toValue: 0,
//           duration: 500,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   };

//   useEffect(() => {
//     // Start blinking animation when component mounts
//     startBlinkingAnimation();
//   }, []);

//   useEffect(() => {
//     if (isButtonVisible) {
//       // Restart blinking animation when the button becomes visible
//       startBlinkingAnimation();
//     }
//   }, [isButtonVisible]);

//   const toggleButtonSize = () => {
//     const targetWidth = isButtonExpanded ? 60 : 320; // Toggle between collapsed and expanded widths
//     Animated.timing(buttonWidth, {
//       toValue: targetWidth,
//       duration: 300,
//       easing: Easing.out(Easing.ease),
//       useNativeDriver: false, // Width animation does not support native driver
//     }).start(() => {
//       setIsButtonExpanded(!isButtonExpanded);
//     });
//   };

//   const handlePress = () => {
//     if (isButtonExpanded) {
//       navigation.navigate('Form');
//     } else {
//       toggleButtonSize();
//     }
//   };

//   const handleLongPress = () => {
//     if (isButtonExpanded) {
//       toggleButtonSize(); // Collapse the button on long press if it is expanded
//     }
//   };

//   return (
//     <View style={styles.tabBar}>
//       {state.routes.map((route, index) => {
//         const { options } = descriptors[route.key];
//         const label =
//           options.tabBarLabel !== undefined
//             ? options.tabBarLabel
//             : options.title !== undefined
//             ? options.title
//             : route.name;

//         const isFocused = state.index === index;

//         let iconName;
//         if (route.name === 'Rainfall') {
//           iconName = isFocused ? 'rainy' : 'rainy-outline';
//         } else if (route.name === 'Waterlevel') {
//           iconName = isFocused ? 'water' : 'water-outline';
//         } else if (route.name === 'Crowdsourcing') {
//           iconName = isFocused ? 'accessibility' : 'accessibility-outline';
//         } else if (route.name === 'Rail') {
//           iconName = isFocused ? 'train' : 'train-outline';
//         } else if (route.name === 'About-Us') {
//           iconName = isFocused ? 'ellipsis-horizontal' : 'ellipsis-horizontal-outline';
//         } else if (route.name === 'Form') { // Conditionally render "Form" screen
//           return null;
//         }

//         const onPress = () => {
//           const event = navigation.emit({
//             type: 'tabPress',
//             target: route.key,
//             canPreventDefault: true,
//           });

//           if (!isFocused && !event.defaultPrevented) {
//             navigation.navigate(route.name);
//           }
//         };

//         return (
//           <TouchableOpacity
//             key={index}
//             onPress={onPress}
//             style={styles.tab}
//           >
//             <Ionicons name={iconName} size={24} color={isFocused ? 'tomato' : 'gray'} />
//             <Text style={[styles.label, { color: isFocused ? 'tomato' : 'gray' }]}>
//               {label}
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//       {isButtonVisible && (
//         <TouchableOpacity 
//           onPress={handlePress} 
//           onLongPress={handleLongPress} 
//           style={styles.buttonContainer}
//         >
//           <Animated.View style={[styles.button, { transform: [{ scale: buttonSize }], width: buttonWidth }]}>
//             {isButtonExpanded && (
//               <Animated.Text style={[styles.buttonText, { opacity: blinkAnimation }]}>
//                 Click to Report Flood in Your Area
//               </Animated.Text>
//             )}
//             <Ionicons name="add-circle" size={32} color="white" />
//           </Animated.View>
//         </TouchableOpacity>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   tabBar: {
//     flexDirection: 'row',
//     height: 60,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//   },
//   tab: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 80,
//     alignSelf: 'center',
//   },
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'tomato',
//     marginLeft: 5,
//     padding: 10,
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     marginLeft: 5,
//   },
//   label: {
//     fontSize: 8, // Adjust the font size as needed
//     marginTop: 2, // Adjust the spacing between icon and label as needed
//   },
// });

// export default CustomTabBar;
