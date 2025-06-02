import { Text, TouchableOpacity, View, Image, Button, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getCurrentUser } from '@/lib/appwrite'
import Ionicons from '@expo/vector-icons/Ionicons';
import WaterBottleProgress from '@/components/WaterBottleProgress'
import CustomButton from '@/components/CustomButton'
import { useGlobalContext } from '@/context/GlobalProvider'

const Home = () => {


  const {
    currentWater,
    goal,
    setGoal
  } = useGlobalContext();

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [tempGoal, setTempGoal] = useState('');
  const [modalVisibility, setModalVisibility] = useState(false);

  useEffect(() => {

    // Fetch the current user
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUsername(user.username);
        setIsLoading(false);
      }
    };
    fetchUser();

  }, []) // Added dependency array to prevent infinite loop

  const openModal = () => {
    setTempGoal(goal.toString());
    setModalVisibility(true);
  }

  const closeModal = () => {
    setModalVisibility(false);
    setTempGoal('');
  }

  const saveGoal = () => {
    const newGoal = parseInt(tempGoal);
    if (isNaN(newGoal) || newGoal <=0) {
      Alert.alert('Invalid Goal', 'Plese enter a valid number');
      return;
    }
    setGoal(newGoal);
    closeModal();
  }
    
  return (
    <SafeAreaView className="flex-1 px-4">

      <View className='flex flex-row justify-between items-center'>

        <View className="mt-2">
          <Text className="text-gray-600 text-base">Welcome Back</Text>
          <Text className="text-black text-3xl font-bold mt-1">
            {isLoading ? 'Loading...' : username}
          </Text>
        </View>

        <View className='flex flex-row gap-2'>

          <TouchableOpacity>
            <Ionicons
            name='notifications-outline'
            size={32}
            color={'#373737'}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons
            name='settings-outline'
            size={32}
            color={'#373737'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Water Bottle */}
      <View className='mt-[28px] mb-[15px]'>
        <WaterBottleProgress current={currentWater} goal={goal} width={225} height={450} />

        {/* Conditional rendering based on goal achievement */}
        {currentWater >= goal ? (
          <View className='flex-row justify-center'>
            <Text className='font-bold text-green-600 text-lg'>
              🎉 You have achieved your goal today! 🎉
            </Text>
          </View>
        ) : (
          <View className='flex-row justify-center'>
            <Text className='font-medium'>You have drink</Text>
            <Text className='text-blue-600'> {currentWater}ml </Text>
            <Text className='font-medium'>today</Text>
          </View>
        )}

        <View className='items-center mt-2'>
          <Text className='text-gray-500 text-sm'>Goal: {goal}ml</Text>
        </View>

        <View className='absolute left-1/2 -translate-x-1/2 bottom-[210px]'>
          <Text className='font-bold text-gray-700'>{goal-currentWater} ml left</Text>
        </View>
      </View>
      
      <View className='flex-row justify-center gap-3'>
        <CustomButton
        title='Set goal'
        handlePress={openModal}
        containerStyles='bg-[#4040e8] w-1/3 h-12'
        textStyles='text-white'
        />
      </View>

      {/* MODAL */}
      <Modal
          animationType='fade'
          transparent={true}
          visible={modalVisibility}
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}          
            style={{ flex: 1 }}
          >
            <View className='flex-1 bg-black/50 justify-center items-center'>
              {/* Modal Card */}
              <View className='w-96 bg-white rounded-xl p-6 shadow-lg'>
                
                {/* Modal header */}
                <View className='flex-row justify-between items-center mb-6'>
                  <Text className='text-xl font-bold text-gray-800'>Set Daily Goal</Text>
                  <TouchableOpacity onPress={closeModal} className='p-1'>
                    <Ionicons name='close' size={24} color='#6b7280' />
                  </TouchableOpacity>
                </View>

                {/* Current goal */}
                <View className='mb-4 items-center'>
                  <Text className='text-sm text-gray-600 mb-1'>Current Goal</Text>
                  <Text className='text-2xl font-semibold text-blue-600'>{goal}ml</Text>
                </View>

                {/* Daily goal input */}
                <View className='mb-6'>
                  <TextInput
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base'
                  placeholder='Enter your new daily goal'
                  placeholderTextColor={'gray'}
                  onChangeText={setTempGoal} // Set temp goal because user might cancel
                  />
                </View>
                
                {/* Button */}
                <View className='flex-row justify-end gap-2'>
                  <CustomButton
                  title='Cancel'
                  handlePress={closeModal}
                  containerStyles='bg-gray-100 w-1/4'
                  />
                  <CustomButton
                  title='Save'
                  handlePress={saveGoal}
                  containerStyles='bg-[#4040e8] w-1/4'
                  textStyles='text-white'
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* <Button title="Add 250 ml" onPress={() => setWater(Math.min(water + 250, goal))} />
      <Button title="Reset" onPress={() => setWater(0)} /> */}
    </SafeAreaView>
  )
  
}

export default Home