import { Client, Account, ID, Databases, Query} from 'react-native-appwrite';

export const config = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    platform: 'com.syahril.mydrinkify',
    projectId: '68331f2d001541be0126',
    databaseId: '68371ad000388b764f52',
    userCollectionId: '68371b48002365337610',
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
        console.log(error)
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
