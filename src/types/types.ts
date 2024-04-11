

export type useThemeType = {
    theme: string,
    setTheme: (theme: string) => void
}

export type TypeValueStartPage = {
    typePage: string,
    typeClick: string
}

export type SignInSignUpForm = {
    login?: string,
    password: string,
    confirmPassword?: string,
    email?: string,
    rememberMe?: boolean,
    dataError?: string
}



export interface StyleContextMenu {
    position: 'relative';
    top: string;
    left: string;
}

export type CurrentUserData = {
    displayName: string,
    photoURL?: string,
}

export interface CurrentUser extends CurrentUserData {
    uid: string,
    email: string
}

// export type Chat = {
//     displayName: string,
//     email: string,
//     chatID?: string,
//     uid: string
// }

export interface Chat extends CurrentUser  {
    chatID?: string,
}

export type Message1 = {
    message: string,
    messageID: string,
    date: string,
    read: boolean,
    sender: CurrentUser,
    changed?: string,
    forwardedFrom?: Chat
}
