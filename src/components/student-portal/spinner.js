import LoadingIcons from "react-loading-icons";
import Circles from "react-loading-icons/dist/esm/components/circles";

const Spinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <Circles
        fill="#a00d0d"
        width="50px"
        height="50px"
        speed={0.5}
        stroke="#98ff98"
      />
    </div>
  );
};
export default Spinner;
