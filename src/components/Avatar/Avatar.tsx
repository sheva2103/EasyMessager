import { FC, memo, useEffect, useState } from "react";
import styles from './Avatar.module.scss'
import classNames from "classnames";

const zoomStyle: React.CSSProperties = {
    width: '250px',
    height: '250px'
}

type Props = {
    url: undefined | string,
    name: string,
    zoom?: boolean,
    isOnline?: boolean
}

const Avatar: FC<Props> = ({url, name, zoom, isOnline}) => {

    const [isLoad, setIsLoad] = useState(false)

    useEffect(() => {
        if(url) {
            const img = new Image()
            img.src = url
            img.onload = () => setIsLoad(true)
            img.onerror = () => setIsLoad(false)
        }
    }, [url]);

    return (  
        <div className={zoom && styles.wrapper}>
            {Boolean(isLoad) ?
                <div className={isOnline ? styles.avatar_isOnline : ''}>
                    <img src={url} alt={name[0]} className={styles.container} style={zoom && zoomStyle}/>
                </div>
                :
                <div className={isOnline ? styles.avatar_isOnline : ''}>
                    <div className={classNames(styles.container, styles.noAvatar)}>
                        <span>{name[0].toUpperCase()}</span>
                    </div>
                </div>
            }
        </div>
    );
}

export default memo(Avatar);