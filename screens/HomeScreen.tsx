import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

interface AreaProgresso {
  area: string;
  limiteHoras: number;
  horasAprovadas: number;
  concluido: boolean;
  limiteSemestral: number;
  horasAprovadasSemestre: number;
  concluidoSemestre: boolean;
}

interface DashboardData {
  nomeAluno: string;
  nomeCurso: string;
  areas: AreaProgresso[];
  totalHorasAprovadas: number;
  totalHorasExigidas: number;
}

interface Curso {
  id: number;
  nome: string;
}

export default function HomeScreen() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');

  // Busca o ID do usuário logado via GET /dashboard/meus-cursos
  const fetchDados = useCallback(async () => {
    try {
      setLoading(true);
      const nomeStorage = await AsyncStorage.getItem('@EduManage:nome');
      if (nomeStorage) setNome(nomeStorage);

      // Busca os cursos do aluno logado
      const cursosRes = await api.get('/dashboard/meus-cursos');
      const cursosData: Curso[] = cursosRes.data;
      setCursos(cursosData);

      if (cursosData.length > 0) {
        const curso = cursoSelecionado || cursosData[0];
        if (!cursoSelecionado) setCursoSelecionado(cursosData[0]);

        // Busca o dashboard do aluno para o curso selecionado
        const dashRes = await api.get(`/dashboard/meu/curso/${curso.id}`);
        setDashboard(dashRes.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [cursoSelecionado]);

  useEffect(() => {
    fetchDados();
  }, []);

  const handleSelecionarCurso = async (curso: Curso) => {
    setCursoSelecionado(curso);
    try {
      setLoading(true);
      const dashRes = await api.get(`/dashboard/meu/curso/${curso.id}`);
      setDashboard(dashRes.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const porcentagem = dashboard
    ? Math.min(100, Math.round((dashboard.totalHorasAprovadas / dashboard.totalHorasExigidas) * 100))
    : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#002868" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>

      {/* Saudação */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {nome.split(' ')[0]}! 👋</Text>
        <Text style={styles.subGreeting}>Acompanhe seu progresso</Text>
      </View>

      {/* Seletor de curso (se tiver mais de um) */}
      {cursos.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cursosScroll}>
          {cursos.map((curso) => (
            <TouchableOpacity
              key={curso.id}
              style={[styles.cursoChip, cursoSelecionado?.id === curso.id && styles.cursoChipAtivo]}
              onPress={() => handleSelecionarCurso(curso)}
            >
              <Text style={[styles.cursoChipText, cursoSelecionado?.id === curso.id && styles.cursoChipTextAtivo]}>
                {curso.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {dashboard ? (
        <>
          {/* Card de progresso geral */}
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>{dashboard.nomeCurso}</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressHoras}>
                {dashboard.totalHorasAprovadas}h
              </Text>
              <Text style={styles.progressMeta}>
                / {dashboard.totalHorasExigidas}h
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${porcentagem}%` as any }]} />
            </View>
            <Text style={styles.progressPercent}>{porcentagem}% concluído</Text>
          </View>

          {/* Cards por área */}
          <Text style={styles.sectionTitle}>Progresso por Área</Text>
          {dashboard.areas.map((area, index) => {
            const pct = area.limiteHoras > 0
              ? Math.min(100, Math.round((area.horasAprovadas / area.limiteHoras) * 100))
              : 0;
            return (
              <View key={index} style={styles.areaCard}>
                <View style={styles.areaHeader}>
                  <View style={styles.areaIconContainer}>
                    <Ionicons
                      name={area.concluido ? "checkmark-circle" : "time-outline"}
                      size={20}
                      color={area.concluido ? "#2e7d32" : "#002868"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.areaName}>{area.area}</Text>
                    <Text style={styles.areaHoras}>
                      {area.horasAprovadas}h / {area.limiteHoras}h
                    </Text>
                  </View>
                  {area.concluido && (
                    <View style={styles.concluidoBadge}>
                      <Text style={styles.concluidoText}>Concluído</Text>
                    </View>
                  )}
                </View>
                <View style={styles.areaBar}>
                  <View style={[
                    styles.areaFill,
                    { width: `${pct}%` as any },
                    area.concluido && styles.areaFillConcluido
                  ]} />
                </View>
                <Text style={styles.areaSemestral}>
                  Semestral: {area.horasAprovadasSemestre}h / {area.limiteSemestral}h
                </Text>
              </View>
            );
          })}
        </>
      ) : (
        <View style={styles.centered}>
          <Ionicons name="school-outline" size={48} color="#CCC" />
          <Text style={styles.emptyText}>Nenhum curso vinculado.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 14 },
  header: { marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#002868' },
  subGreeting: { fontSize: 14, color: '#666', marginTop: 2 },
  cursosScroll: { marginBottom: 16 },
  cursoChip: {
    borderWidth: 1, borderColor: '#002868', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8,
  },
  cursoChipAtivo: { backgroundColor: '#002868' },
  cursoChipText: { color: '#002868', fontSize: 12 },
  cursoChipTextAtivo: { color: '#FFF' },
  progressCard: {
    backgroundColor: '#002868', borderRadius: 16, padding: 20, marginBottom: 20,
  },
  progressTitle: { color: '#FFF', fontSize: 13, opacity: 0.8, marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  progressHoras: { color: '#FFF', fontSize: 36, fontWeight: 'bold' },
  progressMeta: { color: '#FFF', fontSize: 16, opacity: 0.7, marginLeft: 4 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: '#F47920', borderRadius: 4 },
  progressPercent: { color: '#FFF', fontSize: 12, opacity: 0.8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  areaCard: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  areaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  areaIconContainer: { marginRight: 10 },
  areaName: { fontSize: 14, fontWeight: '600', color: '#333' },
  areaHoras: { fontSize: 12, color: '#666', marginTop: 2 },
  concluidoBadge: { backgroundColor: '#e8f5e9', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  concluidoText: { color: '#2e7d32', fontSize: 11, fontWeight: '600' },
  areaBar: { height: 6, backgroundColor: '#EEEEEE', borderRadius: 3, marginBottom: 6 },
  areaFill: { height: 6, backgroundColor: '#002868', borderRadius: 3 },
  areaFillConcluido: { backgroundColor: '#2e7d32' },
  areaSemestral: { fontSize: 11, color: '#999' },
});