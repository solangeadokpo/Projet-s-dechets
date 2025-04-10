import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single();

      // Rediriger vers l'interface appropriée selon le rôle
      if (profile?.role === 'collector') {
        router.replace('/(collector)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setError("Erreur de connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=200&fit=crop' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Azɔ̀ Yìkpɔ́</Text>
        <Text style={styles.subtitle}>Gestion des déchets</Text>
      </View>

      <View style={styles.form}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <TextInput 
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#6B7280"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput 
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#6B7280"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D4B34',
    padding: 20,
  },
  header: {
    marginTop: 100,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  form: {
    marginTop: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
});