import React from "react";
import { Stack } from "expo-router";

const StackLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                animation: "fade_from_bottom",
            }}
        >
            <Stack.Screen
                name="addwater"
                options={{
                    title: "Add Water",
                }}
            />
            <Stack.Screen
                name="account-info"
                options={{
                    title: "Account Info",
                }}
            />
        </Stack>
    );
};

export default StackLayout;
