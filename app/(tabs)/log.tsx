import { View, Text, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LineChart } from 'react-native-chart-kit'
import Svg, { Path } from 'react-native-svg';
import { getWaterLogsByDate, getUserWaterTypes, getWaterLogsByDateRange } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import { useFocusEffect } from 'expo-router';

const screenWidth = Dimensions.get('window').width;


// For typescript, to define the structure of the objects
interface WaterLog {
  $id: string;
  usersID: string;
  waterID: string;
  quantity: number;
  logged_at: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  $collectionId?: string;
  $databaseId?: string;
}

interface WaterType {
  $id: string;
  title: string;
  volume: number;
  color: string;
  notes: string;
  usersID?: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  $collectionId?: string;
  $databaseId?: string;
}

const Log = () => {

  const { userID } = useGlobalContext();

  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]); // As array
  const [waterTypes, setWaterTypes] = useState<WaterType[]>([]);

  const [chartData, setChartData] = useState({
    labels: ['Loading'],
    datasets: [{
      data: [0],
      strokeWidth: 2
    }]
  });

  const [loading, setLoading] = useState(false);

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(148, 209, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(75, 85, 99, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '1',
      stroke: '#1a68a2',
    },
  };

  // Generate date range for the date selector (current day is centered, 3 days before and after)
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - 3); // the list starting from 3 days before the current date
    
    // then after the starting, we push it to the dates[] with their attributes
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

      // getDay will return: 
      // 0 = sunday,
      // 1 = monday, 
      // 2 = tuesday .....
      const dayName = dayNames[date.getDay()];
      
      dates.push({
        label: dayName,
        day: date.getDate(),
        fullDate: new Date(date),
        isToday: date.toDateString() === today.toDateString()
      });
    }
    return dates;
  };

  const dateRangeDays = generateDateRange();

  // Format date (DD/MM/YYYY)
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time from logged_at string
  const formatTime = (loggedAt: string) => {
    try {
      if (loggedAt.includes(',')) {
        const timePart = loggedAt.split(', ')[1];
        const timeWithoutSeconds = timePart.replace(/:\d{2}(\s)/, '$1');
        return timeWithoutSeconds;
      }
      
      const date = new Date(loggedAt);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'Invalid time';
    }
  };

  // Get water type details by ID or return the populated object
  // Since using typescript, need to write the declaration like that
  // The function with log as the parameter and its type is WaterLog, then return Watertype or undefined 
  const getWaterTypeFromLog = (log: WaterLog): WaterType | undefined => { 

    // If log.waterID is object, return it as WaterType
    if (typeof log.waterID === 'object' && log.waterID !== null) {
      return log.waterID as WaterType;
    }
    
    // If waterID is a string ID. find the matching object in the waterTypes array.
    if (typeof log.waterID === 'string') {
      return waterTypes.find(type => type.$id === log.waterID);
    }
    
    return undefined;
  };

  // Calculate total volume for a log
  const calculateLogVolume = (log: WaterLog): number => {
    const waterType = getWaterTypeFromLog(log);
    return waterType ? waterType.volume * log.quantity : 0;
  };

  // Process chart data based on selected period
  const processChartData = (logs: WaterLog[]) => {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];

    if (selectedPeriod === 'daily') {

      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        labels.push(dayNames[date.getDay()]);
        
        // Calculate total volume for this date
        // .filter will go through each of the log in logs and filter based on the date
        const dayLogs = logs.filter(log => log.logged_at.startsWith(dateStr));
        const totalVolume = dayLogs.reduce((sum, log) => sum + calculateLogVolume(log), 0);
        data.push(totalVolume);
      }
    } 
    else if (selectedPeriod === 'weekly') {

      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        labels.push(`W${4-i}`);
        
        // Calculate total volume for this week
        const weekLogs = logs.filter(log => {
          const logDate = parseLogDate(log.logged_at);
          return logDate >= weekStart && logDate <= weekEnd;
        });
        const totalVolume = weekLogs.reduce((sum, log) => sum + calculateLogVolume(log), 0);
        data.push(totalVolume);
      }
    } 
    else if (selectedPeriod === 'monthly') {

      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        labels.push(monthNames[month.getMonth()]);
        
        // Calculate total volume for this month
        const monthLogs = logs.filter(log => {
          const logDate = parseLogDate(log.logged_at);
          return logDate.getMonth() === month.getMonth() && 
                 logDate.getFullYear() === month.getFullYear();
        });
        const totalVolume = monthLogs.reduce((sum, log) => sum + calculateLogVolume(log), 0);
        data.push(totalVolume);
      }
    }

    // Ensure we have at least some data to prevent chart errors
    if (data.length === 0 || data.every(val => val === 0)) {
      data = [0];
      labels = ['No Data'];
    }

    setChartData({
      labels,
      datasets: [{
        data,
        strokeWidth: 2,
      }]
    });
  };

  // Parse log date string to Date object
  const parseLogDate = (loggedAt: string): Date => {
    try {
      if (loggedAt.includes(',')) {
        // Format: "06/06/2025, 3:34:23 PM"
        const [datePart] = loggedAt.split(', ');
        const [day, month, year] = datePart.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      return new Date(loggedAt);
    } catch (error) {
      return new Date();
    }
  };

  // Load chart data based on period
  const loadChartData = async () => {
    if (!userID) return;

    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (selectedPeriod === 'daily') {
        // Last 7 days
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        endDate = new Date(now);
      } else if (selectedPeriod === 'weekly') {
        // Last 4 weeks
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 28);
        endDate = new Date(now);
      } else { // monthly
        // Last 6 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        endDate = new Date(now);
      }

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      const logs = await getWaterLogsByDateRange(userID, startDateStr, endDateStr);
      console.log(startDateStr);
      console.log(endDateStr);
      console.log(logs);
      processChartData(logs as WaterLog[]);
    } catch (error) {
      console.log('Error loading chart data:', error);
      // Set default empty chart data
      setChartData({
        labels: ['No Data'],
        datasets: [{
          data: [0],
          strokeWidth: 2,
        }]
      });
    }
  };

  // Load daily records data
  const loadDailyData = async () => {
    if (!userID) return;
    
    setLoading(true);
    
    try {
      // Load water types
      const types = await getUserWaterTypes(userID);
      setWaterTypes(types as WaterType[]);
      
      // Load water logs for selected date
      const formattedDate = formatDate(selectedDate);
      const logs = await getWaterLogsByDate(userID, formattedDate);
      
      // Sort logs by time (chronological order - morning to night)
      const sortedLogs = (logs as WaterLog[]).sort((a, b) => {
        const timeA = parseLogTime(a.logged_at);
        const timeB = parseLogTime(b.logged_at);
        return timeA.getTime() - timeB.getTime();
      });
      
      setWaterLogs(sortedLogs);
      
    } catch (error) {
      console.log('Error fetching daily data:', error);
      Alert.alert('Error', 'Failed to load daily data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse the full datetime from logged_at string
  const parseLogTime = (loggedAt: string): Date => {
    try {
      if (loggedAt.includes(',')) {
        // Format: "06/06/2025, 3:34:23 PM"
        const [datePart, timePart] = loggedAt.split(', ');
        const [day, month, year] = datePart.split('/');
        
        // Parse time part
        let [time, ampm] = timePart.split(' ');
        let [hours, minutes, seconds] = time.split(':');
        let hour24 = parseInt(hours);
        
        // Convert to 24-hour format
        if (ampm === 'PM' && hour24 !== 12) {
          hour24 += 12;
        } else if (ampm === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          hour24,
          parseInt(minutes),
          parseInt(seconds || '0')
        );
      }
      
      // Fallback to regular Date parsing
      return new Date(loggedAt);
    } catch (error) {
      console.error('Error parsing log time:', error);
      return new Date(); // Return current date as fallback
    }
  };

  // Effect for chart data when period changes
  useFocusEffect(
    useCallback(() => {
      loadChartData();
      loadDailyData();
    }, [userID, selectedPeriod, selectedDate])
  );
  
  const handleDateSelect = (dateItem: any) => {
    setSelectedDate(dateItem.fullDate);
  };

  const navigateDates = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <ScrollView>

      <SafeAreaView className='flex-1 bg-gray-50'>
        <View className='px-4'>
          {/* Header */}
          <View className='mt-3'>
            <Text className='text-3xl font-bold text-gray-800'>Water Log</Text>
          </View>

          <View className='items-center'>
            {/* Period switcher */}
            <View className='flex-row bg-blue-100 rounded-xl p-1 mb-4 mt-5 w-3/4'>
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-lg ${selectedPeriod === 'daily' ? 'bg-blue-600' : 'bg-blue-100'}`}
                onPress={() => handlePeriodChange('daily')}
              >
                <Text className={`text-center ${selectedPeriod === 'daily' ? 'text-white font-semibold' : 'text-gray-600'}`}>Daily</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className={`flex-1 py-3 rounded-lg ${selectedPeriod === 'weekly' ? 'bg-blue-600' : 'bg-blue-100'}`}
                onPress={() => handlePeriodChange('weekly')}
              >
                <Text className={`text-center ${selectedPeriod === 'weekly' ? 'text-white font-semibold' : 'text-gray-600'}`}>Weekly</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className={`flex-1 py-3 rounded-lg ${selectedPeriod === 'monthly' ? 'bg-blue-600' : 'bg-blue-100'}`}
                onPress={() => handlePeriodChange('monthly')}
              >
                <Text className={`text-center ${selectedPeriod === 'monthly' ? 'text-white font-semibold' : 'text-gray-600'}`}>Monthly</Text>
              </TouchableOpacity>
            </View>

            {/* Chart */}
            <View className='bg-white py-3 rounded-xl w-full border border-gray-200'>
              <LineChart
                data={chartData}
                width={screenWidth - 36}
                height={220}
                chartConfig={chartConfig}
                bezier={false}
                withHorizontalLines={false}
                withVerticalLines={false}
                style={{
                  borderRadius: 16,
                  marginVertical: 8,
                  marginHorizontal: 0,
                  paddingRight: 70
                }}
              />
            </View>

            <View className='w-full mt-3 pl-1'>  
              <Text className='text-xl font-semibold'>Records</Text>        
            </View>

            <View className='bg-white w-full mt-2 p-3 rounded-xl h-[350px] border border-gray-200 mb-[100px]'>
              {/* Date Navigation */}
              <View className='flex-row items-center justify-between mb-3'>
                <TouchableOpacity 
                  onPress={() => navigateDates('prev')}
                  className='p-2'
                >
                  <Text className='text-blue-600 text-lg font-semibold'>‹</Text>
                </TouchableOpacity>
                
                <Text className='text-lg font-semibold text-gray-700'>
                  {selectedDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </Text>
                
                <TouchableOpacity 
                  onPress={() => navigateDates('next')}
                  className='p-2'
                >
                  <Text className='text-blue-600 text-lg font-semibold'>›</Text>
                </TouchableOpacity>
              </View>

              {/* Date Selector */}
              <View className='flex-row justify-between mb-4'>
                {dateRangeDays.map((item) => (
                  <TouchableOpacity
                    key={`${item.fullDate.getTime()}`}
                    onPress={() => handleDateSelect(item)}
                    className={`items-center flex-1 py-2 rounded-2xl mx-0.5 ${
                      selectedDate.toDateString() === item.fullDate.toDateString() 
                        ? 'bg-blue-600' 
                        : item.isToday 
                          ? 'bg-blue-100' 
                          : ''
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        selectedDate.toDateString() === item.fullDate.toDateString()
                          ? 'text-white' 
                          : item.isToday 
                            ? 'text-blue-600' 
                            : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </Text>
                    <Text
                      className={`text-base font-medium ${
                        selectedDate.toDateString() === item.fullDate.toDateString()
                          ? 'text-white' 
                          : item.isToday 
                            ? 'text-blue-600' 
                            : 'text-gray-700'
                      }`}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Records List */}
              <ScrollView 
                className='flex-1 space-y-3'
                showsVerticalScrollIndicator={false}
              >
                {loading ? (
                  <View className='flex-1 justify-center items-center'>
                    <Text className='text-gray-500'>Loading...</Text>
                  </View>
                ) : waterLogs.length === 0 ? (
                  <View className='flex-1 justify-center items-center'>
                    <Text className='text-gray-500'>No water logs for this date</Text>
                  </View>
                ) : (
                  waterLogs.map((log) => {
                    const waterType = getWaterTypeFromLog(log);
                    const totalVolume = waterType ? waterType.volume * log.quantity : 0;
                    
                    return (
                      <View key={log.$id} className='flex-row items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100'>
                        {/* Icon */}
                        <Svg height={40} width={40} viewBox='0 0 24 24'>
                          <Path
                            d="M6.06118 9L7.73343 20.1483C7.80686 20.6379 8.22737 21 8.72236 21H15.2776C15.7726 21 16.1931 20.6379 16.2666 20.1483L17.9388 9H6.06118Z"
                            fill={waterType?.color || '#3B82F6'}
                          />
                          <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.16118 1C3.93844 1 3.00192 2.08747 3.1833 3.29668L5.75555 20.445C5.97584 21.9136 7.23738 23 8.72236 23H15.2776C16.7626 23 18.0241 21.9136 18.2444 20.445L20.8167 3.29668C20.9981 2.08747 20.0615 1 18.8388 1H5.16118ZM5.16118 3H18.8388L18.2388 7H5.76118L5.16118 3ZM6.06118 9L7.73343 20.1483C7.80686 20.6379 8.22737 21 8.72236 21H15.2776C15.7726 21 16.1931 20.6379 16.2666 20.1483L17.9388 9H6.06118Z"
                            fill="#333333"
                          />
                        </Svg>

                        {/* Water Info */}
                        <View className='flex-1 px-2'>
                          <Text className='text-base font-medium truncate'>
                            {waterType?.title || 'Unknown Water Type'}
                          </Text>
                          <Text className='text-xl font-semibold'>
                            {totalVolume}ml
                          </Text>
                          <Text className='text-sm text-gray-500'>
                            {log.quantity} x {waterType?.volume || 0}ml
                          </Text>
                          {waterType?.notes && (
                            <Text
                              className='text-sm text-gray-500 mt-1'
                              numberOfLines={2}
                              ellipsizeMode='tail'
                            >
                              {waterType.notes}
                            </Text>
                          )}
                        </View>

                        {/* Time */}
                        <View className='items-end'>
                          <Text className='text-sm text-gray-400'>Time</Text>
                          <Text className='text-lg font-semibold'>
                            {formatTime(log.logged_at)}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default Log;