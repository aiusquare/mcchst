import PropTypes from "prop-types";
import React from "react";
import "./style.css";

export const OfficersAlbum = ({
  position = "position",
  name = "name",
  maskGroup = "maskGroup",
}) => {
  return (
    <div className="officers-album">
      <div className="overlap-group">
        <div className="rectangle" />
        <div className="div" />
        <div className="ellipse" />
        <img className="mask-group" alt="Mask group" src={maskGroup} />
        <div className="text-contenet">
          <div className="name">{name}</div>
        </div>
        <div className="frame">
          <div className="position">{position}</div>
        </div>
      </div>
    </div>
  );
};

OfficersAlbum.propTypes = {
  position: PropTypes.string,
  name: PropTypes.string,
};
