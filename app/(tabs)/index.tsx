import { StyleSheet, View } from 'react-native';
import ThoughtsScreen from '../../components/screens/ThoughtsScreen';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <ThoughtsScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
