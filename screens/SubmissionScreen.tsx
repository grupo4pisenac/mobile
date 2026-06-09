import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, ActivityIndicator, Platform, Modal, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, apiOcr } from '../services/api';

interface SelectedFile {
  uri: string;
  name: string;
  mimeType?: string;
}

interface Curso { id: number; nome: string; }
interface Regra { id: number; area: string; limiteHoras: number; }

// ── CustomPicker (iOS modal / Android nativo) ────────────────────────────────

const CustomPicker = ({ selectedValue, onValueChange, items, placeholder, enabled = true }: any) => {
  const [showModal, setShowModal] = useState(false);

  if (Platform.OS === 'ios') {
    const selectedLabel = items.find((i: any) => i.value === selectedValue)?.label || placeholder;
    return (
      <>
        <TouchableOpacity
          style={[styles.textInput, { justifyContent: 'center' }, !enabled && { backgroundColor: '#e0e0e0' }]}
          onPress={() => enabled && setShowModal(true)}
        >
          <Text style={{ color: selectedValue ? '#333' : '#999' }}>{selectedLabel}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" style={{ position: 'absolute', right: 12 }} />
        </TouchableOpacity>
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.modalDoneText}>Concluído</Text>
                </TouchableOpacity>
              </View>
              <Picker selectedValue={selectedValue} onValueChange={(val) => onValueChange(val)}>
                <Picker.Item label={placeholder} value="" />
                {items.map((item: any) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={[styles.pickerContainer, !enabled && { backgroundColor: '#e0e0e0' }]}>
      <Picker enabled={enabled} selectedValue={selectedValue} onValueChange={onValueChange}>
        <Picker.Item label={placeholder} value="" style={{ color: '#999' }} />
        {items.map((item: any) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
};

// ── Tela principal ────────────────────────────────────────────────────────────

export default function SubmissionScreen() {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [regras, setRegras] = useState<Regra[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | ''>('');
  const [selectedArea, setSelectedArea] = useState('');
  const [descricao, setDescricao] = useState('');
  const [horas, setHoras] = useState('');
  const [semestre, setSemestre] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca cursos do aluno
  useEffect(() => {
    api.get('/dashboard/meus-cursos')
      .then(r => setCursos(r.data))
      .catch(() => setCursos([]));
  }, []);

  // Busca regras do curso selecionado
  useEffect(() => {
    if (!selectedCursoId) { setRegras([]); return; }
    api.get(`/cursos/${selectedCursoId}/regras`)
      .then(r => setRegras(r.data))
      .catch(() => setRegras([]));
  }, [selectedCursoId]);

  // ── Selecionar arquivo ────────────────────────────────────────────────────

  const handleSelectFile = async () => {
    Alert.alert('Selecionar certificado', 'Como deseja enviar?', [
      {
        text: 'Câmera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permissão negada', 'Permita o acesso à câmera nas configurações.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (!result.canceled) {
            const asset = result.assets[0];
            setFile({ uri: asset.uri, name: 'certificado.jpg', mimeType: 'image/jpeg' });
            handleOcr({ uri: asset.uri, name: 'certificado.jpg', mimeType: 'image/jpeg' });
          }
        }
      },
      {
        text: 'Galeria / Arquivo',
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({
            type: ['image/jpeg', 'image/png', 'application/pdf'],
            copyToCacheDirectory: true,
          });
          if (!result.canceled) {
            const asset = result.assets[0];
            const selectedFile = { uri: asset.uri, name: asset.name, mimeType: asset.mimeType };
            setFile(selectedFile);
            handleOcr(selectedFile);
          }
        }
      },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  };

  // ── OCR ───────────────────────────────────────────────────────────────────

  const handleOcr = async (selectedFile: SelectedFile) => {
    setOcrLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'image/jpeg',
      } as any);

      const response = await apiOcr.post('/ocr/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // CORREÇÃO: Lê os dados do backend independentemente de ter flag "success"
      const data = response.data;
      const campos = data.solicitacao || data;

      if (campos) {
        if (campos.descricao) setDescricao(campos.descricao);
        if (campos.horasSolicitadas || campos.horas) setHoras(String(campos.horasSolicitadas || campos.horas));
        if (campos.semestre) setSemestre(String(campos.semestre));
        if (campos.area) setSelectedArea(campos.area);
        
        Alert.alert('✅ OCR concluído', 'Os dados foram preenchidos automaticamente. Revise antes de enviar.');
      }
    } catch (err) {
      console.log('OCR falhou, preenchimento manual necessário.', err);
      Alert.alert('Aviso OCR', 'Não foi possível preencher automaticamente. Por favor, insira os dados manuais.');
    } finally {
      setOcrLoading(false);
    }
  };

  // ── Submeter ──────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError(null);
    if (!selectedCursoId) return setError('Selecione o curso.');
    if (!selectedArea) return setError('Selecione a área da atividade.');
    if (!file) return setError('Selecione o certificado.');
    if (!descricao.trim()) return setError('Preencha a descrição.');
    if (!horas.trim() || isNaN(Number(horas))) return setError('Informe as horas corretamente.');

    setLoading(true);
    try {
      // 1. Upload do certificado para o Cloudinary
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'image/jpeg',
      } as any);

      const uploadRes = await apiOcr.post('/certificados/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const urlCertificado = uploadRes.data.urlCertificado;

      // 2. Buscar ID do aluno logado
      const token = await AsyncStorage.getItem('@EduManage:token');
      const payload = JSON.parse(atob(token!.split('.')[1]));
      const alunoId = payload.sub; // email — precisamos do ID via endpoint

      // Busca o ID real do aluno
      const alunosRes = await api.get('/usuarios/alunos');
      const nomeStorage = await AsyncStorage.getItem('@EduManage:nome');
      const aluno = alunosRes.data.find((a: any) => a.nome === nomeStorage);

      if (!aluno) throw new Error('Aluno não encontrado');

      // 3. Criar solicitação no backend Java
      await api.post(`/solicitacoes/aluno/${aluno.id}`, {
        descricao: descricao.trim(),
        area: selectedArea,
        horasSolicitadas: Number(horas),
        cursoId: selectedCursoId,
        urlCertificado,
      });

      Alert.alert('✅ Sucesso!', 'Atividade submetida com sucesso!');
      setFile(null);
      setDescricao('');
      setHoras('');
      setSemestre('');
      setSelectedArea('');
      setSelectedCursoId('');

    } catch (err: any) {
      setError('Falha ao enviar. Verifique sua conexão e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>Nova Submissão</Text>

      {/* Upload */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Certificado</Text>
        <Text style={styles.cardSubtitle}>JPEG, PNG ou PDF • Máx 10MB • OCR automático</Text>
        <TouchableOpacity
          style={[styles.uploadButton, file && styles.uploadButtonSuccess]}
          onPress={handleSelectFile}
        >
          {ocrLoading ? (
            <ActivityIndicator color="#002868" />
          ) : (
            <Ionicons
              name={file ? 'checkmark-circle-outline' : 'camera-outline'}
              size={24}
              color={file ? '#2e7d32' : '#002868'}
            />
          )}
          <Text style={[styles.uploadButtonText, file && styles.uploadButtonTextSuccess]}>
            {ocrLoading ? 'Processando OCR...' : file ? file.name : 'Tirar foto ou selecionar arquivo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Formulário */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações da Atividade</Text>

        <Text style={styles.inputLabel}>Curso</Text>
        <CustomPicker
          selectedValue={selectedCursoId}
          onValueChange={setSelectedCursoId}
          items={cursos.map(c => ({ label: c.nome, value: c.id }))}
          placeholder="Selecione o curso..."
        />

        <Text style={styles.inputLabel}>Área</Text>
        <CustomPicker
          selectedValue={selectedArea}
          onValueChange={setSelectedArea}
          items={regras.map(r => ({ label: r.area, value: r.area }))}
          placeholder={selectedCursoId ? 'Selecione a área...' : 'Selecione um curso primeiro'}
          enabled={selectedCursoId !== ''}
        />

        <Text style={styles.inputLabel}>Descrição</Text>
        <TextInput
          style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Descreva a atividade realizada..."
          value={descricao}
          onChangeText={setDescricao}
          multiline
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Horas</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 20"
              keyboardType="numeric"
              value={horas}
              onChangeText={setHoras}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Semestre</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 3"
              keyboardType="numeric"
              value={semestre}
              onChangeText={setSemestre}
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={18} color="#d32f2f" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.submitButtonText}>SUBMETER ATIVIDADE</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#E0E0E0', elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#002868', marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: '#666', marginBottom: 12 },
  uploadButton: {
    borderWidth: 1.5, borderColor: '#002868', borderStyle: 'dashed',
    borderRadius: 8, padding: 16, alignItems: 'center', flexDirection: 'row',
    gap: 8, backgroundColor: '#F9FAFC',
  },
  uploadButtonSuccess: { borderColor: '#2e7d32', backgroundColor: '#f1f8e9' },
  uploadButtonText: { color: '#002868', fontWeight: '600', fontSize: 13, flex: 1 },
  uploadButtonTextSuccess: { color: '#2e7d32' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
  textInput: {
    borderWidth: 1, borderColor: '#CCC', borderRadius: 8,
    padding: 10, fontSize: 14, backgroundColor: '#FAFAFA', height: 44,
  },
  pickerContainer: {
    borderWidth: 1, borderColor: '#CCC', borderRadius: 8,
    backgroundColor: '#FAFAFA', height: 44, overflow: 'hidden', justifyContent: 'center',
  },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#FFF', paddingBottom: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'flex-end', padding: 16,
    borderBottomWidth: 1, borderColor: '#EEE', backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  modalDoneText: { color: '#002868', fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  errorText: { color: '#d32f2f', fontSize: 13, flex: 1 },
  submitButton: {
    backgroundColor: '#F47920', borderRadius: 8, padding: 14,
    alignItems: 'center', marginTop: 20, elevation: 3,
  },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
});