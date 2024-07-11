import "react-datepicker/dist/react-datepicker.css";
import HomeLeftComponent from "./HomeLeftComponent/HomeLeftComponent";
import HomeRightComponent from "./HomeRightComponent/HomeRightComponent";
import { useContext, useEffect } from "react";
import AuthContext, { AuthContextType } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/", { replace: true });
    }
  }, []);

  return (
    <div className="bg-[#0d75be] min-h-screen">
      <div className="grid xl:grid-cols-4">
        <div className="xl:col-span-1 p-5 flex items-center justify-center glass min-h-screen">
          <HomeLeftComponent />
        </div>
        <div className="xl:col-span-3 max-h-[100vh] overflow-y-auto p-5">
          <div>
            <HomeRightComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
