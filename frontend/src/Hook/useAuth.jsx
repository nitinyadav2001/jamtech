import { AuthContext } from "@/context/Auth";
import { useContext } from "react";

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
