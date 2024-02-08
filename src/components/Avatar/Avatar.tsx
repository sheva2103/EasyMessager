import { FC } from "react";
import styles from './Avatar.module.scss'
import classNames from "classnames";

type Props = {
    url: undefined | string,
    name: string
}

const Avatar: FC<Props> = ({url, name}) => {

    console.log(Boolean(url))
    return (  
        <div>
            {Boolean(url) ?
                <img src={url} alt={name[0]} className={styles.container}/>
                :
                <div className={classNames(styles.container, styles.noAvatar)}>
                    <span>{name[0].toUpperCase()}</span>
                </div>
            }
        </div>
    );
}

export default Avatar;