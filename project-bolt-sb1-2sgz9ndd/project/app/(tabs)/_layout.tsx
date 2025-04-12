import { Tabs } from 'expo-router';
import { MapPin, User, ChartBar as BarChart3, Truck } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2D4B34',
          borderTopWidth: 0,
          elevation: 4,
          shadowOpacity: 0.2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 3,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#A8A8A8',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Collecte',
          tabBarIcon: ({ color, size }) => (
            <MapPin size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statistiques',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="collectors"
        options={{
          title: 'Collecteurs',
          tabBarIcon: ({ color, size }) => (
            <Truck size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}