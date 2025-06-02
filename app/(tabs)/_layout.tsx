import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import { router, Stack, Tabs } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';

const TabsLayout = () => {
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