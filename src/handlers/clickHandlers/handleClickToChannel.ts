// import { channelAPI } from "../../API/api"
// import { Chat, TypeChannel } from "../../types/types"
// import { createObjectChannel } from "../../utils/utils"

// interface IArgs {
//     isSelected: boolean,
//     channel: TypeChannel,
//     currentUserID: string
// }

// const handleClickToChannel = async ({isSelected, channel, currentUserID}: IArgs) => {
    
//     if (!isSelected) {
//         const chanelObj: Chat = createObjectChannel(channel)
//         const updateChannel = await channelAPI.getCurrentInfo(channel.channelID)
//         if (!updateChannel.isOpen) {
//             const isSubscriber = updateChannel.listOfSubscribers.some(sub => sub.uid === currentUserID)
//             if (isSubscriber) {
//                 delete chanelObj.channel.listOfSubscribers
//                 dispatch(setSelectedChannel(chanelObj))
//             } else (
//                 //setIsNotAccess(true)
//             )
//         }
//         if (updateChannel.isOpen) {
//             delete chanelObj.channel.listOfSubscribers
//             dispatch(setSelectedChannel(chanelObj))
//         }
//     }
// }