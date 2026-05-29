//
//  TopBar.tsx
//  
//
//  Created by Arthur Bem on 17/05/26.
//
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1. Declare as imagens AQUI FORA, antes da função do componente
const logoSenac = require('/Users/arthurbem/Documents/ADS senac/2026.1/PI/app-PI/assets/logosenac.png');
const fotoUsuario = require('/Users/arthurbem/Documents/ADS senac/2026.1/PI/app-PI/assets/usuario.png');

export default function TopBar() {
  return (
    <View style={styles.header}>
      {/* Lado Esquerdo: Logo */}
      <Image
        source={logoSenac} // 2. Use a variável aqui
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Lado Direito: Notificação e Perfil */}
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => console.log('Abrir notificações')}
        >
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          <View style={styles.badge} />
        </TouchableOpacity>

        <Image
          source={fotoUsuario} // 3. Use a variável aqui
          style={styles.profilePic}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 67,
    width: '100%',
    backgroundColor: '#002868',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    height: 35,
    width: 100,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F47920', // Laranja do Senac para o badge
    borderWidth: 1.5,
    borderColor: '#002868',
  },
  profilePic: {
    height: 40,
    width: 40,
    borderRadius: 20, // Deixa a imagem redonda
    borderWidth: 2,
    borderColor: '#2D4486', // Detalhe da borda da foto
  },
});
