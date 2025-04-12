import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { 
  Activity, 
  ArrowUpRight, 
  Trash2, 
  TrendingUp, 
  Award,
  RefreshCw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

export default function CollectorDashboard() {
  const [stats, setStats] = useState({
    totalCollections: 0,
    pendingRequests: 0,
    completedToday: 0, 
    totalWaste: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

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

  // Fonction pour afficher un graphique circulaire de progression
  const CircularProgress = ({ percent, size = 120, strokeWidth = 12, color = "#4CAF50" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <View style={[styles.progressContainer, { width: size, height: size }]}>
        <View style={styles.progressBackground}>
          <Svg width={size} height={size}>
            <Circle
              stroke="#E5E7EB"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={color}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressPercent}>{percent}%</Text>
          <Text style={styles.progressLabel}>Complété</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête avec dégradé */}
      <LinearGradient
        colors={['#2D4B34', '#3d6b47']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>Bienvenue, {userName || 'Collecteur'}</Text>
      </LinearGradient>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Chargement des données...</Text>
          </View>
        ) : (
          <>
            {/* Statistiques principales avec animation */}
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <TouchableOpacity style={styles.statCard}>
                  <Activity size={28} color="#4CAF50" style={styles.statIcon} />
                  <Text style={styles.statValue}>{stats.totalCollections}</Text>
                  <Text style={styles.statLabel}>Collectes totales</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.statCard}>
                  <TrendingUp size={28} color="#FF9800" style={styles.statIcon} />
                  <Text style={styles.statValue}>{stats.completedToday}</Text>
                  <Text style={styles.statLabel}>Aujourd'hui</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.statRow}>
                <TouchableOpacity style={styles.statCard}>
                  <Trash2 size={28} color="#2D4B34" style={styles.statIcon} />
                  <Text style={styles.statValue}>{stats.totalWaste}<Text style={styles.statUnit}>kg</Text></Text>
                  <Text style={styles.statLabel}>Déchets collectés</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.statCard}>
                  <Award size={28} color="#9C27B0" style={styles.statIcon} />
                  <Text style={styles.statValue}>{stats.pendingRequests}</Text>
                  <Text style={styles.statLabel}>Demandes en attente</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Performances mensuelles avec graphique circulaire */}
            <View style={styles.performanceCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Performance mensuelle</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                  <RefreshCw size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.performanceContent}>
                <CircularProgress percent={75} />
                <View style={styles.performanceDetails}>
                  <Text style={styles.performanceTitle}>Bien joué!</Text>
                  <Text style={styles.performanceText}>30 collectes sur 40 prévues ce mois</Text>
                  <View style={styles.goalContainer}>
                    <View style={styles.goalLabel}>
                      <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                      <Text style={styles.goalText}>Complété</Text>
                    </View>
                    <Text style={styles.goalValue}>30</Text>
                  </View>
                  <View style={styles.goalContainer}>
                    <View style={styles.goalLabel}>
                      <View style={[styles.dot, { backgroundColor: '#E5E7EB' }]} />
                      <Text style={styles.goalText}>Objectif</Text>
                    </View>
                    <Text style={styles.goalValue}>40</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Actions rapides */}
            <View style={styles.actionsCard}>
              <Text style={styles.cardTitle}>Actions rapides</Text>
              <View style={styles.actionsList}>
                <TouchableOpacity style={styles.actionButton}>
                  <View style={styles.actionContent}>
                    <Trash2 size={24} color="#FFFFFF" />
                    <Text style={styles.actionText}>Voir les demandes</Text>
                  </View>
                  <ArrowUpRight size={20} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                  <View style={styles.actionContent}>
                    <Activity size={24} color="#2D4B34" />
                    <Text style={styles.secondaryActionText}>Planifier ma journée</Text>
                  </View>
                  <ArrowUpRight size={20} color="#2D4B34" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  statUnit: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
  },
  performanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  performanceDetails: {
    flex: 1,
    marginLeft: 20,
  },
  performanceTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
    marginBottom: 8,
  },
  performanceText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#4B5563',
    marginBottom: 16,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  goalText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  goalValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#1F2937',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsList: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2D4B34',
  },
  secondaryActionText: {
    color: '#2D4B34',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 12,
  },
});