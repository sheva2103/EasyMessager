import { FC } from "react";
import { useAppSelector } from "../../hooks/hook";
import { CONTACTS, CREATE_CHANNEL, SETTINGS } from "../../constants/constants";
import CreateChannel from "./CreateChannel";
import Settings from "../Settings/Settings";
import Contacts from "./Contacts";
import UserInfo from "./UserInfo";
import CloseMenu from "./CloseMenu";


const MenuChild: FC = () => {

    const content = useAppSelector(state => state.app.menu.menuChild)

    return (  
        <div>
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