import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function EquipoScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/instituciones');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A1128', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#00FF00" />
    </View>
  );
}
