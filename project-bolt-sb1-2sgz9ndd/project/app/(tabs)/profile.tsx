import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Settings, Bell, CircleHelp as HelpCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.profile}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>Jean Dupont</Text>
        <Text style={styles.email}>jean.dupont@email.com</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Settings size={24} color="#2D4B34" />
          <Text style={styles.menuText}>Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Bell size={24} color="#2D4B34" />
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <HelpCircle size={24} color="#2D4B34" />
          <Text style={styles.menuText}>Aide</Text>
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
  profile: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: '#2D4B34',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
  },
  menu: {
    padding: 20,
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