import classNames from "classnames";
import { FC, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import { Message1 } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { addSelectedMessage, deleteSelectedMessage } from "../../store/slices/appSlice";

// type Props = {
//     //showCheckbox: boolean,
//     message: Message
// }

// const SelectMessageInput: FC<Props> = ({ message}) => {

//     const [checked, setChecked] = useState(false)
//     const dispatch = useAppDispatch()
//     const showCheckbox = useAppSelector(state => state.app.showCheckbox)

//     useEffect(() => {
//         if (checked) dispatch(addSelectedMessage(message))
//         else dispatch(deleteSelectedMessage(message))
//     }, [checked]);

//     useEffect(() => {
//         setChecked(false)
//     }, [showCheckbox]);

//     console.log('render checkbox')

//     return (  
//         <input 
//             type="checkbox" 
//             className={classNames({ [styles.showCheckbox]: showCheckbox })} 
//             checked={checked}
//             onChange={() => setChecked(!checked)}
//         />
//     );
// }

type Props = {
    messageInfo: Message1
}

const SelectMessageInput: FC<Props> = ({ messageInfo }) => {

    const [checked, setChecked] = useState(false)
    const dispatch = useAppDispatch()
    const showCheckbox = useAppSelector(state => state.app.showCheckbox)

    useEffect(() => {
        if (checked) dispatch(addSelectedMessage(messageInfo))
        else dispatch(deleteSelectedMessage(messageInfo))
    }, [checked]);

    useEffect(() => {
        setChecked(false)
    }, [showCheckbox]);

    console.log('render checkbox')

    return (  
        <input 
            type="checkbox" 
            className={classNames({ [styles.showCheckbox]: showCheckbox })} 
            checked={checked}
            onChange={() => setChecked(!checked)}
        />
    );
}

export default SelectMessageInput;