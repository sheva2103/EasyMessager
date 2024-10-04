import { FC } from "react";
import styles from './HomePage.module.scss'
import { createNewDate, getDatefromDate } from "../../utils/utils";

type Props = {
    date: string
}

const GetDateMessage: FC<Props> = ({ date }) => {
    return (
        <div className={styles.hr__container}>
            <span className={styles.hr__element}>{getDatefromDate(createNewDate(date))}</span>
        </div>
    );
}

export default GetDateMessage;