import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API principal — Backend Java no Railway
export const api = axios.create({
  baseURL: 'https://backend-5v4v.onrender.com',
});

// API do OCR — Backend Python no Render
export const apiOcr = axios.create({
  baseURL: 'https://backend-ocr-ivkg.onrender.com',
});

// Interceptor JWT para a API principal
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@EduManage:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));