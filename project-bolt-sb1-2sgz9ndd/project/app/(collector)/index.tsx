import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import type { CollectionRequest } from '@/lib/supabase';
import { MapPin, Route } from 'lucide-react-native';

export default function CollectorMapScreen() {
  const [location, setLocation] = useState(null);
  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState([]);
  const [showItinerary, setShowItinerary] = useState(false);

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

  // Sélection/désélection d'une demande pour l'itinéraire
  const toggleRequestSelection = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  // Génération de l'itinéraire (simpliste - pourrait être amélioré avec un vrai service de routage)
  const generateItinerary = () => {
    if (selectedRequests.length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins une demande");
      return;
    }

    // Coordonnées de l'éboueur comme point de départ
    const collectorCoords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    // Filtrer les demandes sélectionnées
    const selectedPoints = requests
      .filter(req => selectedRequests.includes(req.id))
      .map(req => ({
        latitude: req.latitude,
        longitude: req.longitude
      }));

    // Générer un itinéraire simple (point de départ + points sélectionnés)
    const route = [
      collectorCoords,
      ...selectedPoints,
      collectorCoords // Retour au point de départ
    ];

    setItinerary(route);
    setShowItinerary(true);
  };

  // Commencer la collecte
  const startCollection = async () => {
    // Mettre à jour le statut des demandes sélectionnées
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }

    // Mettre à jour le statut des demandes
    for (const requestId of selectedRequests) {
      await supabase
        .from('collection_requests')
        .update({
          status: 'in_progress',
          collector_id: user.id
        })
        .eq('id', requestId);
    }

    Alert.alert(
      "Collecte démarrée", 
      `Vous avez ${selectedRequests.length} points de collecte à visiter`,
      [
        { text: "OK" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Itinéraire de Collecte</Text>
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
              pinColor={selectedRequests.includes(request.id) ? "#FF9800" : "#999"}
              onPress={() => toggleRequestSelection(request.id)}>
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>Demande de collecte</Text>
                  <Text style={styles.calloutText}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity 
                    style={styles.calloutButton}
                    onPress={() => toggleRequestSelection(request.id)}>
                    <Text style={styles.calloutButtonText}>
                      {selectedRequests.includes(request.id) 
                        ? "Retirer de l'itinéraire" 
                        : "Ajouter à l'itinéraire"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}

          {/* Afficher l'itinéraire si demandé */}
          {showItinerary && (
            <Polyline
              coordinates={itinerary}
              strokeColor="#4CAF50"
              strokeWidth={4}
              lineDashPattern={[1]}
            />
          )}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loading ? 'Chargement...' : 'Erreur de localisation'}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.routeButton]} 
          onPress={generateItinerary}>
          <Route size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Générer Itinéraire</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.startButton]}
          onPress={startCollection}
          disabled={selectedRequests.length === 0}>
          <MapPin size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Démarrer la Collecte</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#FFF',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  routeButton: {
    backgroundColor: '#2D4B34',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginLeft: 8,
  },
});