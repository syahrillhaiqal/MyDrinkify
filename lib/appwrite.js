import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    platform: 'com.syahril.mydrinkify',
    projectId: '68331f2d001541be0126',
    databaseId: '68371ad000388b764f52',
    userCollectionId: '68371b48002365337610',
    goalCollectionId: '683e827a000ac708b2d5',
    waterCollectionId: '683e899f002d0a219ff1',
    waterLogsCollectionId: '683e879d0037ddaf7ef1',
    storageId: '68371f410007b5dfdf02'
}

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.
;

const account = new Account(client);
const databases = new Databases(client);

// =========================
// USER FUNCTIONS
// =========================

// Register User
export async function createUser(email, password, username, phoneNum){

    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                phoneNum: phoneNum
            }
        );

        return newUser
    } catch (error) {
        console.log('sini' + error)
        throw new Error(error);
    }
}

// Sign In
export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password)

        return session;
    } catch (error) {
        throw new Error(error);
        
    }
}

// Get Current User
export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;
        
        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];

    } catch (error){
        console.log(error)
    }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// =========================
// GOALS FUNCTIONS
// =========================

// Set daily goal
export const setDailyGoal = async (userID, date, target) => {
    try {
        
        const newGoal = await databases.createDocument(
            config.databaseId,
            config.goalCollectionId,
            ID.unique(),
            {
                usersID: userID,
                date: date,
                target: target,
                currentAchieved: 0
            }
        );

        return newGoal;

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Get daily goal (the whole table)
export const getDailyGoal = async (userID, date) => {
    try {
        const goals = await databases.listDocuments(
            config.databaseId,
            config.goalCollectionId,
            [
                Query.equal('usersID', userID),
                Query.equal('date', date)
            ]
        )

        return goals.documents.length > 0 ? goals.documents[0] : null;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Update daily goal

export const updateDailyGoal = async (goalID, target) => {
    try {
        const updatedGoal = await databases.updateDocument(
            config.databaseId,
            config.goalCollectionId,
            goalID,
            {
                target: target
            }
        );

        return updatedGoal;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Update current water
export const updateCurrentAchieved = async (goalID, currentAchieved) => {
    try {
        
        const currentGoal = await databases.getDocument(
            config.databaseId,
            config.goalCollectionId,
            goalID
        );

        const updatedGoal = await databases.updateDocument(
            config.databaseId,
            config.goalCollectionId,
            goalID,
            {
                currentAchieved: currentAchieved,
                isAchieved: currentAchieved >= currentGoal.target // Set isAchieved true if achieved goal
            }
        );

        return updatedGoal;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Get user's latest goal (most recent goal they set)
export const getUserLatestGoal = async (userID) => {
    try {
        const goals = await databases.listDocuments(
            config.databaseId,
            config.goalCollectionId,
            [
                Query.equal('usersID', userID),
                Query.orderDesc('date'),
                Query.limit(1) // limit to 1 result only
            ]
        );

        return goals.documents.length > 0 ? goals.documents[0] : null;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Get list of goal achieved date by the user
export const getAchievedGoalDate = async (userID) => {
    try {
        const achievedGoal = await databases.listDocuments(
            config.databaseId,
            config.goalCollectionId,
            [
                Query.equal('usersID', userID),
                Query.equal('isAchieved', true),
                Query.orderAsc('date')
            ]
        );

        // Extract only the date from each document
        const dates = achievedGoal.documents.map(doc => doc.date);
        return dates;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// =========================
// WATER FUNCTIONS
// =========================

// Create water type
export const createWaterType = async (userID, title, volume, color, notes ) => {
    try {
        const newWater = await databases.createDocument(
            config.databaseId,
            config.waterCollectionId,
            ID.unique(),
            {
                usersID: userID,
                title: title,
                volume: volume,
                color: color,
                notes: notes || ''
            }
        );

        return newWater;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Get user's water type
export const getUserWaterTypes = async (userID) => {
    try {
        const waters = await databases.listDocuments(
            config.databaseId,
            config.waterCollectionId,
            [
                Query.equal('usersID', userID),
                Query.orderAsc('title')
            ]
        );

        return waters.documents;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// =========================
// WATER LOGS FUNCTIONS
// =========================

// Log Water Intake
export const logWaterIntake = async (userID, waterID, quantity, loggedAt = null) => {
    try {
        const newLog = await databases.createDocument(
            config.databaseId,
            config.waterLogsCollectionId,
            ID.unique(),
            {
                usersID: userID,
                waterID: waterID,
                quantity: quantity,
                logged_at: loggedAt || new Date().toLocaleString()
            }
        );

        return newLog;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}