import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Check, Clock, MapPin, AlertTriangle, Phone, Navigation } from 'lucide-react-native';
import * as Linking from 'expo-linking';

export default function ActiveCollectionsScreen() {
  const [activeCollections, setActiveCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveCollections = useCallback(async () => {
    try {
      setLoading(true);
      
      // Récupérer l'ID de l'utilisateur (éboueur) connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Récupérer les collectes en cours ou acceptées pour cet éboueur
        const { data, error } = await supabase
          .from('collection_requests')
          .select(`
            *,
            profiles:user_id (
              full_name,
              phone,
              address
            )
          `)
          .in('status', ['in_progress', 'accepted'])
          .eq('collector_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Erreur lors de la récupération des collectes actives:', error);
        } else {
          console.log('Collectes actives récupérées:', data?.length || 0);
          setActiveCollections(data || []);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchActiveCollections();
  }, [fetchActiveCollections]);

  useEffect(() => {
    fetchActiveCollections();

    const subscription = supabase
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
      subscription.unsubscribe();
    };
  }, [fetchActiveCollections]);

  const markAsCompleted = async (requestId) => {
    try {
      const { error } = await supabase
        .from('collection_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', requestId);
        
      if (error) {
        Alert.alert('Erreur', 'Impossible de marquer comme terminé');
      } else {
        Alert.alert('Succès', 'Collecte marquée comme terminée');
        fetchActiveCollections();
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const openMap = (latitude, longitude) => {
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

  const renderCollectionItem = ({ item }) => {
    const isInProgress = item.status === 'in_progress';
    const createdDate = new Date(item.created_at).toLocaleDateString();
    const createdTime = new Date(item.created_at).toLocaleTimeString();
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.cardTitle}>{item.profiles?.full_name || 'Client'}</Text>
            <View style={styles.statusContainer}>
              {isInProgress ? (
                <Clock size={14} color="#FF9800" style={styles.statusIcon} />
              ) : (
                <AlertTriangle size={14} color="#4CAF50" style={styles.statusIcon} />
              )}
              <Text style={[
                styles.statusText, 
                { color: isInProgress ? '#FF9800' : '#4CAF50' }
              ]}>
                {isInProgress ? 'En cours' : 'À collecter'}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>{createdDate}{'\n'}{createdTime}</Text>
        </View>
        
        <View style={styles.cardContact}>
          <TouchableOpacity onPress={() => callClient(item.profiles?.phone)} style={styles.phoneButton}>
            <Phone size={16} color="#2D4B34" style={styles.phoneIcon} />
            <Text style={styles.phoneText}>{item.profiles?.phone || 'Pas de téléphone'}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.cardLocation}
          onPress={() => openMap(item.latitude, item.longitude)}>
          <MapPin size={16} color="#6B7280" style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={2}>
            {item.profiles?.address || `Latitude: ${item.latitude.toFixed(6)}, Longitude: ${item.longitude.toFixed(6)}`}
          </Text>
          <Navigation size={16} color="#2D4B34" />
        </TouchableOpacity>
        
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => markAsCompleted(item.id)}>
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Marquer comme terminée</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collectes actives</Text>
      </View>
      
      <FlatList
        data={activeCollections}
        renderItem={renderCollectionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune collecte active pour le moment</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      />
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
  list: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'right',
  },
  cardContact: {
    marginBottom: 12,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIcon: {
    marginRight: 8,
  },
  phoneText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});