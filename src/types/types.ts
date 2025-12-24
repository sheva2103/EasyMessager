import { DocumentReference } from "firebase/firestore"


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



// export interface StyleContextMenu {
//     position: 'relative';
//     top: string;
//     left: string;
// }

export type CurrentUserData = {
    displayName: string,
    photoURL?: string,
}

export interface CurrentUser extends CurrentUserData {
    uid: string,
    email: string,
    registrationDate?: string,
    onlineStatus?: number
}

export type UsersData = {
    currentUser: CurrentUser,
    guestInfo: Chat
}

export interface Chat extends CurrentUser  {
    chatID?: string,
    dateOfChange?: string,
    channel?: TypeChannel,
    ref?: DocumentReference
}

export type Reaction = {
    reaction: string,
    sender: CurrentUser,
    isMine?: boolean
}

export type Message1 = {
    message: string,
    messageID: string,
    date: string,
    read?: boolean,
    sender: SenderMessageType,
    changed?: string,
    forwardedFrom?: Chat,
    replyToMessage?: Message1,
    callStatus?: CallEndStatus,
    reactions?: Array<Reaction>
}

export type SenderMessageType = CurrentUser & {
    channel?: TypeChannel
}

export type ListMessagesType = {
    all: Message1[],
    limit: Message1[]
}

export type size = {
    clientWidth: number,
    clientHeight: number
}

export type NoReadMessagesType = {quantity: number, targetIndex: number}

export type CheckMessageType = {
    message: string,
    imgUrls: string[] | null,
    YTUrls: string[] | null,
    hasLink: boolean
}

export type TypeCreateChannel = {
    displayName: string,
    isOpen: boolean
}

export interface TypeChannel extends TypeCreateChannel  {
    owner?: CurrentUser,
    registrationDate?: Date | string,
    channelID: string,
    listOfSubscribers?: CurrentUser[],
    photoURL?: string,
    dateOfChange?: string,
    applyForMembership?: CurrentUser[]
}

export type OnlineStatusUserType = {isOnline: boolean, last_seen: number}

export type PresenceStatus = {
    last_seen: number;
};

export type UsePresenceReturn = {
    status: PresenceStatus | null;
    isOnline: boolean;
    formatted: string;
};

export type CallEndStatus = 'completed' | 'unanswered' | 'rejected' | 'missed' | 'error';

export type CallMessageOptionsType = {
    caller: CurrentUser,
    callee: Chat,
    callDuration?: string,
    status?: CallEndStatus
}

export type SetReactionOptions = {
    reaction: Reaction,
    chat: Chat,
    isMine?: boolean,
    messageID: string,
    isFavorites: boolean
}


