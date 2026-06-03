import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopBar() {
  return (
    <View style={styles.header}>
      <Image
        source={require('../assets/logosenac.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.rightContainer}>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          <View style={styles.badge} />
        </TouchableOpacity>
        <Image
          source={require('../assets/usuario.png')}
          style={styles.profilePic}
        />
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
  rightContainer: { flexDirection: 'row', alignItems: 'center' },
  bellButton: { marginRight: 16, position: 'relative' },
  badge: {
    position: 'absolute', top: 0, right: 2, width: 10, height: 10,
    borderRadius: 5, backgroundColor: '#F47920', borderWidth: 1.5, borderColor: '#002868',
  },
  profilePic: { height: 40, width: 40, borderRadius: 20, borderWidth: 2, borderColor: '#2D4486' },
});