import React from "react";
import { useEffect, useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

export default function SelectionBox(props) {
  const refNav = React.createRef();

  useEffect(() => {
    if (props.validate === true) {
      if (props.val < 5) {
        refNav.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="demo-simple-select-label">{props.label}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        ref={refNav}
        value={props.value}
        label={props.label}
        onChange={(e) => {
          props.changed(e.target.value);
        }}
      >
        {props.content}
      </Select>
    </FormControl>
  );
}
