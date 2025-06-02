import { Redirect, router } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import "../global.css";
import { useGlobalContext } from '@/context/GlobalProvider';

export default function App() {

  const {isLoading, isLoggedIn } = useGlobalContext();

  if(!isLoading && isLoggedIn ) return <Redirect href="/home" />

  return ( 
    <View className='bg-primary h-full'>

      {/* Wave png */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 400,            
      }}>
        <Image
          source={require('../assets/images/wave.png')}
          style={{ width: '100%', height: '100%' }}
          resizeMode="stretch"
        />
      </View>

      {/* MyDrinkify Logo */}
      <View className='items-center mt-[50px]'>
        <Image
        source={require('../assets/images/mydrinkify_logo.png')}
        className='w-64 h-32'
        resizeMode='contain'
        />
      </View>

      {/* Description */}
      <View className='absolute w-full justify-center items-center h-full px-4'>
          <Text className="text-[25px] text-white font-bold text-center">
            Stay Hydrated &{"\n"}
            Healthy with{" "}
            <Text className="text-secondary-200 text-blue-400">MyDrinkify</Text>
          </Text>
        <Text className="text-md text-gray-100 mt-7 text-center">
          Stay on top of your hydration, build healthy habits, and feel better every day — one sip at a time.
        </Text>
        <TouchableOpacity className="bg-blue-500 px-6 py-3 mt-[50px] rounded-lg w-96" onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-white text-base font-semibold text-center">Let&apos;s Hydrate Now!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

