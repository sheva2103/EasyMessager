import { cloneElement, FC, ReactElement, ReactNode } from "react";
import { useAppSelector } from "../../hooks/hook";
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from "../../store/store";

type ShowAvatarInfoProps = {
    children: ReactElement<{ url: string; name: string }>;
};



const selectDisplayInfo = createSelector(
    (state: RootState) => state.app.selectedChannel,
    (state: RootState) => state.app.selectedChat,
    (selectedChannel, selectedChat) => {
        const source = selectedChannel ?? selectedChat;
        return {
            name: source.displayName,
            url: source.photoURL,
        };
    }
);

const ShowAvatarInfo: FC<ShowAvatarInfoProps> = ({ children }) => {
    const info = useAppSelector(selectDisplayInfo);

    return cloneElement(children, { ...info });
};

export default ShowAvatarInfo;