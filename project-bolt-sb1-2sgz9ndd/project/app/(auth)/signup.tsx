import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { router, Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Picker } from '@react-native-picker/picker';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Valeur par défaut: utilisateur normal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si tous les champs sont remplis
      if (!fullName || !phone || !email || !password) {
        setError("Veuillez remplir tous les champs");
        return;
      }

      // Inscription avec Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            roles: role
          }
        }
      });

      if (signUpError) throw signUpError;

      // Créer explicitement le profil (au cas où le trigger ne fonctionne pas parfaitement)
      const { data: { user } } = await supabase.auth.getUser();
        console.log(user)
        
      if (user) {
      await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            user_id: user.id,
            full_name: fullName,
            phone: phone,
            roles: role
        });
      }

      // Succès - redirection vers la page de connexion
      alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      router.replace('/(auth)/login');
    } catch (error) {
      setError("Erreur lors de l'inscription. Veuillez réessayer.");
      console.error("Erreur d'inscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&h=200&fit=crop' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Clean city</Text>
        <Text style={styles.subtitle}>Inscription</Text>
      </View>

      <View style={styles.form}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <TextInput 
          style={styles.input}
          placeholder="Nom complet"
          placeholderTextColor="#6B7280"
          value={fullName}
          onChangeText={setFullName}
        />
        
        <TextInput 
          style={styles.input}
          placeholder="Numéro de téléphone"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        
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
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Inscription...' : "S'inscrire"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Déjà un compte?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D4B34',
  },
  header: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    color: '#1F2937',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 5,
  },
  loginText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#E5E7EB',
  },
  loginLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#4CAF50',
  },
});