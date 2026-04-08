import { FC, useState } from "react";
import style from './StartPage.module.scss'
import SignIn from "../forms/SignIn";
import ButtonGroup from "./ButtonGroup";
import SignUp from "../forms/SignUp";
import { TypeValueStartPage } from "../../types/types";
import classNames from "classnames";
import { BUTTONGROUP, FORM, SIGNIN } from "../../constants/constants";
import ArrowBackLeft from '../../assets/box-arrow-left.svg'
import BubbleBackground from "./Layout";




const StartPage: FC = () => {

    const [valuePage, setValuePage] = useState<TypeValueStartPage>({ typePage: BUTTONGROUP, typeClick: SIGNIN })
    const handleClickBack = () => {
        setValuePage({ ...valuePage, typePage: BUTTONGROUP })
    }

    return (
        <BubbleBackground>
            <div className={style.wrapper} >
                <ButtonGroup value={valuePage} setValue={setValuePage} />
                <div className={classNames(style.contentForm, { [style.show]: valuePage.typePage === FORM })}>
                    <ArrowBackLeft fill="#d3d3d3"
                        fontSize={'32px'}
                        style={{ position: 'absolute', top: '24px', left: '24px' }}
                        cursor={'pointer'}
                        onClick={handleClickBack}
                    />
                    <div className="layoutStartPage">
                        {valuePage.typeClick === SIGNIN ?
                            <SignIn />
                            :
                            <SignUp />
                        }
                    </div>
                </div>
            </div>
        </BubbleBackground>

    );
}

export default StartPage;