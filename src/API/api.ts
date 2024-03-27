import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserInfo } from "firebase/auth";
import { CurrentUser } from "../types/types";


type ProfileApi = {
    createNewUserInDB: (e: UserInfo) => void,
    changeUserInfo: (data: CurrentUser) => void
}

export const profileAPI: ProfileApi = {

    async createNewUserInDB(user) {
        await setDoc(doc(db, "users", user.email), {
            email: user.email,
            displayName: user.email.slice(0, user.email.indexOf('@')),
            uid: user.uid,
            blackList: [],
            contacts: []
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