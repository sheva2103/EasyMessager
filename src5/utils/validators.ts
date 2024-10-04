import { User } from "firebase/auth"
import { CurrentUser } from "../types/types"


export const checkConfirmPassword = (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword
}

// export const createUserData = (userInfo: User): CurrentUser | {} => {

//     const keys = ['displayName', 'photoURL', 'uid', 'email']

//     let userData = {}
//     let key: keyof typeof userInfo
//     for(key in userInfo) {
//         keys.forEach(item => {
//             if(item === key) userData = {...userData, [key]: userInfo[key]}
//         })
//     }
//     return userData
// }