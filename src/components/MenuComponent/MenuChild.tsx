import { FC } from "react";
import { useAppSelector } from "../../hooks/hook";
import { firebasePath, clickType } from "../../constants/constants";
import CreateChannel from "../forms/CreateChannel";
import Settings from "../Settings/Settings";
import Contacts from "../Contacts/Contacts";
import CloseMenu from "./CloseMenu";
import styles from './MenuComponent.module.scss'
import ChannelFullInfoComponent from "../HomePage/ChannelFullInfoComponent";
import UserFullInfoComponent from "../HomePage/UserFullInfoComponent";


const MenuChild: FC = () => {

    const content = useAppSelector(state => state.app.menu.menuChild)

    return (  
        <div className={styles.barChildContent}>
            <div>
                <CloseMenu left/>
            </div>
            {content === clickType.CREATE_CHANNEL && <CreateChannel />}
            {content === clickType.SETTINGS && <Settings />}
            {content === clickType.CONTACTS && <Contacts />}
            {content === clickType.SHOW_CHANNEL_INFO && <ChannelFullInfoComponent />}
            {content === clickType.SHOW_USER_INFO && <UserFullInfoComponent />}
        </div>
    );
}
export default MenuChild;