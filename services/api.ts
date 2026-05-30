import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  // IMPORTANTE: Substitua os X pelo seu IP real local.
  // Exemplo: 'http://192.168.X.X:8080' - veja seu endereço de IP e mude para a sua para logar. procure a linha no IP que começa com 192
  baseURL: 'http://192.168.1.2:8080',
});

// Note que adicionamos a palavra "async" antes do (config)
api.interceptors.request.use(async (config) => {
  // Substituímos o localStorage pelo AsyncStorage com o await
  const token = await AsyncStorage.getItem('@EduManage:token');
  
  // O NOSSO ESPIÃO:
  console.log("Interceptor da API disparado!");
  console.log("Token encontrado no app?", token ? "SIM! (Injetando...)" : "NÃO! (O token está vazio)");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});
