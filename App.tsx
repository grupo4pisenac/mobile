import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TopBar from './components/TopBar';
import BottomMenu from './components/BottomMenu';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SubmissionScreen from './screens/SubmissionScreen';

export default function App() {
  const [logado, setLogado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [currentTab, setCurrentTab] = useState('Inicio');

  useEffect(() => {
    async function verificarLogin() {
      const token = await AsyncStorage.getItem('@EduManage:token');
      setLogado(!!token);
      setVerificando(false);
    }
    verificarLogin();
  }, []);

  if (verificando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#002868" />
      </View>
    );
  }

  if (!logado) {
    return <LoginScreen onLoginSuccess={() => setLogado(true)} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'Submissão': return <SubmissionScreen />;
        case 'Historico': return <ListSubmissionsScreen />;
      case 'Inicio':
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <SafeAreaView style={styles.topSafeArea} />
      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.container}>
          <TopBar onLogout={() => setLogado(false)} />
          <View style={styles.content}>
            {renderContent()}
          </View>
          <BottomMenu activeTab={currentTab} setActiveTab={setCurrentTab} />
          <StatusBar style="light" backgroundColor="#002868" />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#002868' },
  mainWrapper: { flex: 1, backgroundColor: '#002868' },
  topSafeArea: { flex: 0, backgroundColor: '#002868' },
  bottomSafeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1 },
});
