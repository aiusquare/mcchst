import PropTypes from "prop-types";
import "./style.css";

export const TextField = ({
  label = "name",
  className,
  iconUser = "https://cdn.animaapp.com/projects/6529d32906102a4c5647aa97/releases/65bafc47ab2aa471f55c4468/img/---icon--user-@2x.png",
  nameClassName,
  placeholder,
  type,
  setValue,
}) => {
  return (
    <div className={`text-field ${className}`}>
      <div className="overlap-group">
        <img className="icon-user" alt="Icon user" src={iconUser} />
      </div>
      <input
        placeholder={`${placeholder}`}
        className={`name ${nameClassName}`}
        type={type}
        onBlur={(e) => {
          setValue(e.target.value);
        }}
      />
    </div>
  );
};

TextField.propTypes = {
  label: PropTypes.string,
  iconUser: PropTypes.string,
};
