import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  withSpring, 
  useAnimatedProps,
  withTiming,
  Easing
} from 'react-native-reanimated';
import Colors from '../constants/Colors';

interface FrequencyVisualizerProps {
  frequency: number;
  isActive: boolean;
  conversationMode: 'speaking' | 'listening';
}

// Create animated SVG Circle component with proper typing
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const FrequencyVisualizer: React.FC<FrequencyVisualizerProps> = ({ 
  frequency, 
  isActive,
  conversationMode 
}) => {
  // Base radius size for the circle
  const baseRadius = 40;
  
  // Animated radius value
  const radius = useSharedValue(baseRadius);
  const opacity = useSharedValue(0.8);

  // Update animation values when frequency changes
  useEffect(() => {
    if (!isActive) {
      radius.value = withTiming(baseRadius, { duration: 500, easing: Easing.ease });
      opacity.value = withTiming(0.5, { duration: 300 });
      return;
    }
    
    // Calculate target radius based on frequency range
    let targetRadius = baseRadius;
    if (frequency < 30) {
      targetRadius = baseRadius + 10; // Small circle for low frequency
    } else if (frequency < 300) {
      targetRadius = baseRadius + 30; // Medium circle for mid frequency
    } else {
      targetRadius = baseRadius + 60; // Large circle for high frequency
    }
    
    // Add small random variation for visual appeal
    const variation = Math.random() * 10 - 5;
    
    // Animate to the new radius
    radius.value = withSpring(targetRadius + variation, {
      damping: 10,
      stiffness: 80,
      mass: 1
    });
    
    // Adjust opacity based on activity
    opacity.value = withTiming(conversationMode === 'speaking' ? 0.9 : 0.7, { duration: 300 });
  }, [frequency, isActive, conversationMode]);
  
  // Create animated props for the circle with correct typing
  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={conversationMode === 'speaking' ? Colors.text : Colors.accent} />
            <Stop offset="1" stopColor={conversationMode === 'speaking' ? Colors.accent : Colors.primary} />
          </LinearGradient>
        </Defs>
        <AnimatedCircle
          cx="100"
          cy="100"
          fill="url(#grad)"
          animatedProps={animatedProps as any}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});

export default FrequencyVisualizer; 