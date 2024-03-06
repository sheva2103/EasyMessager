import classNames from 'classnames';
import Avatar from '../Avatar/Avatar';
import styles from './HomePage.module.scss'
import { FC, useState } from 'react';

const test = [
    {name: 'alex', url: '', id: 42154,message: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque fuga quas earum dolorum maxime unde vero dignissimos tenetur molestias sit! '},
    {name: 'john', url: '', id: 42155,message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', id: 42156,message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', id: 42157,message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'alex', url: '', id: 421588,message : 'Lorem ipsum dolor sit repudiandae!'},
    {name: 'alex', url: '', id: 421547,message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', id: 421513,message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', id: 4215111,message : '45452223'},
    {name: 'john', url: '', id: 4215885,message : 'cv'},
    {name: 'alex', url: '', id: 42154568,message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'alex', url: '', id: 42156534,message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', id: 4215886,message : '54678'},
    {name: 'alex', url: '', id: 421554,message : '12154hhd'},
    {name: 'alex', url: '', id: 42153332,message : ' Lorem ipsum dolor sit amet consectetur adipisicing elit.'},
]

type Props = {
    showCheckbox: boolean,
    handleContextMenu: (e: React.MouseEvent) => void
}

const ListMessages: FC<Props> = ({showCheckbox, handleContextMenu}) => {

    const owner = 'alex'
    

    console.log(showCheckbox)

    return (  
        <div className={styles.listMessages}>
            <ul>
                {test.map((item, index) => (
                    <li key={item.name + index}>
                        <input type="checkbox" className={classNames({[styles.showCheckbox]: showCheckbox})}/>
                        <Avatar url={item.url} name={item.name}/>
                        <span className={classNames({[styles.guest]: item.name === owner})} onContextMenu={handleContextMenu}>{item.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ListMessages;