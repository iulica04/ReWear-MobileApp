// filepath: d:\ReWear-Frontend-ReactNative\rewear\app\_layout.tsx
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Licorice: require('../assets/fonts/Licorice-Regular.ttf'),
    Lora : require('../assets/fonts/Lora-VariableFont_wght.ttf'),
  });

  if (!loaded) return null;

  return <Stack />;
}