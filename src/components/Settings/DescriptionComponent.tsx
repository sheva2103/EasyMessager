import React from 'react';
import styles from'./Settings.module.scss';

type Item = {
    title: string;
    description: string;
    onClick?: () => void
};

type Props = {
    items: Item[];
};

const DescriptionComponent: React.FC<Props> = ({ items }) => {
    return (
        <div className={styles.styledListContainer}>
            {items.map((item, index) => (
                <div key={index} className={styles.styledListItem}>
                    <div className={styles.styledListTitle}>{item.title}</div>
                    <span className={styles.styledListDescription} style={{cursor: item?.onClick ? 'pointer' : 'auto'}} onClick={item?.onClick}>
                        {item.title === 'email' ? <a href={`mailto:${item.description}`}>{item.description}</a> : item.description}
                    </span>
                    {index < items.length - 1 && <div className={styles.styledListDivider} />}
                </div>
            ))}
        </div>
    );
};

export default DescriptionComponent;