import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal // <-- Novo import adicionado
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

interface SelectedFile {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

interface Course { id: string; name: string; }
interface Category { id: string; name: string; }

// =====================================================================
// NOVO COMPONENTE: Picker Inteligente (Dropdown no Android, Modal no iOS)
// =====================================================================
const CustomPicker = ({ selectedValue, onValueChange, items, placeholder, enabled = true }: any) => {
  const [showModal, setShowModal] = useState(false);

  // Se for iPhone, desenha um botão igual ao TextInput e abre a roleta em um Modal
  if (Platform.OS === 'ios') {
    const selectedLabel = items.find((i: any) => i.value === selectedValue)?.label || placeholder;
    return (
      <>
        <TouchableOpacity
          style={[styles.textInput, { justifyContent: 'center' }, !enabled && { backgroundColor: '#e0e0e0' }]}
          onPress={() => enabled && setShowModal(true)}
          activeOpacity={0.7}
        >
          <Text style={{ color: selectedValue ? '#333' : '#999' }}>{selectedLabel}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" style={{ position: 'absolute', right: 12 }}/>
        </TouchableOpacity>

        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.modalDoneText}>Concluído</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedValue}
                onValueChange={(val) => onValueChange(val)}
              >
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

  // Se for Android, usa o comportamento padrão nativo que já é uma linha compacta
  return (
    <View style={[styles.pickerContainer, !enabled && { backgroundColor: '#e0e0e0' }]}>
      <Picker
        enabled={enabled}
        selectedValue={selectedValue}
        onValueChange={onValueChange}
      >
        <Picker.Item label={placeholder} value="" style={{ color: '#999' }} />
        {items.map((item: any) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
};
// =====================================================================


export default function SubmissionScreen() {
  const [file, setFile] = useState<SelectedFile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [hours, setHours] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await api.get('/alunos/cursos');
        setCourses(response.data);
      } catch (err) {
        setCourses([
          { id: '1', name: 'Análise e Desenvolvimento de Sistemas' },
          { id: '2', name: 'Design Gráfico' }
        ]);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setCategories([]);
      return;
    }
    async function loadCategories() {
      try {
        const response = await api.get(`/cursos/${selectedCourse}/categorias`);
        setCategories(response.data);
      } catch (err) {
        setCategories([
          { id: 'cat1', name: 'Atividades Científicas (Palestras)' },
          { id: 'cat2', name: 'Cursos de Extensão' },
          { id: 'cat3', name: 'Estágio Obrigatório Excedente' }
        ]);
      }
    }
    loadCategories();
  }, [selectedCourse]);

  const handleSelectFile = async () => {
    try {
      setError(null);
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const selectedAsset = result.assets[0];

      if (selectedAsset.mimeType && !ALLOWED_TYPES.includes(selectedAsset.mimeType)) {
        setError('Formato inválido. Apenas JPEG, PNG ou PDF.');
        return;
      }
      if (selectedAsset.size && selectedAsset.size > MAX_SIZE_BYTES) {
        setError('O arquivo excede o limite de 10MB.');
        return;
      }

      setFile({
        uri: selectedAsset.uri,
        name: selectedAsset.name,
        mimeType: selectedAsset.mimeType,
        size: selectedAsset.size,
      });
    } catch (err) {
      setError('Erro ao selecionar o arquivo.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!file) return setError('Por favor, selecione o arquivo do certificado.');
    if (!selectedCourse) return setError('Selecione o curso relacionado.');
    if (!title.trim()) return setError('Insira o título da atividade.');
    if (!selectedCategory) return setError('Selecione a categoria.');
    if (!hours.trim() || isNaN(Number(hours)) || !Number.isInteger(Number(hours))) {
      return setError('Insira um número inteiro válido para as horas.');
    }

    setLoading(true);
    const formData = new FormData();
    
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    } as any);

    formData.append('cursoId', selectedCourse);
    formData.append('titulo', title);
    formData.append('categoriaId', selectedCategory);
    formData.append('dataAtividade', date.toISOString().split('T')[0]);
    formData.append('quantidadeHoras', hours);

    try {
      await api.post('/atividades/submeter', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Atividade submetida com sucesso!');
      setFile(null);
      setTitle('');
      setHours('');
    } catch (err) {
      setError('Falha ao enviar os dados para o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.screenTitle}>Nova Submissão</Text>

      <View style={[styles.card, error && !file ? styles.cardError : null]}>
        <Text style={styles.cardTitle}>Upload do Certificado</Text>
        <Text style={styles.cardSubtitle}>Formatos aceitos: JPEG, PNG ou PDF (Máx: 10MB)</Text>

        <TouchableOpacity
          style={[styles.uploadButton, file ? styles.uploadButtonSuccess : null]}
          onPress={handleSelectFile}
        >
          <Ionicons
            name={file ? "checkmark-circle-outline" : "cloud-upload-outline"}
            size={24}
            color={file ? "#2e7d32" : "#002868"}
          />
          <Text style={[styles.uploadButtonText, file ? styles.uploadButtonTextSuccess : null]}>
            {file ? file.name : "Selecionar arquivo do dispositivo"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, error && file ? styles.cardError : null]}>
        <Text style={styles.cardTitle}>Informações da Atividade</Text>

        <Text style={styles.inputLabel}>Curso Referente</Text>
        <CustomPicker
          selectedValue={selectedCourse}
          onValueChange={setSelectedCourse}
          items={courses.map(c => ({ label: c.name, value: c.id }))}
          placeholder="Selecione um curso..."
        />

        <Text style={styles.inputLabel}>Título da Atividade</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Ex: Curso Extensão Python"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.inputLabel}>Categoria</Text>
        <CustomPicker
          selectedValue={selectedCategory}
          onValueChange={setSelectedCategory}
          items={categories.map(cat => ({ label: cat.name, value: cat.id }))}
          placeholder={selectedCourse ? "Selecione uma categoria..." : "Selecione um curso primeiro"}
          enabled={selectedCourse !== ''}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Data de Emissão</Text>
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.dateButtonText}>{date.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Horas Computadas</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 20"
              keyboardType="numeric"
              value={hours}
              onChangeText={setHours}
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
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitButtonText}>SUBMETER ATIVIDADE</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardError: { borderColor: '#d32f2f', backgroundColor: '#fff8f8' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#002868', marginBottom: 12 },
  cardSubtitle: { fontSize: 12, color: '#666', marginBottom: 12 },
  uploadButton: {
    borderWidth: 1.5,
    borderColor: '#002868',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F9FAFC',
  },
  uploadButtonSuccess: { borderColor: '#2e7d32', backgroundColor: '#f1f8e9' },
  uploadButtonText: { color: '#002868', fontWeight: '600', fontSize: 13, flex: 1, textAlign: 'center' },
  uploadButtonTextSuccess: { color: '#2e7d32' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
  
  // Estilos compartilhados entre os inputs reais e os botões falsos do iOS
  textInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    height: 44, // Altura fixa para manter o padrão
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    height: 44,
    overflow: 'hidden'
  },
  
  // Estilos do Modal da Roleta (Exclusivos do iOS)
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalDoneText: {
    color: '#002868',
    fontWeight: 'bold',
    fontSize: 16,
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  dateButton: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 11,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
  },
  dateButtonText: { fontSize: 14, color: '#333' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  errorText: { color: '#d32f2f', fontSize: 13, fontWeight: '500', flex: 1 },
  submitButton: {
    backgroundColor: '#F47920',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#F47920',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  submitButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 }
});
