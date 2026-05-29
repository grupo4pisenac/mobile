import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

// Correção dos caminhos para caminhos relativos:
import TopBar from '/Users/arthurbem/Documents/ADS senac/2026.1/PI/app-PI/components/TopBar.tsx';
import BottomMenu from '/Users/arthurbem/Documents/ADS senac/2026.1/PI/app-PI/components/BottomMenu.tsx';

export default function App() {
  return (
    // Wrapper principal para lidar com as cores diferentes no topo e na base (iOS)
    <View style={styles.mainWrapper}>
      {/* SafeAreaView do topo com o fundo Azul */}
      <SafeAreaView style={styles.topSafeArea} />
      
      {/* SafeAreaView da base com o fundo do App/Branco */}
      <SafeAreaView style={styles.bottomSafeArea}>
        <View style={styles.container}>
          
          <TopBar />
          
          {/* Aqui no meio é onde as suas "páginas" vão renderizar futuramente */}
          <View style={styles.content}>
            <Text style={{ color: '#666' }}>Submissão de horas complementares</Text>
          </View>

          <BottomMenu />

          <StatusBar style="light" backgroundColor="#002868" />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#002868', // Garante que a barra de status no topo seja azul
  },
  topSafeArea: {
    flex: 0,
    backgroundColor: '#002868',
  },
  bottomSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Garante que o fundo atrás do "risquinho" do iPhone seja branco
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Cor de fundo do meio do app
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
