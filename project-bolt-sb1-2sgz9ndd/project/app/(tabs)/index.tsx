import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Send } from 'lucide-react-native';
import { supabase } from '@/lib/supabase'; // Import ajouté

export default function CollectScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

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
        setLoading(true);
        
        // Récupère l'ID de l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          Alert.alert("Erreur", "Utilisateur non connecté");
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
          Alert.alert("Erreur", "Erreur lors de la demande: " + error.message);
        } else {
          setSuccessMessage("Votre demande a été envoyée avec succès. Un éboueur viendra bientôt collecter vos déchets.");
          Alert.alert(
            "Succès", 
            "Demande de collecte envoyée avec succès!",
            [{ text: "OK" }]
          );
        }
      } catch (err) {
        Alert.alert("Erreur", "Erreur lors de la demande: " + err.message);
      } finally {
        setLoading(false);
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

      {successMessage && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleCollectRequest}
        disabled={loading || !location}>
        <Send color="#FFFFFF" size={24} />
        <Text style={styles.buttonText}>
          {loading ? 'Envoi en cours...' : 'Demander une collecte'}
        </Text>
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
  successContainer: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#2D4B34',
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});