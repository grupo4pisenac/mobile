import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface Curso { id: number; nome: string; }

interface DashboardCurso {
  nomeCurso: string;
  totalHorasAprovadas: number;
  totalHorasExigidas: number;
}

export default function ProfileScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [dashboards, setDashboards] = useState<DashboardCurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const nomeStorage = await AsyncStorage.getItem('@EduManage:nome');
        const emailStorage = await AsyncStorage.getItem('@EduManage:email');
        if (nomeStorage) setNome(nomeStorage);
        if (emailStorage) setEmail(emailStorage);

        const cursosRes = await api.get('/dashboard/meus-cursos');
        const cursosData: Curso[] = cursosRes.data;
        setCursos(cursosData);

        const dashPromises = cursosData.map((c: Curso) =>
          api.get(`/dashboard/meu/curso/${c.id}`).then(r => r.data).catch(() => null)
        );
        const dashResults = await Promise.all(dashPromises);
        setDashboards(dashResults.filter(Boolean));
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarPerfil();
  }, []);

  const getIniciais = (nome: string) => {
    const partes = nome.trim().split(' ');
    if (partes.length >= 2) return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
    return nome.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#002868" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getIniciais(nome)}</Text>
          </View>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => Alert.alert('Em breve', 'A edição de foto de perfil estará disponível em breve.')}
          >
            <Ionicons name="camera" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.nomeText}>{nome}</Text>
        {email ? <Text style={styles.emailText}>{email}</Text> : null}
      </View>

      {/* Informações pessoais */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações Pessoais</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#002868" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nome Completo</Text>
            <Text style={styles.infoValue}>{nome || '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color="#002868" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>E-mail Institucional</Text>
            <Text style={styles.infoValue}>{email || '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={18} color="#002868" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{cursos.length > 1 ? 'Cursos Ativos' : 'Curso Ativo'}</Text>
            {cursos.length > 0
              ? cursos.map((c, i) => <Text key={i} style={styles.infoValue}>{c.nome}</Text>)
              : <Text style={styles.infoValue}>Nenhum curso vinculado</Text>
            }
          </View>
        </View>

        <View style={styles.noteBox}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.noteText}>
            Os dados pessoais são gerenciados pelo sistema acadêmico. Para atualizações, entre em contato com a secretaria.
          </Text>
        </View>
      </View>

      {/* Resumo por curso */}
      {dashboards.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo Acadêmico</Text>
          {dashboards.map((dash, index) => {
            const pct = dash.totalHorasExigidas > 0
              ? Math.min(100, Math.round((dash.totalHorasAprovadas / dash.totalHorasExigidas) * 100))
              : 0;
            return (
              <View key={index} style={[index > 0 && { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderColor: '#EEE' }]}>
                <Text style={styles.cursoNome}>{dash.nomeCurso}</Text>
                <View style={styles.horasRow}>
                  <View style={styles.horasBox}>
                    <Text style={styles.horasValue}>{dash.totalHorasAprovadas}h</Text>
                    <Text style={styles.horasLabel}>Aprovadas</Text>
                  </View>
                  <View style={styles.horasBox}>
                    <Text style={styles.horasValue}>{dash.totalHorasExigidas}h</Text>
                    <Text style={styles.horasLabel}>Exigidas</Text>
                  </View>
                  <View style={styles.horasBox}>
                    <Text style={[styles.horasValue, { color: '#F47920' }]}>{pct}%</Text>
                    <Text style={styles.horasLabel}>Concluído</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#002868', alignItems: 'center', justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#F47920', borderRadius: 12, width: 24, height: 24,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFF',
  },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  nomeText: { fontSize: 20, fontWeight: 'bold', color: '#002868', marginBottom: 4 },
  emailText: { fontSize: 13, color: '#666' },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#E0E0E0', elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#002868', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },
  noteBox: { flexDirection: 'row', gap: 8, marginTop: 16, backgroundColor: '#F9F9F9', borderRadius: 8, padding: 12 },
  noteText: { fontSize: 12, color: '#666', flex: 1, lineHeight: 18 },
  cursoNome: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  horasRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  horasBox: { alignItems: 'center' },
  horasValue: { fontSize: 22, fontWeight: 'bold', color: '#002868' },
  horasLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  progressBar: { height: 6, backgroundColor: '#EEEEEE', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#F47920', borderRadius: 3 },
});