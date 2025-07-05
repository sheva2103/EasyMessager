import { FC } from "react";
import { useAppSelector } from "../../hooks/hook";
import { CONTACTS, CREATE_CHANNEL, SETTINGS, SHOW_CHANNEL_INFO, SHOW_USER_INFO } from "../../constants/constants";
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
            {content === CREATE_CHANNEL && <CreateChannel />}
            {content === SETTINGS && <Settings />}
            {content === CONTACTS && <Contacts />}
            {content === SHOW_CHANNEL_INFO && <ChannelFullInfoComponent />}
            {content === SHOW_USER_INFO && <UserFullInfoComponent />}
        </div>
    );
}
export default MenuChild;