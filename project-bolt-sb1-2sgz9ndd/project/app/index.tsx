import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Index() {
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      // Pas de session, redirection vers login
      router.replace('/(auth)/login');
      return;
    }
    
    // Session trouvée, vérification du rôle
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single();
      
    if (profile?.role === 'collector') {
      router.replace('/(collector)');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2D4B34" />
    </View>
  );
}