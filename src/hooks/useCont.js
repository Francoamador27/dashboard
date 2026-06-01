import { useContext } from "react";
import ProviderContext from "../context/Provider";

const useCont = () => {
    return useContext(ProviderContext);
}

export default useCont;