import { FC, useEffect, useState } from "react";
import CleanIcon from '../assets/x-circle-fill.svg'
import { useDebounce } from "use-debounce";

type Props = {
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>,
    classes?: string,
    returnValue?: (text: string) => void,
    isCleanIcon?: boolean,
}

const InputComponent: FC<Props> = ({ inputProps, classes, returnValue, isCleanIcon }) => {

    const [name, setName] = useState('')
    const [debouncedText] = useDebounce(name, 1000);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    useEffect(() => {
        if (returnValue) {
            returnValue(debouncedText)
        }
    }, [debouncedText]);

    return (
        <div className={classes} style={{ position: 'relative' }}>
            <input type="text" value={name} onChange={handleChange} {...inputProps} />
            {isCleanIcon && Boolean(name.length) &&
                <div style={{ position: 'absolute', right: '14px', top: '12px' }}>
                    <CleanIcon cursor={'pointer'} onClick={() => setName('')} />
                </div>
            }
        </div>
    );
}

export default InputComponent;