import { Alert, Collapse } from "@mui/material";
import { MDBInput } from "mdb-react-ui-kit";
import { useState } from "react";

const TextInput = (props) => {
  const validate = props.validate;
  const [text, setText] = useState("");

  return (
    <div className="">
      <MDBInput
        onChange={(e) => {
          const emailRegex = /\S+@\S+\.\S+/;
          let val = e.target.value;

          if (emailRegex.test(val)) {
            val = val.toLowerCase();
          }

          setText(val.trim());
          props.tValue(val.trim());
        }}
        type={props.tType}
        style={{ textAlign: "center" }}
        label={props.tLabel}
        maxLength={props.maxLen}
        value={props.value}
        className="p-2 m-2"
        required
      />
      {text === "" && <ErrorComp show={validate} />}
    </div>
  );
};

const ErrorComp = (props) => {
  return (
    <div>
      <Collapse in={props.show}>
        <Alert severity="error">invalid input</Alert>
      </Collapse>
    </div>
  );
};

export default TextInput;
