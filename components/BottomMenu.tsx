//
//  BottomMenu.tsx
//  
//
//  Created by Arthur Bem on 17/05/26.
//
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BottomMenu() {
  // Estado para controlar qual "página" está ativa no momento
  const [activeTab, setActiveTab] = useState('Inicio');

  // Lista com os botões para facilitar a manutenção e renderização
  const tabs = [
    { id: 'Inicio', title: 'Início', icon: 'home-outline' },
    { id: 'Submissão', title: 'Submissão', icon: 'document-outline' }, // Ícone de documento/submissão
    { id: 'Historico', title: 'Histórico', icon: 'time-outline' },
    { id: 'Contatos', title: 'Contatos', icon: 'book-outline' },
    { id: 'Perfil', title: 'Perfil', icon: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => setActiveTab(tab.id)} // Aqui futuramente chamaremos a função de trocar a view
          >
            {/* Container do ícone (ganha um fundo azul claro se estiver ativo, igual ao seu print) */}
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <Ionicons
                name={tab.icon as any} // 'as any' para evitar alertas de tipagem do Ionicons
                size={22}
                color={isActive ? '#002868' : '#7A7A7A'}
              />
            </View>
            
            {/* Texto abaixo do ícone */}
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 73,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    
    // Drop Shadow para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    // Drop Shadow para Android
    elevation: 15,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Faz os botões dividirem o espaço igualmente
  },
  iconContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: '#E6EBF5', // Fundo azul bem clarinho para destacar o ícone ativo
  },
  tabText: {
    fontSize: 10,
    color: '#7A7A7A', // Cinza para inativos
  },
  activeTabText: {
    color: '#002868', // Azul Senac para ativo
    fontWeight: 'bold',
  },
});
