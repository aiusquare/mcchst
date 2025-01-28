import * as React from "react";
import { FormControl } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

export default function DateInput(props) {
  const dateString = props.value;

  // Convert the string to a JavaScript Date object
  const jsDate = dayjs(dateString, "DD/MM/YYYY");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl>
        <DatePicker
          label={props.label}
          value={jsDate}
          onChange={props.handleValue}
        />
      </FormControl>
    </LocalizationProvider>
  );
}
