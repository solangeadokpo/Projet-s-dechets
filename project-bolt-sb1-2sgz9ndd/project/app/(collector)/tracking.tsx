import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { MapPin, Truck, User, RefreshCw } from 'lucide-react-native';
import * as Linking from 'expo-linking';

export default function TrackingScreen() {
  const [location, setLocation] = useState(null);
  const [activeCollections, setActiveCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Demander la permission de localisation
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission de localisation refusée');
          return;
        }

        // Obtenir la position actuelle
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Charger les collections actives
        fetchActiveCollections();
      } catch (err) {
        setError('Erreur de localisation');
        console.error(err);
      }
    })();
  }, []);

  // Configuration de la mise à jour de la position en temps réel
  useEffect(() => {
    let subscription;
    
    (async () => {
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // mise à jour tous les 10 mètres
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      } catch (err) {
        console.error('Erreur de suivi de position:', err);
      }
    })();

    // Configuration du canal de mise à jour depuis Supabase
    const dbSubscription = supabase
      .channel('collection_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collection_requests'
      }, () => {
        fetchActiveCollections();
      })
      .subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      dbSubscription.unsubscribe();
    };
  }, []);

  const fetchActiveCollections = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Utilisateur non connecté');
        return;
      }
      
      // Récupérer les collectes actives (acceptées ou en cours)
      const { data, error } = await supabase
        .from('collection_requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            phone
          )
        `)
        .in('status', ['in_progress', 'accepted'])
        .eq('collector_id', user.id);
        
      if (error) {
        console.error('Erreur lors de la récupération des collectes:', error);
        setError('Erreur de chargement');
      } else {
        console.log(`${data?.length || 0} collectes actives trouvées`);
        setActiveCollections(data || []);
      }
    } catch (err) {
      console.error('Exception:', err);
      setError('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLocation = (latitude, longitude) => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = `${scheme}${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const callClient = (phone) => {
    if (!phone) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suivi de Collecte</Text>
      </View>
      
      {location ? (
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation
            followsUserLocation>
            
            {/* Marqueur du collecteur */}
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Ma position">
              <View style={styles.collectorMarker}>
                <Truck size={20} color="#FFFFFF" />
              </View>
            </Marker>
            
            {/* Marqueurs des collectes actives */}
            {activeCollections.map((collection) => (
              <Marker
                key={collection.id}
                coordinate={{
                  latitude: collection.latitude,
                  longitude: collection.longitude,
                }}
                title={collection.profiles?.full_name || 'Client'}>
                <View style={styles.clientMarker}>
                  <User size={14} color="#FFFFFF" />
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{collection.profiles?.full_name || 'Client'}</Text>
                    <Text style={styles.calloutSubtitle}>
                      {collection.status === 'in_progress' ? 'En cours' : 'À collecter'}
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.calloutButton}
                      onPress={() => callClient(collection.profiles?.phone)}>
                      <Text style={styles.calloutButtonText}>Appeler</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.calloutButton, styles.navigateButton]}
                      onPress={() => navigateToLocation(collection.latitude, collection.longitude)}>
                      <Text style={styles.calloutButtonText}>Naviguer</Text>
                    </TouchableOpacity>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchActiveCollections}>
            <RefreshCw size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {activeCollections.length === 0 && !loading && (
            <View style={styles.noCollectionsOverlay}>
              <MapPin size={32} color="#4CAF50" />
              <Text style={styles.noCollectionsText}>Aucune collecte active</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {error || 'Chargement de la carte...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  collectorMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clientMarker: {
    backgroundColor: '#2D4B34',
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  callout: {
    padding: 12,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  calloutButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  navigateButton: {
    backgroundColor: '#2D4B34',
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  refreshButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2D4B34',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  noCollectionsOverlay: {
    position: 'absolute',
    alignItems: 'center',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -40,
  },
  noCollectionsText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#4B5563',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});