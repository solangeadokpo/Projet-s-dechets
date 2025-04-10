import { View, Text, StyleSheet, Platform } from 'react-native';

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
      </View>
      
      <View style={styles.content}>
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
  content: {
    padding: 20,
  },
  statCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: '#2D4B34',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
});