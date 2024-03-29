import { QueryDocumentSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserInfo } from "firebase/auth";
import { CurrentUser } from "../types/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';


type ProfileApi = {
    createNewUserInDB: (e: UserInfo) => void,
    changeUserInfo: (data: CurrentUser) => void,
}

type SearchAPI = {
    searchUser: (name: string) => Promise<CurrentUser[]>
}



// type MessagesAPI = {
//     sendMessage: (id: string) => void
// }

export const profileAPI: ProfileApi = {

    async createNewUserInDB(user) {
        await setDoc(doc(db, "users", user.email), {
            email: user.email,
            displayName: user.email.slice(0, user.email.indexOf('@')),
            uid: user.uid,
            registrationDate: new Date().toLocaleDateString()
        });
    },
    async changeUserInfo(data) {
        const userRef = doc(db, "users", data.email);
        await updateDoc(userRef, {
            photoURL: data.photoURL,
            displayName: data.displayName
        });
    }
}

export const searchAPI: SearchAPI = {
    async searchUser(name) {
        const chats: CurrentUser[] = []
        const q = query(collection(db, "users"), where("displayName", "==", name));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc: QueryDocumentSnapshot<CurrentUser>) => {
            chats.push(doc.data())
            console.log(doc.id, " => ", doc.data());
        });
        return chats
    }
}

// export const messagesAPI = {

//     async sendMessage(message, id = uuidv4()) {
//         await setDoc(doc(db, "usersMessages", id), {
//             name: "Los Angeles",
//             state: "CA",
//             country: "USA"
//         });
//     }
// }