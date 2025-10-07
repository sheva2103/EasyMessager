import { FC, useState } from "react";
import styles from './Settings.module.scss'
import ArrowDown from '../../assets/caret-down-fill.svg'
import ArrowUp from '../../assets/caret-up-fill.svg'
import BlackListIcon from '../../assets/ban.svg'
import classNames from "classnames";
import ListItem from "./ListItem";
import { useAppSelector } from "../../hooks/hook";
import { Dialog } from "@mui/material";
import { CurrentUser } from "../../types/types";
import CloseMenuIcon from '../../assets/closeDesktop.svg'
import DialogComponent from "./DialogComponent";
import { useTranslation } from "react-i18next";

const dialogStyle = styles.listStyle

interface ListProps {
    open: boolean;
    onClose: (value: boolean) => void;
    list: CurrentUser[],
    currentUserEmail: string
}

// function List(props: ListProps) {
//     const { onClose, open, list, currentUserEmail } = props;

//     const handleClose = () => {
//         onClose(false);
//     };

//     return (
//         <>
//         <Dialog onClose={handleClose} open={open} classes={{paper: dialogStyle}}>
//             <div className={styles.close}><CloseMenuIcon cursor={'pointer'} fontSize={'1.3rem'} onClick={handleClose}/></div>
//             <ul >
//                 {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail} />)}
//                         {/* {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)}
//                     {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail}/>)} */}
//             </ul>
//         </Dialog>
//         </>
//     );
// }

function List(props: {list: CurrentUser[], currentUserEmail: string}) {
    const { list, currentUserEmail } = props;

    return (
            <ul >
                {list.map(item => <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail} />)}
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
    );
}


const BlackList: FC = () => {

    const [open, setOpen] = useState(false)
    const list = useAppSelector(state => state.app.blackList)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)
    const {t} = useTranslation()

    return (
        <div className={styles.item}>
            <div className={styles.container}>
                <div>
                    <BlackListIcon />
                </div>
                <div className={styles.containerItem} onClick={() => setOpen(() => !open)}>
                    <div>
                        <span style={{ cursor: 'pointer' }}>{t('darkList')}</span>
                    </div>
                    {open ?
                        <ArrowUp cursor={'pointer'} />
                        :
                        <ArrowDown cursor={'pointer'} />
                    }
                </div>
            </div>
            <div className={styles.dropDawnContainer}>
                {/* <List open={open} onClose={setOpen} list={list} currentUserEmail={currentUserEmail}/> */}
                <DialogComponent isOpen={open} onClose={setOpen}>
                    <List list={list} currentUserEmail={currentUserEmail}/>
                </DialogComponent>
            </div>
        </div>
    );
}

export default BlackList;