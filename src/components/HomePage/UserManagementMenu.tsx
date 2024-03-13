import { FC } from "react";
import MenuIcon from '../../assets/menu.svg'


const UserManagementMenu: FC = () => {
    return (  
        <div style={{margin: '0 8px -4px 8px'}}>
            <MenuIcon cursor={'pointer'}/>
        </div>
    );
}
 
export default UserManagementMenu;