import { FC } from "react";
import Delete from '../../assets/person-dash.svg'
import { CurrentUser } from "../../types/types";
import { contactsAPI } from "../../API/api";

type Props = {
    user: CurrentUser,
    currentUserEmail: string
}

const ListItem: FC<Props> = ({user, currentUserEmail}) => {

    const removeFromBlacklist = () => {
        contactsAPI.removeFromBlacklist(currentUserEmail, user)
    }

    return (  
        <li>
            <span>{user.displayName}</span>
            <div title="Удалить из ЧС" onClick={removeFromBlacklist}>
                <Delete color="red" cursor={'pointer'}/>
            </div>
        </li>
    );
}
 
export default ListItem;