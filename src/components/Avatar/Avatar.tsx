import { FC, memo, useEffect, useState } from "react";
import styles from './Avatar.module.scss'
import classNames from "classnames";

type Props = {
    url: undefined | string,
    name: string
}

const Avatar: FC<Props> = ({url, name}) => {

    const [isLoad, setIsLoad] = useState(false)

    useEffect(() => {
        if(url) {
            const img = new Image()
            img.src = url
            img.onload = () => setIsLoad(true)
        }
    }, [url]);

    return (  
        <div>
            {Boolean(isLoad) ?
                <img src={url} alt={name[0]} className={styles.container}/>
                :
                <div className={classNames(styles.container, styles.noAvatar)}>
                    <span>{name[0].toUpperCase()}</span>
                </div>
            }
        </div>
    );
}

export default memo(Avatar);