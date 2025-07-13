import CustomButton from '@/components/CustomButton'
import WaterBottleProgress from '@/components/WaterBottleProgress'
import { useGlobalContext } from '@/context/GlobalProvider'
import { getDailyGoal, getFileView, getUserLatestGoal, setDailyGoal, updateDailyGoal } from '@/lib/appwrite'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Home = () => {

  const {
    currentWater,
    setCurrentWater,
    goal,
    setGoal,
    user,
    setGoalID,
    goalID,
  } = useGlobalContext();

  const [tempGoal, setTempGoal] = useState('');
  const [hasGoalToday, setHasGoalToday] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    // Load profile image when component mounts
    if (user?.profilePictureId) {
      setProfileImage(getFileView(user.profilePictureId).toString());
    }
    
    // Fetch the current user and their goal
    const fetchGoal = async () => {
      try {
        const todayDate = getTodayDate();
        
        // Check if user has today's goal
        const todayGoal = await getDailyGoal(user.$id, todayDate);

        if(todayGoal) {
          // User already has goal for today
          setGoal(todayGoal.target);
          setGoalID(todayGoal.$id)
          setHasGoalToday(true);
          setCurrentWater(todayGoal.currentAchieved)
        }
        else {
          // User doesn't have goal for today
          setHasGoalToday(false);
          
          // Get user's latest goal to use as default
          const latestGoal = await getUserLatestGoal(user.$id);
          
          if(latestGoal) {
            // User has previous goals, create today's goal with same target
            const newGoalDoc = await setDailyGoal(user.$id, todayDate, latestGoal.target);
            
            setGoal(latestGoal.target);
            setGoalID(newGoalDoc.$id);
            setHasGoalToday(true);
            setCurrentWater(0); // Reset current water for new day
          }
          else {
            // New user - no previous goals, show modal to set first goal
            setGoal(0);
            setModalVisibility(true);
          }
        }
      } catch (error) {
        console.log('Error fetching goal:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoal();

  // router.replace('/(tabs)/calendar'); // FOR DEBUGGING

  }, [user]) // add user as dependency so it runs when user changes

  const getTodayDate = () => {
    return new Date().toLocaleDateString();
  };

  const openModal = () => {
    setTempGoal(goal.toString());
    setModalVisibility(true);
  }

  const closeModal = () => {
    setModalVisibility(false);
    setTempGoal('');
  }

  const navigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const saveGoal = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    const newGoal = parseInt(tempGoal);
    if (isNaN(newGoal) || newGoal <=0) {
      Alert.alert('Invalid Goal', 'Please enter a valid number');
      return;
    }

    try {
      const todayDate = getTodayDate();

      // If goal exists today, update existing goal
      if(hasGoalToday) {
        await updateDailyGoal(goalID, newGoal);
        setGoal(newGoal);
        Alert.alert('Goal Updated', `Your daily goal has been updated to ${newGoal}ml`);
      }
      else {
        // Create new goal for today
        const newGoalDoc = await setDailyGoal(user.$id, todayDate, newGoal);

        // UPDATE THE GLOBAL CONTEXT WITH THE NEW GOAL DATA
        setGoal(newGoal);
        setGoalID(newGoalDoc.$id);
        setHasGoalToday(true);
        Alert.alert('Goal Set', `Your daily goal has been set to ${newGoal}ml`);
      }

      closeModal();

    } catch (error) {
      console.log('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  }
    
  return (
    <SafeAreaView className="flex-1 px-4 bg-gray-50">

      <View className='flex flex-row justify-between items-center'>

        <View className="mt-2 flex-1">
          <Text className="text-gray-600 text-base">Welcome Back</Text>
          <Text className="text-black text-3xl font-bold mt-1">
            {isLoading ? 'Loading...' : (user?.username || 'User')}
          </Text>
        </View>

        {/* Profile Picture */}
        <TouchableOpacity 
          onPress={navigateToProfile}
          className="mt-2 ml-4"
        >
          <Image 
            source={
              profileImage 
                ? { uri: profileImage } 
                : require("../../assets/images/placeholder-profile..jpg")
            }
            className="w-12 h-12 rounded-full border-2 border-gray-300 bg-gray-200"
          />
        </TouchableOpacity>
      </View>

      {/* Water Bottle */}
      {!isLoading ? (
        <View className='mt-[28px] mb-[15px]'>
          <WaterBottleProgress current={currentWater} goal={goal} width={225} height={450} />

          {/* Conditional rendering based on goal achievement */}
          {currentWater >= goal && goal !== 0 ? (
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
            <Text className='font-bold text-gray-700'>{Math.max(0, goal - currentWater)} ml left</Text>
          </View>
        </View>
      ) : (
        // Loading state
        <View className='mt-[28px] mb-[15px] items-center justify-center h-[450px]'>
          <Text className='text-gray-500'>Loading your water goal...</Text>
        </View>
      )}
      
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
                  <Text className='text-xl font-bold text-gray-800'>
                    {hasGoalToday ? 'Update Daily Goal' : 'Set Daily Goal'}
                  </Text>
                  <TouchableOpacity onPress={closeModal} className='p-1'>
                    <Ionicons name='close' size={24} color='#6b7280' />
                  </TouchableOpacity>
                </View>

                {/* Current goal */}
                {hasGoalToday ? (
                  <View className='mb-4 items-center'>
                    <Text className='text-sm text-gray-600 mb-1'>Current Goal</Text>
                    <Text className='text-2xl font-semibold text-blue-600'>{goal}ml</Text>
                  </View>
                ) : (
                  <View className='mb-4 items-center'>
                    <Text className='text-sm text-gray-600 mb-1'>Welcome! Set your first daily water goal</Text>
                  </View>
                )}

                {/* Daily goal input */}
                <View className='mb-6'>
                  <TextInput
                  className='border border-gray-300 rounded-lg px-4 py-3 text-base'
                  placeholder='Enter your daily goal (ml)'
                  placeholderTextColor={'gray'}
                  keyboardType='numeric'
                  value={tempGoal}
                  onChangeText={setTempGoal} // Set temp goal because user might cancel
                  />
                </View>
                
                {/* Button */}
                <View className='flex-row justify-end gap-2'>
                  {hasGoalToday && (
                    <CustomButton
                    title='Cancel'
                    handlePress={closeModal}
                    containerStyles='bg-gray-100 w-1/4'
                    />
                  )}
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
    </SafeAreaView>
  )
  
}

export default Home