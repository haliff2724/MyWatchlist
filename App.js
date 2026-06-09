import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import Details from './screens/(tabs)/details';
import Index from './screens/(tabs)/index';
import Profile from './screens/(tabs)/profile';
import Watchlist from './screens/(tabs)/watchlist';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MovieStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Index} />
      <Stack.Screen name="Details" component={Details} />
    </Stack.Navigator>
  );
}

function WatchlistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WatchlistHome" component={Watchlist} />
      <Stack.Screen name="Details" component={Details} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={{ 
          headerShown: false,
          tabBarStyle: { backgroundColor: '#1F1F1F', borderTopColor: '#2A2A2A' },
          tabBarActiveTintColor: '#E50914',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen 
          name="Movies" 
          component={MovieStack} 
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Watchlist" 
          component={WatchlistStack} 
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" size={size} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={Profile} 
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}