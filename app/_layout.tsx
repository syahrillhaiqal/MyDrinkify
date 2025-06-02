import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import GlobalProvider from '../context/GlobalProvider'

const RootLayout = () => {
  return (
    <GlobalProvider>

      <Stack screenOptions={{ 
        headerShown: false,
        animation:"fade",
        animationDuration: 250,
      }}
      />
    </GlobalProvider>
  )
}

export default RootLayout