import { FC, MouseEventHandler } from 'react';
import style from './StartPage.module.scss'
import classNames from 'classnames';
import { TypeValueStartPage } from '../../types/types';
import { FORM, SIGNIN, SIGNUP } from '../../constants/constants';
import EazyMessagerTitleIcon from '../EazyMessagerTitleIcon/EasyMessagerTitleIcon';
import SelectComponent from '../Settings/Select';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

type Props = {
    value: TypeValueStartPage,
    setValue: (value: TypeValueStartPage) => void,
}

const ButtonGroup: FC<Props> = ({value, setValue}) => {

    const {t} = useTypedTranslation()
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
                <button onClick={handleClickSingIn}>{t('signIn')}</button>
                <button onClick={handleClickSingUp}>{t('signUp')}</button>
            </div>
            <div>
                <SelectComponent />
            </div>
        </div>
    );
}

export default ButtonGroup