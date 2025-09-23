import { channelAPI } from "../API/api";
import { setSelectedChannel } from "../store/slices/appSlice";
import { Chat, TypeChannel } from "../types/types";
import { createObjectChannel } from "../utils/utils";
import { useAppDispatch } from "./hook";


interface IArgs {
    isSelected: boolean;
    channel: TypeChannel;
    currentUserID: string;
    setIsNotAccess: (isNotAccess: boolean) => void
}

export const useChannelClickHandler = () => {
    const dispatch = useAppDispatch();

    const handleClickToChannel = async ({isSelected, channel, currentUserID, setIsNotAccess}: IArgs): Promise<void | null> => {
        if (!isSelected) {
            const updateChannel = await channelAPI.getCurrentInfo(channel.channelID);
            if(!updateChannel) throw new Error('Такого канала больше нет')
            const chanelObj: Chat = createObjectChannel(updateChannel);
            const isSubscriber = updateChannel.listOfSubscribers?.some(sub => sub.uid === currentUserID)

            if (!updateChannel.isOpen && !isSubscriber) {
                setIsNotAccess(true)
                return;
            }

            delete chanelObj.channel.listOfSubscribers;
            dispatch(setSelectedChannel(chanelObj));
        }
    };

    return { handleClickToChannel };
};