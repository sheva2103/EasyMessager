import { FC, memo, useEffect } from "react";
import styles from './HomePage.module.scss'
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setSelectedEmoji } from "../../store/slices/appSlice";
import classNames from "classnames";


type Props = {
    height: number
}

const EmojiComponent: FC<Props> = ({height}) => {

    console.log('render emoji')
    const isOpen = useAppSelector(state => state.app.emojiIsOpen)
    const dispatch = useAppDispatch()

    const selectEmoji = (e: EmojiClickData) => {
        dispatch(setSelectedEmoji(e.emoji))
    }

    return (
        <div className={classNames(styles.emojiControl__component, {[styles.emojiControl__component_show]: isOpen})}>
            <EmojiPicker 
                className={styles.emojiControl_wrapper}
                autoFocusSearch={false}
                open={isOpen}
                lazyLoadEmojis={true}
                skinTonesDisabled
                emojiStyle={EmojiStyle.GOOGLE}
                onEmojiClick={selectEmoji}
                height={height}
                width={250}
            />
        </div>
    );
}

export default memo(EmojiComponent);