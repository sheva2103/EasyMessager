import { FC, ReactNode } from "react";

type Props = {
    children: ReactNode
}

const Layout: FC<Props> = ({children}) => {
    return (  
        <div className="layoutStartPage">
            {children}
        </div>
    );
}
export default Layout;