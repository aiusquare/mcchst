import * as React from "react";
import { FormControl } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function DateInput(props) {
  const dateString = props.value;

  const jsDate = dateString
    ? dayjs(dateString, ["DD/MM/YYYY", "YYYY-MM-DD"], true)
    : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl>
        <DatePicker
          label={props.label}
          value={jsDate && jsDate.isValid() ? jsDate : null}
          disabled={props.disabled}
          onChange={props.handleValue}
        />
      </FormControl>
    </LocalizationProvider>
  );
}
