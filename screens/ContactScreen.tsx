import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function ContactScreen() {
  const [coordenador, setCoordenador] = useState({ nome: 'Carregando...', email: '...', telefone: '...' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/coordenador/info')
      .then(r => setCoordenador(r.data))
      .catch(() => setCoordenador({
        nome: 'Prof. Exemplo',
        email: 'exemplo@senac.br',
        telefone: '(81) 99999-9999'
      }));
    setLoading(false);
  }, []);

  const handleOpenManual = async () => {
    const url = 'https://faculdadesenacpe.edu.br/v19/wp-content/uploads/2022/05/MANUAL_DE_ATIVIDADE_COMPLEMENTAR_ADS.pdf';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o link do manual.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#002868" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Contatos e documentação</Text>
      
      {/* Card da Coordenação */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>Contato da coordenação</Text>
        
        <Text style={styles.label}>Coordenador</Text>
        <Text style={styles.value}>{coordenador.nome}</Text>
        
        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.value}>{coordenador.email}</Text>
        
        <Text style={styles.label}>Telefone</Text>
        <Text style={styles.value}>{coordenador.telefone}</Text>
        
        <View style={styles.separator} />
        
        <Text style={styles.label}>Atendimento:</Text>
        <Text style={styles.value}>Segunda a Sexta, das 08h às 17h.</Text>
      </View>

      {/* Card do Manual */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>Manual de atividades</Text>
        <Text style={styles.infoText}>
          Todas as informações sobre categorias aceitas, carga horária, documentação necessária e processo de validação.
        </Text>
        
        <Text style={styles.label}>Conteúdo</Text>
        <Text style={styles.listItem}>• Categorias de atividades aceitas;</Text>
        <Text style={styles.listItem}>• Carga horária mínima e máxima;</Text>
        <Text style={styles.listItem}>• Documentos para comprovação;</Text>
          <Text style={styles.listItem}>• Prazos e procedimentos;</Text>
          <Text style={styles.listItem}>• Critérios de avaliação;</Text>
          <Text style={styles.listItem}>• Perguntas frequentes (FAQ).</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleOpenManual}>
          <Ionicons name="open-outline" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Acesse o Manual</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#002868', marginBottom: 20 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, elevation: 3, marginBottom: 20 },
  cardHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#002868', marginBottom: 15 },
  label: { fontSize: 12, color: '#888', marginTop: 10 },
  value: { fontSize: 15, color: '#333', fontWeight: '500' },
  separator: { height: 1, backgroundColor: '#EEE', marginVertical: 15 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 10 },
  listItem: { fontSize: 14, color: '#444', marginBottom: 4, marginLeft: 5 },
  actionButton: {
    backgroundColor: '#F47920', flexDirection: 'row', padding: 15,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20
  },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
