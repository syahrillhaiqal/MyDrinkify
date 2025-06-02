import { KeyboardAvoidingView, Platform, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Image, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getCurrentUser, signIn } from "../../lib/appwrite";
import { useGlobalContext } from "@/context/GlobalProvider";

export default function App() {

  // Set form state
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  // Set password state
  const [hidePassword, setHidePassword] = useState(true);
  
  // Submit function
  const submit = async () => {

    if(!form.email || !form.password) {
        Alert.alert('Error', 'Please fill in all the fields')
    }
    else {
      try {
          await signIn(form.email, form.password);
  
          router.replace('/(tabs)/home');
          } catch (error) {
              if (error instanceof Error) {
                  Alert.alert("Login Failed", "Invalid email or password");
              } else {
                  Alert.alert('Error', 'Something went wrong');
              }
          }
        }
    }

  useEffect(() => {
    // router.replace('/');
  }, []);

  return ( 
    // Dismiss keyboard when tapping outside input
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#2567E8", "#1CE6DA"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0.1,1]}
        style={{ flex: 1 }}
      >
        {/* KeyboardAvoidingView wraps the scrollable content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps='handled'
          >
            <View className="flex-1 items-center p-6">
              {/* Logo */}
              <Image
                source={require('../../assets/images/mydrinkify_logo.png')}
                className='w-64 h-24 mt-[100px] mb-[45px]'
              />

              {/* Login Card */}
              <View className='w-96 bg-white rounded-xl p-6 shadow-lg'>

                <Text className='text-3xl font-bold text-center mb-4'>Login</Text>

                <View className='flex flex-row justify-center'>
                  <Text className='text-base text-gray-600 mb-4'>Don&apos;t have an account?</Text>
                  <TouchableOpacity onPress={() => router.replace('/register')}>
                    <Text className="text-base text-blue-600 font-semibold">Sign up</Text>
                  </TouchableOpacity>
                </View>

                <Text className='text-gray-600 mb-1'>Email</Text>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor={'gray'}
                  className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                  keyboardType="email-address"
                  value={form.email}
                  onChangeText={(e) => setForm({ ...form, email: e })}
                />

                <Text className='text-gray-600 mb-1'>Password</Text>
                <View className="w-full border border-gray-300 rounded-lg mb-6 flex-row items-center pr-3">
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={'gray'}
                        className="flex-1 p-3"
                        value={form.password}
                        onChangeText={(e) => setForm({ ...form, password: e })}
                        secureTextEntry={hidePassword}
                    />
                    <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                        <Text className="text-blue-600 font-medium">
                        {hidePassword ? "Show" : "Hide"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="w-full bg-blue-600 p-4 rounded-lg" onPress={submit}>
                  <Text className="text-white text-center font-semibold">Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}
