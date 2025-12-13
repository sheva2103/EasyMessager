import { FC } from "react";
import Delete from '../../assets/person-dash.svg'
import { Chat, CurrentUser } from "../../types/types";
import { contactsAPI } from "../../API/api";
import { closeMenu, setTempChat } from "../../store/slices/appSlice";
import { useAppDispatch } from "../../hooks/hook";

type Props = {
    user: CurrentUser,
    currentUserEmail: string
}

const ListItem: FC<Props> = ({ user, currentUserEmail }) => {

    const removeFromBlacklist = () => {
        contactsAPI.removeFromBlacklist(currentUserEmail, user)
    }

    const dispatch = useAppDispatch()

    const handleClickName = () => {
        dispatch(closeMenu(null))
        dispatch(setTempChat(user))
    }

    return (
        <li style={{ margin: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
                onClick={handleClickName}
                style={{ fontSize: '1.1rem', margin: '2px 0px', cursor: 'pointer' }}
            >
                {user.displayName}
            </span>
            <div title="Удалить из ЧС" onClick={removeFromBlacklist} style={{ display: 'flex', alignItems: 'center' }}>
                <Delete color="red" cursor={'pointer'} />
            </div>
        </li>
    );
}

export default ListItem;