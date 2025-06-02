import { useGlobalContext } from '@/context/GlobalProvider';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { Loader } from '../../components';

const AuthLayout = () => {

  const { loading, isLogged } = useGlobalContext();

  if (!loading && isLogged) return <Redirect href="/home" />;

  return (
    <>
      <Stack screenOptions={{ 
        headerShown: false,
        animation:"fade_from_bottom",
        animationDuration: 250,
      }}
      />
      <Loader isLoading={loading} />
    </>
  )
}

export default AuthLayout