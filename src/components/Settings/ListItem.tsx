import { FC } from "react";
import Delete from '../../assets/person-dash.svg'


const ListItem: FC = () => {
    return (  
        <li>
            <span>zxcvbng35</span>
            <Delete color="red" cursor={'pointer'}/>
        </li>
    );
}
 
export default ListItem;