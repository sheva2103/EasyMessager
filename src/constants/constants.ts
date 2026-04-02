
export const SIGNIN = 'signIn'
export const SIGNUP = 'signUp'
export const FORM = 'form'
export const BUTTONGROUP = 'buttonGroup'

//export const CONTACTS = 'CONTACTS'



export const RESERVED_CHANNEL_ID = "893db3bc-0f4a-44f1-a201-18d54424c310"

export enum firebasePath {
    USERS = "users",
    CHATLIST = "chatList",
    CHATS = "chats",
    FAVORITES = "favorites",
    BLACKLIST = "blacklist",
    CONTACTS = "contacts",
    CHANNELS = "channels",
    CHANNELS_INFO = "channelsInfo",
    MESSAGE = "messages"
}

export enum clickType {
    CREATE_CHANNEL = 'CREATE_CHANNEL',
    SETTINGS = 'SETTINGS',
    SHOW_CHANNEL_INFO = 'SHOW_CHANNEL_INFO',
    SHOW_USER_INFO = 'SHOW_USER_INFO',
    ADD_TO_LIST_SUBSCRIBERS = 'ADD_TO_LIST_SUBSCRIBERS',
    REMOVE_FROM_LIST_SUBSCRIBERS = 'REMOVE_FROM_LIST_SUBSCRIBERS'
}