import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import type { CollectionRequest } from '@/lib/supabase';

export default function CollectorMapScreen() {
  const [location, setLocation] = useState(null);
  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('collection_requests')
        .select('*')
        .eq('status', 'pending');

      if (data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();

    // Abonnement aux nouvelles demandes
    const subscription = supabase
      .channel('collection_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collection_requests'
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demandes de Collecte</Text>
      </View>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {/* Position de l'éboueur */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Ma position"
            pinColor="#4CAF50"
          />

          {/* Demandes de collecte */}
          {requests.map((request) => (
            <Marker
              key={request.id}
              coordinate={{
                latitude: request.latitude,
                longitude: request.longitude,
              }}
              pinColor="#FF9800">
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>Demande de collecte</Text>
                  <Text style={styles.calloutText}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loading ? 'Chargement...' : 'Erreur de localisation'}
          </Text>
        </View>
      )}
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
  callout: {
    padding: 10,
    minWidth: 150,
  },
  calloutTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#666666',
  },
});