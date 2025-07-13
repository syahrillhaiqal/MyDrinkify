import { useGlobalContext } from "@/context/GlobalProvider";
import { updateUser } from "@/lib/appwrite";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const AccountInfo = () => {
    const { user, setUser } = useGlobalContext();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUsername, setEditedUsername] = useState(user?.username || "");
    const [editedPhoneNum, setEditedPhoneNum] = useState(user?.phoneNum || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!user?.$id) return;

        setLoading(true);
        try {
            const updatedUser = await updateUser(user.$id, {
                username: editedUsername,
                phoneNum: editedPhoneNum,
            });

            setUser(updatedUser);
            setIsEditing(false);
            Alert.alert("Success", "Account information updated successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
            Alert.alert("Error", "Failed to update account information");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditedUsername(user?.username || "");
        setEditedPhoneNum(user?.phoneNum || "");
        setIsEditing(false);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            return "Unknown";
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">

            <ScrollView className="flex-1">
                <View className="p-4">
                    {/* User ID */}
                    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                        <Text className="text-sm text-gray-500 mb-1">User ID</Text>
                        <Text className="text-base font-medium text-gray-800">
                            {user?.$id || "N/A"}
                        </Text>
                    </View>

                    {/* Username */}
                    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                        <Text className="text-sm text-gray-500 mb-1">Username</Text>
                        {isEditing ? (
                            <TextInput
                                value={editedUsername}
                                onChangeText={setEditedUsername}
                                className="text-base font-medium text-gray-800 border-b border-gray-300 py-1"
                                placeholder="Enter username"
                            />
                        ) : (
                            <Text className="text-base font-medium text-gray-800">
                                {user?.username || "N/A"}
                            </Text>
                        )}
                    </View>

                    {/* Phone Number */}
                    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                        <Text className="text-sm text-gray-500 mb-1">Phone Number</Text>
                        {isEditing ? (
                            <TextInput
                                value={editedPhoneNum}
                                onChangeText={setEditedPhoneNum}
                                className="text-base font-medium text-gray-800 border-b border-gray-300 py-1"
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text className="text-base font-medium text-gray-800">
                                {user?.phoneNum || "N/A"}
                            </Text>
                        )}
                    </View>

                    {/* Email */}
                    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                        <Text className="text-sm text-gray-500 mb-1">Email</Text>
                        <Text className="text-base font-medium text-gray-800">
                            {user?.email || "N/A"}
                        </Text>
                    </View>

                    {/* Date Created */}
                    <View className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
                        <Text className="text-sm text-gray-500 mb-1">Date Created</Text>
                        <Text className="text-base font-medium text-gray-800">
                            {formatDate(user?.$createdAt || "")}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    {isEditing ? (
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={handleCancel}
                                className="flex-1 bg-gray-300 py-3 rounded-xl"
                                disabled={loading}
                            >
                                <Text className="text-center text-gray-700 font-semibold">
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                className="flex-1 bg-blue-600 py-3 rounded-xl"
                                disabled={loading}
                            >
                                <Text className="text-center text-white font-semibold">
                                    {loading ? "Saving..." : "Save"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            className="bg-blue-600 py-3 rounded-xl"
                        >
                            <Text className="text-center text-white font-semibold text-lg">
                                Edit Information
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AccountInfo; 