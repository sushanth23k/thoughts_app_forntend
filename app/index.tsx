import { Redirect } from 'expo-router';
import { useStore } from '../constants/Store';

export default function Index() {
  const user = useStore((state) => state.user);

  // If user is logged in, redirect to the conversation screen
  // Otherwise, redirect to the authentication screen
  if (user) {
    return <Redirect href={"conversation" as any} />;
  }

  return <Redirect href={"auth" as any} />;
} 