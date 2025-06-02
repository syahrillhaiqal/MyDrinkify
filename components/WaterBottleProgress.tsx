import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, ClipPath, Defs, LinearGradient, Stop } from 'react-native-svg';

interface WaterBottleProgressProps {
  current?: number;
  goal?: number;
  width?: number;
  height?: number;
}

const WaterBottleProgress: React.FC<WaterBottleProgressProps> = ({ 
  current = 0, 
  goal = 100, 
  width = 200, 
  height = 400 
}) => {
  // Calculate progress ratio (0 to 1)
  const progress = Math.min(Math.max(current / goal, 0), 1);

  // Animation values for wave movement (offset =  "Where are we in the animation?" (the timer))
  const wave1Offset = useRef(new Animated.Value(0)).current;
  const wave2Offset = useRef(new Animated.Value(0)).current;
  const [wave1Path, setWave1Path] = React.useState<string>('');
  const [wave2Path, setWave2Path] = React.useState<string>('');
  const [wave3Path, setWave3Path] = React.useState<string>('');
  
  // Track current offset values
  const currentWave1Offset = useRef<number>(0);
  const currentWave2Offset = useRef<number>(0);

  // The visible height of the water fill inside the bottle
  const bottleViewBoxHeight = 441.224;
  const waterLevel = (1 - progress) * bottleViewBoxHeight; // Y position where water surface should be

  useEffect(() => {
    // Create continuous wave animations
    const createWaveAnimation = (animatedValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        })
      );
    };

    // Start wave animations with different speeds for more natural effect
    const wave1Animation = createWaveAnimation(wave1Offset, 3000);
    const wave2Animation = createWaveAnimation(wave2Offset, 4000);

    wave1Animation.start();
    wave2Animation.start();

    return () => {
      wave1Animation.stop();
      wave2Animation.stop();
    };
  }, [wave1Offset, wave2Offset]);

  // Generate wave path (Path = "What should the wave look like right now?" (the visual result))
  const generateWavePath = (offset: number, amplitude: number = 15, frequency: number = 2): string => {
    const viewBoxWidth = 441.224;
    const points: string[] = [];
    const steps = 50; // Number of points to create smooth wave

    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * viewBoxWidth;
      const waveY = Math.sin((i / steps) * Math.PI * frequency + offset * Math.PI * 2) * amplitude;
      const y = waterLevel + waveY;
      points.push(`${x},${y}`);
    }

    // Create a closed path that fills from the wave down to the bottom
    const wavePath = `M 0,${waterLevel + amplitude + 10} L ${points.join(' L ')} L ${viewBoxWidth},${waterLevel + amplitude + 10} L ${viewBoxWidth},${bottleViewBoxHeight} L 0,${bottleViewBoxHeight} Z`;
    
    return wavePath;
  };

  // Update wave paths when animation values change
  useEffect(() => {
    const updateWaves = () => {
      const offset1 = currentWave1Offset.current;
      const offset2 = currentWave2Offset.current;

      setWave1Path(generateWavePath(offset1, 12, 2));
      setWave2Path(generateWavePath(offset2 + 0.5, 8, 1.5));
      setWave3Path(generateWavePath(offset1 + 0.3, 5, 3));
    };

    const listener1 = wave1Offset.addListener(({ value }) => {
      currentWave1Offset.current = value;
      updateWaves();
    });
    
    const listener2 = wave2Offset.addListener(({ value }) => {
      currentWave2Offset.current = value;
      updateWaves();
    });

    // Initial update
    updateWaves();

    return () => {
      wave1Offset.removeListener(listener1);
      wave2Offset.removeListener(listener2);
    };
  }, [wave1Offset, wave2Offset, waterLevel]);

  return (
    <View style={styles.container}>
      <Svg
        width={width}
        height={height}
        viewBox="105.5 55 230 230"
      >
        <Defs>
          {/* Define a clip path for the bottle shape */}
          <ClipPath id="bottleClip">
            <Path
              d="M282.847,152.109c-5.216-2.914-8.456-8.426-8.456-14.385s3.24-11.472,8.456-14.385
              c6.948-3.882,11.265-11.222,11.265-19.155c0-4.444-2.546-8.296-6.252-10.198v-5.3c3.503-0.344,6.25-3.305,6.25-6.897V67.2
              c0-9.994-6.044-18.827-15.397-22.503c-7.663-3.01-15.659-5.393-23.771-7.083c-5.32-1.104-9.182-5.9-9.182-11.403V14.22
              c0-7.841-6.415-14.22-14.3-14.22h-21.7c-7.885,0-14.3,6.379-14.3,14.22v11.99c0,5.503-3.857,10.299-9.175,11.404
              c-8.089,1.684-16.089,4.066-23.776,7.083c-4.559,1.791-8.425,4.862-11.178,8.88c-2.761,4.026-4.221,8.736-4.221,13.623v14.589
              c0,3.592,2.747,6.553,6.25,6.897v5.302c-3.703,1.902-6.248,5.754-6.248,10.196c0,7.934,4.316,15.274,11.264,19.155
              c5.216,2.914,8.456,8.425,8.456,14.385s-3.24,11.472-8.455,14.385c-6.948,3.881-11.265,11.22-11.265,19.155v225.94
              c0,24.272,19.747,44.02,44.02,44.02h58.96c24.273,0,44.021-19.748,44.021-44.02v-225.94
              C294.112,163.33,289.797,155.99,282.847,152.109z"
              fill="none"
            />
          </ClipPath>
          {/* Gradient for bottle background */}
          <LinearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#c7d2fe" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.7" />
          </LinearGradient>
        </Defs>

        {/* Bottle background/glass effect */}
        <Path
          d="M282.847,152.109c-5.216-2.914-8.456-8.426-8.456-14.385s3.24-11.472,8.456-14.385
          c6.948-3.882,11.265-11.222,11.265-19.155c0-4.444-2.546-8.296-6.252-10.198v-5.3c3.503-0.344,6.25-3.305,6.25-6.897V67.2
          c0-9.994-6.044-18.827-15.397-22.503c-7.663-3.01-15.659-5.393-23.771-7.083c-5.32-1.104-9.182-5.9-9.182-11.403V14.22
          c0-7.841-6.415-14.22-14.3-14.22h-21.7c-7.885,0-14.3,6.379-14.3,14.22v11.99c0,5.503-3.857,10.299-9.175,11.404
          c-8.089,1.684-16.089,4.066-23.776,7.083c-4.559,1.791-8.425,4.862-11.178,8.88c-2.761,4.026-4.221,8.736-4.221,13.623v14.589
          c0,3.592,2.747,6.553,6.25,6.897v5.302c-3.703,1.902-6.248,5.754-6.248,10.196c0,7.934,4.316,15.274,11.264,19.155
          c5.216,2.914,8.456,8.425,8.456,14.385s-3.24,11.472-8.455,14.385c-6.948,3.881-11.265,11.20-11.265,19.155v225.94
          c0,24.272,19.747,44.02,44.02,44.02h58.96c24.273,0,44.021-19.748,44.021-44.02v-225.94
          C294.112,163.33,289.797,155.99,282.847,152.109z"
          fill="url(#bottleGradient)"
        />

        {/* Animated water waves */}
        {progress > 0 && (
          <>
            {/* First wave layer */}
            <Path
              d={wave1Path}
              fill="#4DA6FF"
              fillOpacity={0.8}
              clipPath="url(#bottleClip)"
            />

            {/* Second wave layer for more depth */}
            <Path
              d={wave2Path}
              fill="#5BB3FF"
              fillOpacity={0.6}
              clipPath="url(#bottleClip)"
            />

            {/* Third wave layer for surface detail */}
            <Path
              d={wave3Path}
              fill="#6BC0FF"
              fillOpacity={0.4}
              clipPath="url(#bottleClip)"
            />
          </>
        )}

        {/* Draw the bottle outline on top */}
        <Path
          d="M282.847,152.109c-5.216-2.914-8.456-8.426-8.456-14.385s3.24-11.472,8.456-14.385
          c6.948-3.882,11.265-11.222,11.265-19.155c0-4.444-2.546-8.296-6.252-10.198v-5.3c3.503-0.344,6.25-3.305,6.25-6.897V67.2
          c0-9.994-6.044-18.827-15.397-22.503c-7.663-3.01-15.659-5.393-23.771-7.083c-5.32-1.104-9.182-5.9-9.182-11.403V14.22
          c0-7.841-6.415-14.22-14.3-14.22h-21.7c-7.885,0-14.3,6.379-14.3,14.22v11.99c0,5.503-3.857,10.299-9.175,11.404
          c-8.089,1.684-16.089,4.066-23.776,7.083c-4.559,1.791-8.425,4.862-11.178,8.88c-2.761,4.026-4.221,8.736-4.221,13.623v14.589
          c0,3.592,2.747,6.553,6.25,6.897v5.302c-3.703,1.902-6.248,5.754-6.248,10.196c0,7.934,4.316,15.274,11.264,19.155
          c5.216,2.914,8.456,8.425,8.456,14.385s-3.24,11.472-8.455,14.385c-6.948,3.881-11.265,11.20-11.265,19.155v225.94
          c0,24.272,19.747,44.02,44.02,44.02h58.96c24.273,0,44.021-19.748,44.021-44.02v-225.94
          C294.112,163.33,289.797,155.99,282.847,152.109z"
          fill="none"
          stroke="#000"
          strokeWidth={5}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WaterBottleProgress;