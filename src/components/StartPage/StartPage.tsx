import { FC, useState } from "react";
import style from './StartPage.module.scss'
import SignIn from "../forms/SignIn";
import ButtonGroup from "./ButtonGroup";
import SignUp from "../forms/SignUp";
import { TypeValueStartPage } from "../../types/types";
import classNames from "classnames";
import { BUTTONGROUP, FORM, SIGNIN } from "../../constants/constants";
import Layout from "../Layout/Layout";
import ArrowBackLeft from '../../assets/box-arrow-left.svg'




const StartPage: FC = () => {

    const [valuePage, setValuePage] = useState<TypeValueStartPage>({ typePage: BUTTONGROUP, typeClick: SIGNIN })
    const handleClickBack = () => {
        setValuePage({ ...valuePage, typePage: BUTTONGROUP })
    }

    return (
        <div className={style.wrapper}>
            <ButtonGroup value={valuePage} setValue={setValuePage} />
            <div className={classNames(style.contentForm, { [style.show]: valuePage.typePage === FORM })}>
                <ArrowBackLeft fill="#8774e1"
                    fontSize={'32px'}
                    style={{ position: 'absolute', top: '24px', left: '24px' }}
                    cursor={'pointer'}
                    onClick={handleClickBack}
                />
                <Layout>
                    {valuePage.typeClick === SIGNIN ?
                        <SignIn />
                        :
                        <SignUp />
                    }
                </Layout>
            </div>
        </div>
    );
}

export default StartPage;