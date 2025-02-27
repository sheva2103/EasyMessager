import { FC, memo } from "react";
import styles from './HomePage.module.scss'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { useAppSelector } from "../../hooks/hook";


const EmojiComponent: FC = () => {

    console.log('render emoji')
    const isOpen = useAppSelector(state => state.app.emojiIsOpen)

    return (
        <div>
            {/* <EmojiPicker onEmojiClick={(e) => console.log(e)} theme={theme as Theme}/> */}
            <EmojiPicker 
                className={styles.emojiControl_wrapper}
                autoFocusSearch={false}
                open={isOpen}
                lazyLoadEmojis={true}
                skinTonesDisabled
                emojiStyle={EmojiStyle.GOOGLE}
            />
        </div>
    );
}

export default memo(EmojiComponent);