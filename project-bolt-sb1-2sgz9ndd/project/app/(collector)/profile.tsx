import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native';
import { Settings, LogOut, Award, Truck, MapPin, Activity, UserCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function CollectorProfileScreen() {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
  });
  const [stats, setStats] = useState({
    completedCollections: 0,
    averagePerDay: 0,
    totalDistance: 0,
    rating: 4.8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Récupérer le profil
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setProfile({
            ...profile,
            full_name: data.full_name || '',
            email: user.email || '',
            phone: data.phone || '',
            avatar_url: data.avatar_url || profile.avatar_url
          });
          
          // Ici, on pourrait récupérer des statistiques réelles à partir de la base de données
          // Pour l'instant, on utilise des données fictives
          setStats({
            completedCollections: 87,
            averagePerDay: 3.5,
            totalDistance: 120,
            rating: 4.8
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon Profil</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.subtitle}>Collecteur de déchets</Text>
          <View style={styles.ratingContainer}>
            <Award size={16} color="#FFB800" />
            <Text style={styles.ratingText}>{stats.rating.toFixed(1)}/5 - Collecteur étoile</Text>
          </View>
        </View>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Truck size={20} color="#4CAF50" />
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.completedCollections}</Text>
              <Text style={styles.statLabel}>Collectes</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Activity size={20} color="#4CAF50" />
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.averagePerDay}</Text>
              <Text style={styles.statLabel}>Moy/jour</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <MapPin size={20} color="#4CAF50" />
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{stats.totalDistance}km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Informations personnelles</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nom complet</Text>
            <Text style={styles.infoValue}>{profile.full_name}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Rôle</Text>
            <Text style={styles.infoValue}>Éboueur/Collecteur</Text>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <UserCircle size={22} color="#2D4B34" />
            <Text style={styles.menuText}>Modifier mon profil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={22} color="#2D4B34" />
            <Text style={styles.menuText}>Paramètres</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <LogOut size={22} color="#EF4444" />
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  ratingText: {
    marginLeft: 6,
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#92400E',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    height: '100%',
  },
  statTextContainer: {
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#1F2937',
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 32,
  },
 menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#1F2937',
  },
});