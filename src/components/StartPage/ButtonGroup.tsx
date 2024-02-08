import { FC, MouseEventHandler } from 'react';
import style from './StartPage.module.scss'
import classNames from 'classnames';
import { TypeValueStartPage } from '../../types/types';
import { FORM, SIGNIN, SIGNUP } from '../../constants/constants';
import EazyMessagerTitleIcon from '../EazyMessagerTitleIcon/EasyMessagerTitleIcon';

type Props = {
    value: TypeValueStartPage,
    setValue: (value: TypeValueStartPage) => void,
}

const ButtonGroup: FC<Props> = ({value, setValue}) => {

    const handleClickSingIn = () => {
        setValue({typePage: FORM, typeClick: SIGNIN})
    }

    const handleClickSingUp = () => {
        setValue({typePage: FORM, typeClick: SIGNUP})
    }

    return (  
        <div className={classNames(style.contentButton, {[style.hide]: value.typePage === FORM})}>
            <EazyMessagerTitleIcon />
            <div className={style.buttonGroup}>
                <button onClick={handleClickSingIn}>sign in</button>
                <button onClick={handleClickSingUp}>sign up</button>
            </div>
        </div>
    );
}

export default ButtonGroup