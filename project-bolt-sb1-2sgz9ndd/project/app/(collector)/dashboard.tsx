import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Activity, ArrowUpRight, Trash2, TrendingUp, Award } from 'lucide-react-native';

export default function CollectorDashboard() {
  const [stats, setStats] = useState({
    totalCollections: 0,
    pendingRequests: 0,
    completedToday: 0, 
    totalWaste: 0
  });
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Récupérer le profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setUserName(profile.full_name);
        }
        
        // Récupérer les statistiques
        const today = new Date().toISOString().split('T')[0];
        
        // Nombre total de collectes
        const { count: totalCollections } = await supabase
          .from('collection_requests')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', user.id)
          .in('status', ['completed', 'in_progress']);
        
        // Nombre de demandes en attente
        const { count: pendingRequests } = await supabase
          .from('collection_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        // Collectes terminées aujourd'hui
        const { count: completedToday } = await supabase
          .from('collection_requests')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', user.id)
          .eq('status', 'completed')
          .gte('updated_at', today);
          
        // Total des déchets collectés (estimation basée sur le nombre de collectes * 15kg en moyenne)
        const totalWaste = (totalCollections || 0) * 15;
        
        setStats({
          totalCollections: totalCollections || 0,
          pendingRequests: pendingRequests || 0,
          completedToday: completedToday || 0,
          totalWaste
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>Bienvenue, {userName || 'Collecteur'}</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Statistiques principales */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Activity size={24} color="#4CAF50" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.totalCollections}</Text>
            <Text style={styles.statLabel}>Collectes totales</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#FF9800" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.completedToday}</Text>
            <Text style={styles.statLabel}>Complétées aujourd'hui</Text>
          </View>
          
          <View style={styles.statCard}>
            <Trash2 size={24} color="#2D4B34" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.totalWaste}kg</Text>
            <Text style={styles.statLabel}>Déchets collectés</Text>
          </View>
          
          <View style={styles.statCard}>
            <Award size={24} color="#9C27B0" style={styles.statIcon} />
            <Text style={styles.statValue}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Demandes en attente</Text>
          </View>
        </View>
        
        {/* Performances mensuelles */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance mensuelle</Text>
          </View>
          <View style={styles.performanceBar}>
            <View style={[styles.progressBar, { width: '75%' }]} />
            <Text style={styles.performanceText}>75% de votre objectif</Text>
          </View>
          <Text style={styles.performanceSubtext}>30 collectes sur 40 prévues ce mois</Text>
        </View>
        
        {/* Actions rapides */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
          </View>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Voir les demandes</Text>
              <ArrowUpRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={styles.secondaryActionText}>Planifier ma journée</Text>
              <ArrowUpRight size={16} color="#2D4B34" />
            </TouchableOpacity>
          </View>
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
  subtitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
  },
  performanceBar: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
  },
  performanceText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    paddingTop: 1,
  },
  performanceSubtext: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2D4B34',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  secondaryActionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#2D4B34',
  },
});