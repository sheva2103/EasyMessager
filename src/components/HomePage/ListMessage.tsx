import classNames from 'classnames';
import Avatar from '../Avatar/Avatar';
import styles from './HomePage.module.scss'

const test = [
    {name: 'alex', url: '', message: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque fuga quas earum dolorum maxime unde vero dignissimos tenetur molestias sit! '},
    {name: 'john', url: '', message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'alex', url: '', message : 'Lorem ipsum dolor sit repudiandae!'},
    {name: 'alex', url: '', message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', message : '45452223'},
    {name: 'john', url: '', message : 'cv'},
    {name: 'alex', url: '', message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'alex', url: '', message : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!'},
    {name: 'john', url: '', message : '54678'},
    {name: 'alex', url: '', message : '12154hhd'},
    {name: 'alex', url: '', message : ' Lorem ipsum dolor sit amet consectetur adipisicing elit.'},
]

const ListMessages = () => {

    const owner = 'alex'

    return (  
        <div className={styles.listMessages}>
            <ul>
                {test.map((item, index) => (
                    <li key={item.name + index}>
                        <Avatar url={item.url} name={item.name}/>
                        <span className={classNames({[styles.guest]: item.name === owner})}>{item.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ListMessages;