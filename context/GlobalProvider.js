// The GlobalProvider is a React Context Provider that allows you to store and share global state (like user login info) across your entire app without passing props manually at every level.

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../lib/appwrite'

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {

    // Authentication state
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState(null);
    const [userID, setUserID] = useState('')
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Water tracking state
    const [currentWater, setCurrentWater] = useState(0);
    const [goal, setGoal] = useState(0);
    const [goalID, setGoalID] = useState('');

    // Reset global provider data after signout
    const resetUserData = () => {
        setGoal(0);
        setCurrentWater(0);
        setGoalID('')
    }

    useEffect(() => {
        // For auto login, get the current user, if null it setIsLoggedIn will be false and no auto login
        getCurrentUser()
            .then((res) => {
                if(res) {
                    setIsLoggedIn(true);
                    setUser(res);
                }
                else {
                    setIsLoggedIn(false);
                    setUser(null);
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false);
            })
    }, []); // [] this effect runs only once when the GlobalProvider component first mounts (when the app starts).

    return (
        <GlobalContext.Provider
            value={{

                // Authentication values
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                userID,
                setUserID,
                username,
                setUsername,
                isLoading,

                // Water tracking values
                currentWater,
                setCurrentWater,
                goal,
                setGoal,
                goalID,
                setGoalID,

                // Reset user data in global provider
                resetUserData
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
} 

export default GlobalProvider;