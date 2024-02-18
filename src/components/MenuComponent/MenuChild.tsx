import { FC } from "react";
import { useAppSelector } from "../../hooks/hook";
import { CONTACTS, CREATE_CHANNEL, SETTINGS } from "../../constants/constants";
import CreateChannel from "../forms/CreateChannel";
import Settings from "../Settings/Settings";
import Contacts from "../Contacts/Contacts";
import CloseMenu from "./CloseMenu";
import styles from './MenuComponent.module.scss'


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
        </div>
    );
}
export default MenuChild;