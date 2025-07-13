import CustomButton from "@/components/CustomButton";
import { useGlobalContext } from "@/context/GlobalProvider";
import { getFileView, resetTodayWaterIntake, signOut, updateUser, uploadProfilePicture } from "@/lib/appwrite";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const {
    user,
    setUser,
    setIsLoggedIn,
    setCurrentWater,
    resetUserData,
  } = useGlobalContext();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Load profile image when component mounts
  useEffect(() => {
    if (user?.profilePictureId) {
      setProfileImage(getFileView(user.profilePictureId).toString());
    }
  }, [user?.profilePictureId]);

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);
    resetUserData();
    router.replace("/(auth)/login");
  };

  const resetCurrentWater = async () => {
    if (!user) return;

    Alert.alert(
      "Reset Today's Water Intake",
      "Are you sure you want to reset today's water intake? This will delete all water logs for today and cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsResetting(true);
            try {
              const result = await resetTodayWaterIntake(user.$id);
              
              // Reset local state
              setCurrentWater(0);
              
              Alert.alert(
                "Success", 
                `Reset completed! Deleted ${result.deletedLogsCount} water logs for today.`
              );
              
              router.replace("/(tabs)/home");
            } catch (error) {
              console.error('Error resetting water intake:', error);
              Alert.alert('Error', 'Failed to reset water intake. Please try again.');
            } finally {
              setIsResetting(false);
            }
          }
        }
      ]
    );
  };

  const navigateToAccountInfo = () => {
    router.push("/(stack)/account-info");
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to make this work!'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Upload the image to Appwrite storage
      const uploadedFile = await uploadProfilePicture(imageUri);
      
      // Update user document with the new profile picture ID
      const updatedUser = await updateUser(user.$id, {
        profilePictureId: uploadedFile.$id
      });

      // Update the user in context
      setUser(updatedUser);
      
      // Set the profile image for immediate display
      setProfileImage(getFileView(uploadedFile.$id).toString());

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Choose Profile Picture',
      'Select an option to update your profile picture',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 relative">
      {/* Half circle */}
      <View
        style={{ borderBottomLeftRadius: 110, borderBottomRightRadius: 110 }}
        className="absolute -top-8 w-[110%] h-1/3 bg-[#15507c] left-[-5%]"
      />

      {/* Name */}
      <View className="flex items-center top-32 absolute w-full">
        <Text className="text-4xl font-medium w-full text-center text-white">
          {user?.username}
        </Text>
      </View>

      {/* Profile picture */}
      <View className="absolute top-48 w-full flex items-center z-10">
        <TouchableOpacity 
          onPress={showImagePickerOptions}
          disabled={isUploading}
          className="relative"
        >
          <Image 
            source={
              profileImage 
                ? { uri: profileImage } 
                : require("../../assets/images/placeholder-profile..jpg")
            }
            className="w-28 h-28 rounded-full border-4 border-white bg-gray-200"
            style={{ opacity: isUploading ? 0.6 : 1 }}
          />
          {isUploading && (
            <View className="absolute inset-0 justify-center items-center">
              <Text className="text-white text-xs font-medium">Uploading...</Text>
            </View>
          )}
          <View className="absolute bottom-0 right-0 bg-blue-500 rounded-full w-8 h-8 justify-center items-center border-2 border-white">
            <Text className="text-white text-lg">+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Buttons & Info */}
      <View className="bg-white top-72 min-h-full rounded-3xl p-6 shadow-violet-700 shadow-lg">
        <CustomButton
          title="Account Info"
          handlePress={navigateToAccountInfo}
          containerStyles="bg-gray-200 w-full h-16 mb-4"
          textStyles="text-black font-normal text-lg"
        />
        <CustomButton
          title={isResetting ? "Resetting..." : "Reset Today Water Intake"}
          handlePress={resetCurrentWater}
          containerStyles={`w-full h-16 mb-4 ${isResetting ? 'bg-gray-400' : 'bg-gray-200'}`}
          textStyles="text-black font-normal text-lg"
        />
        <CustomButton
          title="Log out"
          handlePress={logout}
          containerStyles="bg-red-700 w-full h-16 mb-4"
          textStyles="text-white font-normal text-lg"
        />

        {/* About Section */}
        <View className="mt-8 border-t border-gray-200 pt-4">
          <Text className="text-center text-sm text-gray-500 mb-1">
            Version 1.0.0
          </Text>
          <Text className="text-center text-sm text-gray-500">
            Developed by: Mohamad Syahril Haiqal Bin Hamzah
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
