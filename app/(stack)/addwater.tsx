import CustomButton from '@/components/CustomButton';
import { useGlobalContext } from '@/context/GlobalProvider';
import { createWaterType, getUserWaterTypes, logWaterIntake, updateCurrentAchieved } from '@/lib/appwrite';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Addwater = () => {
  
  // Global context
  const {
    setCurrentWater,
    currentWater,
    goal,
    goalID,
    userID
  } = useGlobalContext();

  // State for water entry customization
  const [waterTitle, setWaterTitle] = useState('');
  const [waterVolume, setWaterVolume] = useState('100');
  const [tempWaterVolume, setTempWaterVolume] = useState('100')
  const [glassQuantity, setGlassQuantity] = useState('1');
  const [selectedColor, setSelectedColor] = useState('#3B82F6'); // Default blue
  const [customColor, setCustomColor] = useState('');
  const [notes, setNotes] = useState('');
  const [customColorModal, setCustomColorModal] = useState(false);
  const [volumeEditModal, setVolumeEditModal] = useState(false);

  // const [form, setForm] = useState({
  //       title: '',
  //       quantity: 1,
  //       color: '',
  //       notes: ''
  //   })
  
  // Predefined volume options
  const predefinedVolumes = [100, 150, 200, 250, 300, 500, 750, 1000];
  
  // Predefined colors
  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  useEffect(() => {
  })

  const openColorModal = () => {
    setCustomColorModal(true);
  }

  const closeColorModal = () => {
    setCustomColorModal(false);
  }

  const openVolumeModal = () => {
    setVolumeEditModal(true);
  }

  const closeVolumeModal = () => {
    setVolumeEditModal(false);
  }

  const handleColorSelect = (color: React.SetStateAction<string>) => {
    setSelectedColor(color);
  };

  // Handle custom color function
  const handleCustomColorApply = () => {
    if (customColor && customColor.match(/^#[0-9A-F]{6}$/i)) {
      setSelectedColor(customColor);
      closeColorModal();
    } else {
      Alert.alert('Invalid Color', 'Please enter a valid hex color (e.g., #FF0000)');
    }
  };

  // Handle quick volume selection function
  const saveVolumeSelect = () => {
    const newVolume = tempWaterVolume;
    setWaterVolume(newVolume);
    closeVolumeModal();
  };

  // Add current water function
  const addCurrentWater = async () => {
    console.log('GoalID:', goalID);
    if (!waterTitle || !glassQuantity || !selectedColor) {
      return Alert.alert("Error", "Please fill in all the fields.");
    }

    const volume = parseInt(waterVolume) || 100;
    const quantity = parseInt(glassQuantity) || 1;
    const totalAmount = volume * quantity;

    // This after the current exceeding goal
    if (currentWater >= goal) {
      Alert.alert(
        "Goal Achieved! 🎉", 
        "You already achieved your daily water goal!"
      );
      return;
    }
    
    try {    
      // This before it exceeding, because when added it can be exceeding if we only do the top condition
      const newWaterAmount = currentWater + totalAmount;
      
      if (newWaterAmount >= goal) {
        await updateCurrentAchieved(goalID, goal)
        setCurrentWater(goal);
        Alert.alert(
          "Congratulations! 🎉", 
          `You've reached your daily water goal! Added ${totalAmount}ml (${quantity} x ${volume}ml)`,
        );
      } else {
        await updateCurrentAchieved(goalID, newWaterAmount)
        setCurrentWater(newWaterAmount);
        Alert.alert(
          "Water Added! 💧",
          `Added ${totalAmount}ml (${quantity} x ${volume}ml) to your daily intake`
        );
      }

      // For storing water type
      const newWaterType = await createWaterType(userID, waterTitle, volume, selectedColor, notes);

      // For logging water in waterlogs
      await logWaterIntake(userID, newWaterType.$id, quantity,)

    } catch (error) {
      console.log('Error adding water:', error);
      Alert.alert('Error', 'Failed to add water. Please try again.');
    }

    router.dismiss();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}          
      style={{ flex: 1 }}
      className='bg-[#ffffff]'
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardDismissMode="interactive"
        >
          {/* Water glass */}
          <View className='items-center mt-5'>
            
            <Svg height={60} width={60} viewBox='0 0 24 24'>
              {/* Water fill area (inside only) */}
              <Path
                d="M6.06118 9L7.73343 20.1483C7.80686 20.6379 8.22737 21 8.72236 21H15.2776C15.7726 21 16.1931 20.6379 16.2666 20.1483L17.9388 9H6.06118Z"
                fill={selectedColor}
              />
              
              {/* Glass border */}
              <Path
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M5.16118 1C3.93844 1 3.00192 2.08747 3.1833 3.29668L5.75555 20.445C5.97584 21.9136 7.23738 23 8.72236 23H15.2776C16.7626 23 18.0241 21.9136 18.2444 20.445L20.8167 3.29668C20.9981 2.08747 20.0615 1 18.8388 1H5.16118ZM5.16118 3H18.8388L18.2388 7H5.76118L5.16118 3ZM6.06118 9L7.73343 20.1483C7.80686 20.6379 8.22737 21 8.72236 21H15.2776C15.7726 21 16.1931 20.6379 16.2666 20.1483L17.9388 9H6.06118Z" 
                fill="#333333"
              />
            </Svg>

            {/* Editable Volume */}
            <TouchableOpacity onPress={openVolumeModal}>
              <View className='flex-row justify-center gap-2 mt-1'>
                <Text className='font-semibold text-xl'>{waterVolume}ml</Text>
                <Ionicons
                  name="create-outline"
                  size={22}
                />
              </View>
            </TouchableOpacity>     
          </View>

          {/* Add Water Form */}
          <View className='bg-white mt-[50px] min-h-full rounded-3xl p-6 shadow-lg'>

            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">Title</Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-3 text-base"
                placeholder="Water, Juice, Tea..."
                placeholderTextColor={'gray'}
                value={waterTitle}
                onChangeText={setWaterTitle}
              />
            </View>

            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Number of Glasses ({parseInt(waterVolume) || 100}ml each)
              </Text>
              <TextInput
                keyboardType='numeric'
                className="border border-gray-300 rounded-xl p-3 text-base"
                placeholder="1, 2, 3..."
                placeholderTextColor={'gray'}
                value={glassQuantity}
                onChangeText={setGlassQuantity}
              />
              <Text className="text-sm text-gray-500 mt-1">
                Total: {(parseInt(waterVolume) || 100) * (parseInt(glassQuantity) || 1)}ml
              </Text>
            </View>
            
            {/* Predefined Colors */}
            <View className="flex-row flex-wrap mb-3 w-full justify-between">

              {/* Map all color from predefined color array */}
              {predefinedColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onPress={() => handleColorSelect(color)}
                />
              ))}
              
              {/* Custom Color Button */}
              <TouchableOpacity
                className="w-10 h-10 rounded-full border-2 border-dashed border-gray-400 items-center justify-center"
                onPress={openColorModal}
              >
                <Ionicons name="add" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">Notes (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-xl p-3 text-base min-h-[90px]"
                placeholder="Add any notes about this drink..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
                placeholderTextColor={'gray'}
                blurOnSubmit={false}
                returnKeyType="default"
                // For better multiline handling
                scrollEnabled={false} // Let the parent ScrollView handle scrolling
                style={{ textAlignVertical: 'top' }} // Ensure text starts at top
              />
            </View>
            
            <View className='items-center mt-6 mb-8'>
              <CustomButton
                title={`Add ${(parseInt(waterVolume) || 100) * (parseInt(glassQuantity) || 1)}ml`}
                handlePress={addCurrentWater}
                containerStyles='bg-[#4040e8] w-2/3 h-12'
                textStyles='text-white'
              />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* MODAL : Volume Edit */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={volumeEditModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}          
            style={{ flex: 1 }}
          >
            <View className='flex-1 bg-black/50 justify-center items-center'>
              <View className='w-80 bg-white rounded-xl p-6 shadow-lg'>
                
                {/* Form Header */}
                <View className='flex-row justify-between items-center mb-6'>
                  <Text className='text-xl font-bold text-gray-800'>Set Glass Volume</Text>
                  <TouchableOpacity onPress={closeVolumeModal} className='p-1'>
                    <Ionicons name='close' size={24} color='#6b7280' />
                  </TouchableOpacity>
                </View>

                {/* Quick Select Buttons */}
                <View className='mb-6'>
                  <Text className="text-base font-semibold text-gray-700 mb-3">Quick Select</Text>
                  <View className='flex-row flex-wrap gap-2'>
                    {predefinedVolumes.map((volume, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`px-3 py-2 rounded-lg border ${
                          tempWaterVolume === volume.toString() 
                            ? 'bg-[#4040e8] border-[#4040e8]' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                        onPress={() => setTempWaterVolume(volume.toString())}
                      >
                        <Text className={`text-sm font-medium ${
                          tempWaterVolume === volume.toString() ? 'text-white' : 'text-gray-700'
                        }`}>
                          {volume}ml
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Custom Input */}
                <View className='mb-6'>
                  <Text className="text-base font-semibold text-gray-700 mb-2">Custom Volume (ml)</Text>
                  <TextInput
                    className='border border-gray-300 rounded-lg px-4 py-3 text-base'
                    placeholder='Enter custom volume'
                    placeholderTextColor={'gray'}
                    value={tempWaterVolume}
                    onChangeText={setTempWaterVolume}
                    keyboardType='numeric'
                  />
                </View>
                
                {/* Buttons */}
                <View className='flex-row justify-end gap-2'>
                  <CustomButton
                    title='Cancel'
                    handlePress={closeVolumeModal}
                    containerStyles='bg-gray-100 w-1/4'
                  />
                  <CustomButton
                    title='Save'
                    handlePress={saveVolumeSelect}
                    containerStyles='bg-[#4040e8] w-1/4'
                    textStyles='text-white'
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL: Custom color */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={customColorModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}          
            style={{ flex: 1 }}
          >
            <View className='flex-1 bg-black/50 justify-center items-center'>

              {/* Card Form */}
              <View className='w-96 bg-white rounded-xl p-6 shadow-lg'>

                {/* Form Header */}
                <View className='flex-row justify-between items-center mb-6'>
                  <Text className='text-xl font-bold text-gray-800'>Set Custom Color</Text>
                  <TouchableOpacity onPress={closeColorModal} className='p-1'>
                    <Ionicons name='close' size={24} color='#6b7280' />
                  </TouchableOpacity>
                </View>

                <View className='mb-6'>
                  <TextInput
                    className='border border-gray-300 rounded-lg px-4 py-3 text-base'
                    placeholder='#FF0000'
                    placeholderTextColor={'gray'}
                    value={customColor}
                    onChangeText={setCustomColor}
                    autoCapitalize="characters"
                  />
                </View>
                
                {/* Button */}
                <View className='flex-row justify-end gap-2'>
                  <CustomButton
                    title='Cancel'
                    handlePress={closeColorModal}
                    containerStyles='bg-gray-100 w-1/4'
                  />
                  <CustomButton
                    title='Apply'
                    handlePress={handleCustomColorApply}
                    containerStyles='bg-[#4040e8] w-1/4'
                    textStyles='text-white'
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

    </KeyboardAvoidingView>
  )
}

export default Addwater