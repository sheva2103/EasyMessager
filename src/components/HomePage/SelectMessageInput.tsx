import classNames from "classnames";
import { FC, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import { Message } from "../../types/types";
import { useAppDispatch } from "../../hooks/hook";
import { addSelectedMessage, deleteSelectedMessage } from "../../store/slices/appSlice";

type Props = {
    showCheckbox: boolean,
    message: Message
}

const SelectMessageInput: FC<Props> = ({showCheckbox, message}) => {

    const [checked, setChecked] = useState(false)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (checked) dispatch(addSelectedMessage(message))
        else dispatch(deleteSelectedMessage(message))
    }, [checked]);

    useEffect(() => {
        setChecked(false)
    }, [showCheckbox]);

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