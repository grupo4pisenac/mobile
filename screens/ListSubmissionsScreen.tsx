import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

// Tipagem dos dados que vêm da API
interface Submission {
  id: string;
  titulo: string;
  cursoName: string;
  categoriaName: string;
  dataAtividade: string;
  quantidadeHoras: number;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
  motivoRecusa?: string;
}

export default function ListSubmissionsScreen() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [error, setError] = useState<string | null>(null);

  // Função para buscar os dados da API
  const loadSubmissions = async () => {
    try {
      setError(null);
      const response = await api.get('/atividades/minhas-submissoes');
      setSubmissions(response.data);
      setFilteredSubmissions(response.data);
    } catch (err) {
      // Fallback/Mock caso a API esteja offline. (Fins de testes do layout)
      const mockData: Submission[] = [
        { id: '1', titulo: 'Curso Extensão Python', cursoName: 'Design Gráfico', categoriaName: 'Cursos de Extensão', dataAtividade: '2026-05-10', quantidadeHoras: 20, status: 'APROVADO' },
        { id: '2', titulo: 'Palestra IA no Mercado', cursoName: 'Análise e Dev. Sistemas', categoriaName: 'Atividades Científicas', dataAtividade: '2026-05-28', quantidadeHoras: 4, status: 'PENDENTE' },
        { id: '3', titulo: 'Workshop UI/UX', cursoName: 'Design Gráfico', categoriaName: 'Cursos de Extensão', dataAtividade: '2026-04-15', quantidadeHoras: 12, status: 'REJEITADO', motivoRecusa: 'Certificado sem assinatura digital.' },
      ];
      setSubmissions(mockData);
      setFilteredSubmissions(mockData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Sistema de filtro rápido (Tabs)
  const handleFilter = (status: string) => {
    setStatusFilter(status);
    if (status === 'TODOS') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(item => item.status === status));
    }
  };

  // Cálculos dinâmicos para o Resumo do Topo
  const countAprovadas = submissions.filter(s => s.status === 'APROVADO').length;
  const countPendentes = submissions.filter(s => s.status === 'PENDENTE').length;
  const countRejeitadas = submissions.filter(s => s.status === 'REJEITADO').length;

  // Função auxiliar para estilizar as tags de Status
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return { color: '#2e7d32', bg: '#e8f5e9', icon: 'checkmark-circle' as const, label: 'Aprovado' };
      case 'REJEITADO':
        return { color: '#c62828', bg: '#ffebee', icon: 'close-circle' as const, label: 'Recusado' };
      default:
        return { color: '#f57c00', bg: '#fff3e0', icon: 'time' as const, label: 'Em Análise' };
    }
  };

  // Renderização de cada Card de Certificado
  const renderItem = ({ item }: { item: Submission }) => {
    const statusDetails = getStatusDetails(item.status);
    const formattedDate = new Date(item.dataAtividade).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    return (
      <View style={styles.card}>
        {/* Div trocado por View */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
          <View style={[styles.statusTag, { backgroundColor: statusDetails.bg }]}>
            <Ionicons name={statusDetails.icon} size={14} color={statusDetails.color} />
            <Text style={[styles.statusText, { color: statusDetails.color }]}>{statusDetails.label}</Text>
          </View>
        </View>

        <Text style={styles.cardSubtitle}>{item.cursoName} • {item.categoriaName}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{item.quantidadeHoras} hrs</Text>
          </View>
        </View>

        {item.status === 'REJEITADO' && item.motivoRecusa && (
          <View style={styles.recusaContainer}>
            <Text style={styles.recusaText}>⚠️ Motivo: {item.motivoRecusa}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#004A8D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Meus Certificados</Text>

      {/* NOVO: Bloco de Resumo Dinâmico */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryBox, { borderLeftColor: '#2e7d32' }]}>
          <Text style={styles.summaryValue}>{countAprovadas}</Text>
          <Text style={styles.summaryLabel}>Aprovadas</Text>
        </View>
        <View style={[styles.summaryBox, { borderLeftColor: '#f57c00' }]}>
          <Text style={styles.summaryValue}>{countPendentes}</Text>
          <Text style={styles.summaryLabel}>Análise</Text>
        </View>
        <View style={[styles.summaryBox, { borderLeftColor: '#c62828' }]}>
          <Text style={styles.summaryValue}>{countRejeitadas}</Text>
          <Text style={styles.summaryLabel}>Recusadas</Text>
        </View>
      </View>

      {/* ScrollView para os filtros */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {['TODOS', 'PENDENTE', 'APROVADO', 'REJEITADO'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, statusFilter === type && styles.filterButtonActive]}
              onPress={() => handleFilter(type)}
            >
              <Text style={[styles.filterButtonText, statusFilter === type && styles.filterButtonTextActive]}>
                {type === 'TODOS' ? 'Todas' : type === 'PENDENTE' ? 'Em Análise' : type.charAt(0) + type.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Envios */}
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSubmissions(); }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>Nenhum certificado encontrado.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  
  // Estilos do Resumo
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 8 },
  summaryBox: { flex: 1, backgroundColor: '#FFF', padding: 12, borderRadius: 8, borderLeftWidth: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryLabel: { fontSize: 12, color: '#666', marginTop: 2 },

  // Estilos dos Filtros atualizados
  filterContainer: { flexDirection: 'row', gap: 8, marginBottom: 16, paddingRight: 16 },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E0E0E0' },
  filterButtonActive: { backgroundColor: '#004A8D' }, // Ajustado para azul padrão educacional
  filterButtonText: { fontSize: 13, color: '#555', fontWeight: '500' },
  filterButtonTextActive: { color: '#FFF', fontWeight: 'bold' },

  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 8 },
  cardSubtitle: { fontSize: 13, color: '#666', marginBottom: 12 },
  
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  
  cardFooter: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, color: '#666' },
  
  recusaContainer: { marginTop: 10, padding: 8, backgroundColor: '#FFF5F5', borderRadius: 6, borderWidth: 1, borderColor: '#FFD2D2' },
  recusaText: { fontSize: 12, color: '#C62828', fontWeight: '500' },
  
  emptyContainer: { alignItems: 'center', marginTop: 40, gap: 8 },
  emptyText: { color: '#666', fontSize: 15 }
});
