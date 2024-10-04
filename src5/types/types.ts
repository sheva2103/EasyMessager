

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

export type ListMessagesType = {
    all: Message1[],
    limit: Message1[]
}
<<<<<<< HEAD

export type size = {
    clientWidth: number,
    clientHeight: number
}
=======
>>>>>>> e41c4039d785f462fbd4787040bf0fd4e87f78e6