import { FC, memo } from "react";
import styles from './HomePage.module.scss'
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setSelectedEmoji } from "../../store/slices/appSlice";


type Props = {
    parent: React.MutableRefObject<HTMLDivElement> | null
}

const EmojiComponent: FC<Props> = ({parent}) => {

    console.log('render emoji')
    const isOpen = useAppSelector(state => state.app.emojiIsOpen)
    const dispatch = useAppDispatch()
    const height = parent.current ? parent.current.clientHeight : 450

    const selectEmoji = (e: EmojiClickData) => {
        dispatch(setSelectedEmoji(e.emoji))
    }

    return (
        <div>
            <EmojiPicker 
                className={styles.emojiControl_wrapper}
                autoFocusSearch={false}
                open={isOpen}
                lazyLoadEmojis={true}
                skinTonesDisabled
                emojiStyle={EmojiStyle.GOOGLE}
                onEmojiClick={selectEmoji}
                height={height}
            />
        </div>
    );
}

export default memo(EmojiComponent);