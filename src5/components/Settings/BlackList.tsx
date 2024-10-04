import { FC, useState } from "react";
import styles from './Settings.module.scss'
import ArrowDown from '../../assets/caret-down-fill.svg'
import ArrowUp from '../../assets/caret-up-fill.svg'
import BlackListIcon from '../../assets/ban.svg'
import classNames from "classnames";
import ListItem from "./ListItem";
import { useAppSelector } from "../../hooks/hook";


const BlackList: FC = () => {

    const [open, setOpen] = useState(false)
    const list = useAppSelector(state => state.app.blackList)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)

    return (
        <div className={styles.item}>
            <div className={styles.container}>
                <div>
                    <BlackListIcon />
                </div>
                <div className={styles.containerItem} onClick={() => setOpen(() => !open)}>
                    <div>
                        <span style={{cursor: 'pointer'}}>Чёрный список</span>
                    </div>
                    {open ?
                        <ArrowUp cursor={'pointer'}/>
                        :
                        <ArrowDown cursor={'pointer'}/>
                }
                </div>
            </div>
            <div className={styles.dropDawnContainer}>
                {/* <label htmlFor='check-menu'>Чёрный список</label>
                <input type="checkbox" id="check-menu" className={styles.checkMenu}/> */}
                <ul className={classNames(styles.dropDawn, {[styles.show]: open})}>
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {/* {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
                    {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)} */}
                </ul>
            </div>
        </div>
    );
}

export default BlackList;