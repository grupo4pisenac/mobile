import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  onLogout: () => void;
}

export default function TopBar({ onLogout }: Props) {

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          onLogout();
        }
      }
    ]);
  };

  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/logosenac.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.rightContainer}>
        {/* CORREÇÃO: Disparo de Alerta adicionado nas Notificações */}
        <TouchableOpacity 
          style={styles.bellButton}
          onPress={() => Alert.alert('Notificações', 'Você não tem novas notificações no momento.')}
        >
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          <View style={styles.badge} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 67, width: '100%', backgroundColor: '#002868',
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
  },
  logo: { height: 35, width: 100 },
  rightContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bellButton: { position: 'relative' },
  badge: {
    position: 'absolute', top: 0, right: 2, width: 10, height: 10,
    borderRadius: 5, backgroundColor: '#F47920', borderWidth: 1.5, borderColor: '#002868',
  },
  logoutButton: { padding: 4 },
  profilePic: { height: 40, width: 40, borderRadius: 20, borderWidth: 2, borderColor: '#2D4486' },
});