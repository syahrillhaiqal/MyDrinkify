import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { createUser } from '../../lib/appwrite'
import { useGlobalContext } from '@/context/GlobalProvider';

export default function App() {

    const { 
        setUser, 
        setIsLoggedIn 
    } = useGlobalContext();

    // Set form
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        phoneNum: ''
    })

    // Set password state
    const [hidePassword, setHidePassword] = useState(true);

    // Submit function
    const submit = async () => {
        const { username, email, password, phoneNum } = form;

        // Basic field check
        if (!username || !email || !password || !phoneNum) {
            return Alert.alert("Error", "Please fill in all the fields.");
        }

        // Email validation (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return Alert.alert("Invalid Email", "Please enter a valid email address.");
        }

        // Password length check
        if (password.length < 8) {
            return Alert.alert("Weak Password", "Password must be at least 8 characters long.");
        }

        try {
            const result = await createUser(form.email, form.password, form.username, form.phoneNum);
            setUser(result);
            setIsLoggedIn(true);
            
            router.replace("/(tabs)/home");
        } catch (error) {
            const err = error as Error; // Cast to Error type

            if (err.message.includes("already")) {
                Alert.alert("Error", "This email is already registered.");
            } 
            else {
                Alert.alert("Error", "Something went wrong. Please try again.");
            }
        }
    }

    return (   
        // When press any part of the screen, it will close the keyboard
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            
            {/* PAGE CONTENT */}
            <LinearGradient
                colors={["#2567E8", "#1CE6DA"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0.1,1]}
                style={{flex:1}}
                >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps='handled'
                    >
                        <View className="flex-1 items-center p-6">
                            
                            {/* MyDrinkify Logo */}
                            <Image
                            source={require('../../assets/images/mydrinkify_logo.png')}
                            className='w-64 h-24 mt-[50px] mb-[45px]'
                            />

                            {/* Register Card */}
                            <View className='w-96 bg-white rounded-xl p-6 shadow-lg'>

                                <Text className='text-3xl font-bold text-center mb-4'>Register</Text>

                                <View className='flex flex-row justify-center'>
                                    <Text className='text-base text-gray-600 mb-4'>Already have an account?</Text>
                                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                                        <Text className="text-base text-blue-600 font-semibold">Sign in</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text className='text-gray-600 mb-1'>Username</Text>
                                <TextInput
                                    placeholder="Username"
                                    placeholderTextColor={'gray'}
                                    className="w-full border border-gray-300 rounded-lg p-3 mb-6"
                                    value={form.username}
                                    onChangeText={(e) => setForm({ ...form, username: e })}
                                />

                                <Text className='text-gray-600 mb-1'>Email</Text>
                                <TextInput
                                    placeholder="Email"
                                    placeholderTextColor={'gray'}
                                    className="w-full border border-gray-300 rounded-lg p-3 mb-6"
                                    keyboardType='email-address'
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

                                <Text className='text-gray-600 mb-1'>Phone</Text>
                                <TextInput
                                    placeholder="Phone"
                                    placeholderTextColor={'gray'}
                                    className="w-full border border-gray-300 rounded-lg p-3 mb-6"
                                    keyboardType='numeric'
                                    value={form.phoneNum}
                                    onChangeText={(e) => setForm({ ...form, phoneNum: e })}
                                />

                                <TouchableOpacity className="w-full bg-blue-600 p-4 rounded-lg" onPress={submit}>
                                    <Text className="text-white text-center font-semibold">Register</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}

