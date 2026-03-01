import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Bienvenido a <Text style={styles.titleAccent}>Vértice</Text>
        </Text>
        <Text style={styles.subtitle}>
          Alojamiento estudiantil cerca de ti
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureTitle}>Búsqueda</Text>
            <Text style={styles.featureText}>Encuentra propiedades cercanas</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureTitle}>Chat</Text>
            <Text style={styles.featureText}>Habla con anfitriones</Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureTitle}>Reservas</Text>
            <Text style={styles.featureText}>Paga en USD o Bs</Text>
          </View>
        </View>
        
        <View style={styles.status}>
          <Text style={styles.statusTitle}>🚀 Estado del Proyecto</Text>
          <Text style={styles.statusText}>Fase 1: Fundamentos</Text>
          <Text style={styles.statusItem}>✅ Monorepo configurado</Text>
          <Text style={styles.statusItem}>✅ Backend Express</Text>
          <Text style={styles.statusItem}>✅ Frontend Next.js</Text>
          <Text style={styles.statusItem}>⏳ App Expo en progreso</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 20,
  },
  titleAccent: {
    color: '#4a6fa5',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  features: {
    marginTop: 30,
    gap: 16,
  },
  feature: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    marginTop: 30,
    backgroundColor: '#e8f0fe',
    padding: 16,
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#4a6fa5',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusItem: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    marginVertical: 2,
  },
});
