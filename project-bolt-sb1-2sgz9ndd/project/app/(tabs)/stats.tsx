import { useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { ArrowRight, Award, Leaf } from 'lucide-react-native';

export default function StatsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const screenWidth = Dimensions.get('window').width - 40;

  const collectionsData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
    datasets: [
      {
        data: [6, 8, 10, 12, 9, 11],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const wasteData = {
    labels: ['Mixte', 'Recyc.', 'Dang.'],
    datasets: [
      {
        data: [78, 56, 22],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
        <Text style={styles.subtitle}>Votre impact environnemental</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}>
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
              Semaine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}>
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              Mois
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('year')}>
            <Text style={[styles.periodButtonText, selectedPeriod === 'year' && styles.periodButtonTextActive]}>
              Année
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Collectes ce mois</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>156kg</Text>
            <Text style={styles.statLabel}>Déchets collectés</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Taux de recyclage</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Collectes mensuelles</Text>
          <LineChart
            data={collectionsData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(45, 75, 52, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(45, 75, 52, ${opacity})`,
              style: {
                borderRadius: 12,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#2D4B34',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 12,
            }}
          />
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Types de déchets (kg)</Text>
          <BarChart
            data={wasteData}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(45, 75, 52, ${opacity})`,
              style: {
                borderRadius: 12,
              },
              barPercentage: 0.7,
            }}
            style={{
              marginVertical: 8,
              borderRadius: 12,
            }}
          />
        </View>

        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Votre impact</Text>
          
          <View style={styles.impactCard}>
            <View style={styles.impactIconContainer}>
              <Leaf size={32} color="#4CAF50" />
            </View>
            <View style={styles.impactContent}>
              <Text style={styles.impactTitle}>Empreinte carbone réduite</Text>
              <Text style={styles.impactValue}>-124 kg CO2</Text>
            </View>
          </View>
          
          <View style={styles.impactCard}>
            <View style={styles.impactIconContainer}>
              <Award size={32} color="#4CAF50" />
            </View>
            <View style={styles.impactContent}>
              <Text style={styles.impactTitle}>Niveau écocitoyen</Text>
              <Text style={styles.impactValue}>Silver</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreDetailsButton}>
            <Text style={styles.moreDetailsText}>Voir plus de détails</Text>
            <ArrowRight size={16} color="#2D4B34" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4CAF50',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#2D4B34',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#2D4B34',
    marginBottom: 12,
  },
  impactSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: '#2D4B34',
    marginBottom: 12,
  },
  impactCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  impactContent: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#2D4B34',
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#4CAF50'
  },
});