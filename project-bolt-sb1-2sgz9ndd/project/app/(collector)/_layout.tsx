import { Tabs } from 'expo-router';
import { Home, ClipboardList, User, Truck, CheckCircle, Map } from 'lucide-react-native';

export default function CollectorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2D4B34',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#A8A8A8',
        tabBarLabelStyle: {
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Demandes',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />

      

        <Tabs.Screen
          name="tracking"
          options={{
            title: 'Suivi',
            tabBarIcon: ({ color, size }) => (
              <Truck size={size} color={color} />
            ),
          }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color, size }) => (
            <Map  size={size} color={color}/>
          ),
        }}
      />
       <Tabs.Screen
        name="active"
        options={{
          title: 'Collectes actives',
          tabBarIcon: ({ color, size }) => (
            <CheckCircle size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}