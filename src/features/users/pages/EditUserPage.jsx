import { useLocation } from "react-router-dom";
import CreateUser from "../components/CreateUser";

const EditUserPage = () => {
  const location = useLocation();
  const userData = location.state?.userData;

  return <CreateUser mode="edit" userData={userData} />;
};

export default EditUserPage;
