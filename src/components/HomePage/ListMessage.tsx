import styles from './HomePage.module.scss'
import { FC } from 'react';
import Message from './Messgae';

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
    {name: 'alex', url: '', id: 42153332,message : '45566 https://reactdev.ru/libs/nextjs/basic/data-fetching/#getstaticprops 45566 https://reactdev.ru/libs/nextjs/basic/data-fetching/#getstaticprops'},
]

type Props = {
    showCheckbox: boolean,
    selectSeveral: (e: React.MouseEvent<HTMLSpanElement>) => void
}



const ListMessages: FC<Props> = (props: Props) => {

    return (  
        <div className={styles.listMessages}>
            <ul>
                {test.map((item) => (
                    <Message {...props} item={item} key={item.id}/>
                ))}
            </ul>
        </div>
    );
}

export default ListMessages;