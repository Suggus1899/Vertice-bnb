import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="(auth)/register" options={{ title: 'Registrarse' }} />
        <Stack.Screen name="properties/[id]" options={{ title: 'Detalle' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
