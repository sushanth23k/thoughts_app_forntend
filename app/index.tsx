import { Redirect } from 'expo-router';

export default function Index() {
  // Always start at the auth screen on app launch
  return <Redirect href="/auth" />;
} 