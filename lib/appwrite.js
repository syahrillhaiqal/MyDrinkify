import { Account, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';
console.log(process.env.projectId)

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
const storage = new Storage(client);

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

// Update User
export const updateUser = async (userID, updateData) => {
    try {
        const updatedUser = await databases.updateDocument(
            config.databaseId,
            config.userCollectionId,
            userID,
            updateData
        );

        return updatedUser;
    } catch (error) {
        console.log(error);
        throw new Error(error);
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

// Log water intake
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

// Get water logs for a specific date
export const getWaterLogsByDate = async (userID, date) => {
    try {
        const logs = await databases.listDocuments(
            config.databaseId,
            config.waterLogsCollectionId,
            [
                Query.equal('usersID', userID),
                Query.startsWith('logged_at', date),
                Query.orderAsc('logged_at')
            ]
        );

        return logs.documents;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Get water logs for a date range
export const getWaterLogsByDateRange = async (userID, startDate, endDate) => {
    try {
        // Get all logs for the user
        const logs = await databases.listDocuments(
            config.databaseId,
            config.waterLogsCollectionId,
            [
                Query.equal('usersID', userID),
                Query.orderAsc('logged_at')
            ]
        );

        // Filter logs by date range in JavaScript
        const filteredLogs = logs.documents.filter(log => {
            const logDate = parseLogDate(log.logged_at);
            console.log("logDate: " + logDate)
            const start = parseLogDate(startDate);
            console.log("start: " + start)
            const end = parseLogDate(endDate);
            console.log("end: " + end)
            
            // Compare actual Date objects instead of strings
            return logDate >= start && logDate <= end;
        });

        return filteredLogs;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Delete water logs for today
export const deleteWaterLogsForToday = async (userID) => {
    try {
        const today = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
        
        // Get all water logs for today
        const todayLogs = await getWaterLogsByDate(userID, today);
        
        // Delete each log
        const deletePromises = todayLogs.map(log => 
            databases.deleteDocument(
                config.databaseId,
                config.waterLogsCollectionId,
                log.$id
            )
        );
        
        await Promise.all(deletePromises);
        
        return todayLogs.length; // Return number of deleted logs
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Reset today's water intake (delete logs and reset goal)
export const resetTodayWaterIntake = async (userID) => {
    try {
        const today = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
        
        // Delete all water logs for today
        const deletedLogsCount = await deleteWaterLogsForToday(userID);
        
        // Get today's goal and reset currentAchieved to 0
        const todayGoal = await getDailyGoal(userID, today);
        
        if (todayGoal) {
            await updateCurrentAchieved(todayGoal.$id, 0);
        }
        
        return {
            deletedLogsCount,
            goalReset: !!todayGoal
        };
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

// Helper function to parse date strings in DD/MM/YYYY format
const parseLogDate = (dateString) => {
    try {
        if (dateString.includes(",")) {
            // Format: "DD/MM/YYYY, HH:MM:SS AM/PM"
            const [datePart] = dateString.split(", ");
            const [day, month, year] = datePart.split("/");
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
            // Format: "DD/MM/YYYY"
            const [day, month, year] = dateString.split("/");
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
    } catch (error) {
        console.error("Error parsing date:", error);
        return new Date();
    }
}

// =========================
// STORAGE FUNCTIONS
// =========================

export const uploadProfilePicture = async (fileUri) => {
  try {
    // Create a file object from the URI
    const file = {
      uri: fileUri,
      type: 'image/jpeg',
      name: `profile_${Date.now()}.jpg`,
      size: 5
    };

    // Upload file
    const uploadedFile = await storage.createFile(
      config.storageId,
      ID.unique(),
      file
    );

    return uploadedFile; // contains $id
  } catch (error) {
    console.error(error);
    throw new Error(`Error uploading file: ${error}`);
  }
};

export const getFileView = (fileId) => {
  return storage.getFileView(config.storageId, fileId);
};

export const deleteFile = async (fileId) => {
  try {
    await storage.deleteFile(config.storageId, fileId);
  } catch (error) {
    console.error(error);
    throw new Error(`Error deleting file: ${error}`);
  }
};