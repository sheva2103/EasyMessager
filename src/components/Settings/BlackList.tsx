import { FC, useState } from "react";
import styles from './Settings.module.scss'
import ArrowDown from '../../assets/caret-down-fill.svg'
import ArrowUp from '../../assets/caret-up-fill.svg'
import BlackListIcon from '../../assets/ban.svg'
import ListItem from "./ListItem";
import { useAppSelector } from "../../hooks/hook";
import { CurrentUser } from "../../types/types";
import DialogComponent, { LayoutDialogList } from "./DialogComponent";
import { useTranslation } from "react-i18next";
import { Virtuoso } from "react-virtuoso";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

export function EmptyList(): JSX.Element {
    const {t} = useTypedTranslation()
    return (
        <div className={styles['empty-container']}>
            <div className={styles['empty-icon']}>📂</div>
            <p className={styles['empty-text']}>{t('emptyList')}</p>
        </div>
    )
}

function List(props: { list: CurrentUser[], currentUserEmail: string }) {
    const { list, currentUserEmail } = props;

    if (list.length === 0) return <EmptyList />

    return (
        <LayoutDialogList>
            <Virtuoso
                style={{ height: '100%' }}
                data={list}
                totalCount={list.length}
                itemContent={(index, item) => (
                    <ListItem key={item.uid} user={item} currentUserEmail={currentUserEmail} />
                )}
            />
        </LayoutDialogList>
    );
}


const BlackList: FC = () => {

    const [open, setOpen] = useState(false)
    const list = useAppSelector(state => state.app.blackList)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)
    const { t } = useTranslation()

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
                <DialogComponent isOpen={open} onClose={setOpen}>
                    <List list={list} currentUserEmail={currentUserEmail} />
                </DialogComponent>
            </div>
        </div>
    );
}

export default BlackList;