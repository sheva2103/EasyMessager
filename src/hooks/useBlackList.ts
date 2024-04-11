import { useEffect, useMemo, useState } from "react"
import { useAppSelector } from "./hook"

export const useBlacList = () => {
    const blackList = useAppSelector(state => state.app.blackList)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const isBlackList = useMemo(() => blackList.some(item => item.email === selectedChat.email), [blackList.length])
    const [isBan, setBan] = useState(false)

    useEffect(() => {
        
    }, []);

    return isBlackList
}