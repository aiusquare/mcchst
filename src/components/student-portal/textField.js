import { Alert, Collapse, TextField } from "@mui/material";
import { MDBInput } from "mdb-react-ui-kit";
import { useState } from "react";

const TextInput = (props) => {
  const validate = props.validate;
  const [text, setText] = useState("");

  return (
    <div>
      <MDBInput
        onBlur={(e) => {
          const emailRegex = /\S+@\S+\.\S+/;
          let val = e.target.value;

          if (emailRegex.test(val)) {
            val = val.toLowerCase();
          }

          setText(val.trim());
          props.tValue(val.trim());
        }}
        type={props.tType}
        label={props.tLabel}
        maxLength={props.maxLen}
        required
        className="m-2"
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
