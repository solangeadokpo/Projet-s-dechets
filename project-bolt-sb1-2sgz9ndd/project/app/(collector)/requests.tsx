import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { CollectionRequest } from '@/lib/supabase';
import { Check, X } from 'lucide-react-native';

export default function RequestsScreen() {
  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();

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

// Modification pour requests.tsx
const fetchRequests = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('collection_requests')
      .select(`
        *,
        profiles:user_id (
          full_name,
          phone
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
    } else {
      setRequests(data || []);
    }
  } catch (err) {
    console.error('Exception:', err);
  } finally {
    setLoading(false);
  }
};
  const handleAccept = async (requestId: string) => {
    const { error } = await supabase
      .from('collection_requests')
      .update({
        status: 'accepted',
        collector_id: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', requestId);

    if (!error) {
      fetchRequests();
    }
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase
      .from('collection_requests')
      .update({
        status: 'cancelled'
      })
      .eq('id', requestId);

    if (!error) {
      fetchRequests();
    }
  };

  const renderItem = ({ item }: { item: CollectionRequest & { profiles: any } }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {item.profiles?.full_name || 'Utilisateur'}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text style={styles.cardPhone}>
        {item.profiles?.phone || 'Pas de téléphone'}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleAccept(item.id)}>
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Accepter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleReject(item.id)}>
          <X size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Refuser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demandes en attente</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune demande en attente</Text>
            </View>
          }
        />
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
  },
  cardDate: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  cardPhone: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
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
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});