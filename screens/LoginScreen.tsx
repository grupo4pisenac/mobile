import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Erro', 'Preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, perfil, nome } = response.data;

      if (perfil !== 'ALUNO') {
        Alert.alert('Acesso negado', 'Esta área é exclusiva para alunos.');
        return;
      }

      await AsyncStorage.setItem('@EduManage:token', token);
      await AsyncStorage.setItem('@EduManage:perfil', perfil);
      await AsyncStorage.setItem('@EduManage:nome', nome);
      await AsyncStorage.setItem('@EduManage:email', email.trim());

      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Falha no login', 'Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Image
          source={require('../assets/logosenac.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Gestão de Horas Complementares</Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@senac.com.br"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.buttonText}>ENTRAR</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#002868', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28 },
  logo: { height: 60, width: '100%', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#666', fontSize: 13, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#CCC', borderRadius: 8,
    padding: 12, fontSize: 14, backgroundColor: '#FAFAFA', color: '#333',
  },
  button: { backgroundColor: '#F47920', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
});