import { View, Text, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar } from 'react-native-calendars';
import { getAchievedGoalDate } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useFocusEffect } from 'expo-router';


const ProgressCalendar = () => {
  
  const {
    user
  } = useGlobalContext();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [markedDates, setMarkedDates] = useState({});


  // Format date to YYYY-MM-DD
  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // useFocusEffect - It allows you to run code whenever the screen comes into focus, not just once like useEffect.
  // useEffect - will only run once when you go to that page for the first time
  // useCallBack - its good to have it alongside with useFocusEffect so that it will always run the function and not create a new one
  useFocusEffect(
    useCallback(() => {
      const fetchAchievedGoal = async () => {
        try {
          const achievedGoal = await getAchievedGoalDate(user.$id);

          const formattedDates = achievedGoal.map(dateStr => {
            const [day, month, year] = dateStr.split('/');
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          });

          // Sort dates in ascending orderj
          formattedDates.sort();

          // Convert array to a set for fast lookup (if using array, it need to check from beginning until found)
          const dateSet = new Set(formattedDates);

          // Create markedDates object
          const marked: any = {};

          const getNextDate = (date: string) => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            return formatDate(d);
          };

          const getPrevDate = (date: string) => {
            const d = new Date(date);
            d.setDate(d.getDate() - 1);
            return formatDate(d);
          };

          formattedDates.forEach(date => {
            // Check in the dateSet either got prev or next
            const hasPrev = dateSet.has(getPrevDate(date));  
            const hasNext = dateSet.has(getNextDate(date));

            // In JavaScript/TypeScript, objects can use string keys dynamically. (use date as key)
            if (hasPrev && hasNext) {
              marked[date] = { color: '#f97316', textColor: 'white' };
            } else if (!hasPrev && hasNext) {
              marked[date] = { startingDay: true, color: '#f97316', textColor: 'white' };
            } else if (hasPrev && !hasNext) {
              marked[date] = { endingDay: true, color: '#f97316', textColor: 'white' };
            } else {
              marked[date] = { startingDay: true, endingDay: true, color: '#f97316', textColor: 'white' };
            }
          });

          // Set marked object in markedDates state
          setMarkedDates(marked);

          // Get the streak
          const today = formatDate(new Date());
          let currentDate = dateSet.has(today) ? today : getPrevDate(today);
          let streak = 0;

          console.log(dateSet)

          while (dateSet.has(currentDate)) {
            streak++;
            currentDate = getPrevDate(currentDate); // Set currentdate prev date and check it is on the achievedgoal set or not
          }

          setCurrentStreak(streak);

        } catch (error) {
          console.log('Error fetching achieved goal:', error);
          Alert.alert('Error', 'Failed to load user data');
        }
      };

      fetchAchievedGoal();
    }, [user.$id])
  );

  return (
    <SafeAreaView className='flex-1 px-4 bg-gray-50'>

      {/* Header */}
      <View className='mt-3'>
        <Text className='text-3xl font-bold text-gray-800'>Progress Calendar</Text>
      </View>

      {/* Streak Circle */}
      <View className="items-center mb-6 mt-7">

        {/* Outer ring */}
        <View className="w-32 h-32 rounded-full border-4 border-orange-200 items-center justify-center mb-2">
          
          {/* Inner gradient circle */}
          <LinearGradient
            colors={['#f97316', '#f59e0b', '#fbbf24']}
            style={{
              width: 104,
              height: 104,
              borderRadius: 52,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >

            {/* Inner white circle */}
            <View className="w-20 h-20 rounded-full bg-white/20 backdrop-blur items-center justify-center border border-white/30">
              <Text className="text-white text-3xl font-black">
                {currentStreak}
              </Text>
            </View>

          </LinearGradient>
        </View>

        <Text className="text-gray-700 text-lg font-bold tracking-wide">
          {currentStreak <= 1 ? 'Day Streak' : 'Days Streak'}
        </Text>
        <Text className="text-gray-500 text-sm mt-2 font-medium">
          Keep it up! 💪
        </Text>
      </View>

      {/* Calendar */}
      <View>
        <Calendar
          markingType={'period'}
          markedDates={markedDates}
          theme={{
            backgroundColor: '#f9fafb',
            calendarBackground: '#f9fafb',
            textSectionTitleColor: '#9ca3af',
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#2563eb',
            dayTextColor: '#1f2937',
            textDisabledColor: '#d1d5db',
            arrowColor: '#3b82f6',
            monthTextColor: '#111827',
            indicatorColor: '#3b82f6',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProgressCalendar;