import { FC, MutableRefObject, useEffect, useState } from "react";
import CleanIcon from '../assets/x-circle-fill.svg'
import { useDebounce } from "use-debounce";
import { useAppDispatch, useAppSelector } from "../hooks/hook";
import { setClearGlobalSearchUser } from "../store/slices/appSlice";
import { useTypedTranslation } from "../hooks/useTypedTranslation";

type Props = {
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>,
    classes?: string,
    returnValue?: (text: string) => void,
    isCleanIcon?: boolean,
    refInput?:  MutableRefObject<HTMLInputElement>,
    refContainer?: MutableRefObject<HTMLDivElement>
}

const InputComponent: FC<Props> = ({ inputProps, classes, returnValue, isCleanIcon, refInput, refContainer }) => {

    const [name, setName] = useState('')
    const isClearGlobalSearchUser = useAppSelector(state => state.app.clearGlobalSearchUser)
    const dispatch = useAppDispatch()
    const {t} = useTypedTranslation()
    const [debouncedText] = useDebounce(name, 1000);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    useEffect(() => {
        if (returnValue) {
            returnValue(debouncedText)
        }
    }, [debouncedText]);

    useEffect(() => {
        if(isClearGlobalSearchUser) {
            setName('')
            //returnValue(name)
            dispatch(setClearGlobalSearchUser(false))
        }
    }, [isClearGlobalSearchUser]);

    return (
        <div className={classes} style={{ position: 'relative' }} ref={refContainer}>
            <input type="text" value={name} onChange={handleChange} {...inputProps} placeholder={t('search')} ref={refInput}/>
            {isCleanIcon && Boolean(name.length) &&
                <div style={{ position: 'absolute', right: '14px', top: '12px' }}>
                    <CleanIcon cursor={'pointer'} onClick={() => setName('')} />
                </div>
            }
        </div>
    );
}

export default InputComponent;