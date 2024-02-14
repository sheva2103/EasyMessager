import { FC, useState } from "react";
import styles from './Settings.module.scss'
import ArrowDown from '../../assets/caret-down-fill.svg'
import ArrowUp from '../../assets/caret-up-fill.svg'
import BlackListIcon from '../../assets/ban.svg'
import classNames from "classnames";
import ListItem from "./ListItem";
import styled from "styled-components";

const List = styled.ul<{ $open?: boolean; }>`
    
`


const BlackList: FC = () => {

    const [open, setOpen] = useState(false)

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
                    {open === !true ?
                        <ArrowDown cursor={'pointer'}/>
                        :
                        <ArrowUp cursor={'pointer'}/>
                }
                </div>
            </div>
            <div className={styles.dropDawnContainer}>
                {/* <label htmlFor='check-menu'>Чёрный список</label>
                <input type="checkbox" id="check-menu" className={styles.checkMenu}/> */}
                <ul className={classNames(styles.dropDawn, {[styles.show]: open})}>
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                    <ListItem />
                </ul>
            </div>
        </div>
    );
}

export default BlackList;