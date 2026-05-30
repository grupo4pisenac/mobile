import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, SafeAreaView } from 'react-native';

import TopBar from './components/TopBar';
import BottomMenu from './components/BottomMenu'; // Certifique-se de atualizar o BottomMenu para receber a prop
import SubmissionScreen from './screens/SubmissionScreen'; // Nova tela que vamos criar
import HomeScreen from './screens/HomeScreen'; // Uma view simples para a Home

export default function App() {
  // O estado agora fica no componente pai para controlar as telas
  const [currentTab, setCurrentTab] = useState('Inicio');

  // Função que renderiza a visualização correta com base na aba selecionada
    const renderContent = () => {
        switch (currentTab) {
          case 'Submissão':
            return <SubmissionScreen />;
          case 'Inicio':
          default:
            return <HomeScreen />;
        }
      };

  return (
    <View style={styles.mainWrapper}>
      <SafeAreaView style={styles.topSafeArea} />
      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.container}>
          <TopBar />
          
          {/* Renderização dinâmica da tela selecionada */}
          <View style={styles.content}>
            {renderContent()}
          </View>

          {/* Passamos o estado e a função de alteração para o menu inferior */}
          <BottomMenu activeTab={currentTab} setActiveTab={setCurrentTab} />

          <StatusBar style="light" backgroundColor="#002868" />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: '#002868' },
  topSafeArea: { flex: 0, backgroundColor: '#002868' },
  bottomSafeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { flex: 1 }
});
