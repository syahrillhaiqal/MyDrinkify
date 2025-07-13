import { useGlobalContext } from '@/context/GlobalProvider';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, Tabs } from 'expo-router';
import React from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';

const TabsLayout = () => {
  const { isLoading, isLoggedIn } = useGlobalContext();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      {/* Status bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Add Water Button */}
      <TouchableOpacity onPress={() => router.push('/(stack)/addwater')} className='absolute bottom-14 left-1/2 -translate-x-1/2 z-50'>
        <Ionicons 
          name="add-circle" 
          size={64}
          color={'#1a68a2'}
          />
      </TouchableOpacity>
      {/* Navigation Tabs */}
      <Tabs
      screenOptions={{
        tabBarStyle: {
          borderTopWidth: 1,
          position: "absolute",
        }
      }}>
        <Tabs.Screen 
          name='home'
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ( {focused} ) => (
              <Ionicons
                size={24}
                name='home'
                color={focused ? '#2567E8' : 'gray'}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='calendar'
          options={{
            title: 'Calendar',
            headerShown: false,
            tabBarItemStyle: { marginRight: 20},
            tabBarIcon: ( {focused} ) => (
              <Ionicons
                size={24}
                name='calendar'
                color={focused ? '#2567E8' : 'gray'}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='log'
          options={{
            title: 'Water Log',
            headerShown: false,
            tabBarItemStyle: { marginLeft: 20},
            tabBarIcon: ( {focused} ) => (
              <Ionicons
                size={24}
                name='water'
                color={focused ? '#2567E8' : 'gray'}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='profile'
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ( {focused} ) => (
              <Ionicons
                size={24}
                name='person'
                color={focused ? '#2567E8' : 'gray'}
              />
            )
          }}
        />
      </Tabs>
    </>
  )
}

export default TabsLayout