import { FC, lazy, memo, Suspense, useEffect } from "react";
import styles from './HomePage.module.scss'
import { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setSelectedEmoji } from "../../store/slices/appSlice";
import classNames from "classnames";
import Preloader from '../../assets/preloader.svg'


type Props = {
    height: number
}

const EmojiPickerLazy = lazy(() => import('emoji-picker-react'))

const EmojiComponent: FC<Props> = ({ height }) => {

    console.log('render emoji')
    const isOpen = useAppSelector(state => state.app.emojiIsOpen)
    const dispatch = useAppDispatch()

    const selectEmoji = (e: EmojiClickData) => {
        dispatch(setSelectedEmoji(e.emoji))
    }

    return (
        <div className={classNames(styles.emojiControl__component, { [styles.emojiControl__component_show]: isOpen })}>
            {isOpen &&
                <Suspense fallback={<Preloader />}>
                    <EmojiPickerLazy
                        className={styles.emojiControl_wrapper}
                        autoFocusSearch={false}
                        open={isOpen}
                        lazyLoadEmojis={true}
                        skinTonesDisabled
                        emojiStyle={EmojiStyle.GOOGLE}
                        onEmojiClick={selectEmoji}
                        height={height}
                        width={250}
                        previewConfig={{ showPreview: false }}
                    />
                </Suspense>
            }
        </div>
    );
}

export default memo(EmojiComponent);