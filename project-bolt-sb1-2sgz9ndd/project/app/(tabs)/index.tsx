import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Send } from 'lucide-react-native';

export default function CollectScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleCollectRequest = async () => {
  if (location) {
    try {
      // Récupère l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Utilisateur non connecté');
        return;
      }
      
      // Insertion de la demande de collecte
      const { error } = await supabase
        .from('collection_requests')
        .insert({
          user_id: user.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          status: 'pending'
        });
        
      if (error) {
        console.error('Erreur lors de la demande:', error.message);
      } else {
        // Afficher un message de succès ou une notification
        alert('Demande de collecte envoyée avec succès!');
      }
    } catch (err) {
      console.error('Erreur lors de la demande:', err);
    }
  }
};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demande de Collecte</Text>
      </View>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}>
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Votre position"
          />
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {errorMsg || 'Chargement de la carte...'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCollectRequest}>
        <Send color="#FFFFFF" size={24} />
        <Text style={styles.buttonText}>Demander une collecte</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#2D4B34',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#666666',
  },
  button: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});