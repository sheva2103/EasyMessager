import { Chat } from "../types/types"


export function createChatList(data: Chat[]) {
    const chatsArray: Chat[] = []
    let key: keyof typeof data
    for (key in data) {
        chatsArray.push(data[key])
    }
    return chatsArray
}