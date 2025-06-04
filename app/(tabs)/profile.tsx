import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useGlobalContext } from '@/context/GlobalProvider';
import { signOut } from '@/lib/appwrite';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';

const Profile = () => {

  const {
    user, 
    setUser, 
    setIsLoggedIn,
    setCurrentWater,
    currentWater,
    resetUserData
  } = useGlobalContext();

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
    resetUserData(); // reset global provider data

    router.replace("/(auth)/login");
  };

  const resetCurrentWater = () => {
    setCurrentWater(0);
    router.replace("/(tabs)/home");
  }

  return (
    <View className="flex-1 p-3">
      <View className="flex-1 justify-center items-center">
        <CustomButton
          title='Reset Today Water Intake'
          handlePress={resetCurrentWater}
          containerStyles='bg-[#4040e8] w-full h-12 mb-4'
          textStyles='text-white'
        />
        <CustomButton
          title='Log out'
          handlePress={logout}
          containerStyles='bg-red-700 w-full h-12 mb-4'
          textStyles='text-white'
        />
      </View>
    </View>
  )
}

export default Profile