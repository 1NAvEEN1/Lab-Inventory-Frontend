import React from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
  Stack,
} from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const CurrencyField = ({ label, value, onChange }) => (
  <TextField
    label={label}
    type="number"
    value={value ?? ""}
    onChange={(e) => onChange(parseFloat(e.target.value))}
    inputProps={{ step: "0.01" }}
    fullWidth
  />
);

const PercentageField = ({ label, value, onChange }) => (
  <TextField
    label={label}
    type="number"
    value={value ?? ""}
    onChange={(e) => onChange(parseFloat(e.target.value))}
    InputProps={{ endAdornment: <span>%</span> }}
    fullWidth
  />
);

const AttributeInput = ({ attribute, value, onChange }) => {
  const { label, type, options } = attribute;

  switch (type) {
    case "text":
      return (
        <TextField label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} fullWidth />
      );
    case "number":
      return (
        <TextField label={label} type="number" value={value ?? ""} onChange={(e) => onChange(parseFloat(e.target.value))} fullWidth />
      );
    case "percentage":
      return <PercentageField label={label} value={value} onChange={onChange} />;
    case "currency":
      return <CurrencyField label={label} value={value} onChange={onChange} />;
    case "date":
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker label={label} value={value ? dayjs(value) : null} onChange={(d) => onChange(d ? d.toISOString() : null)} slotProps={{ textField: { fullWidth: true } }} />
        </LocalizationProvider>
      );
    case "datetime":
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker label={label} value={value ? dayjs(value) : null} onChange={(d) => onChange(d ? d.toISOString() : null)} slotProps={{ textField: { fullWidth: true } }} />
        </LocalizationProvider>
      );
    case "select":
      return (
        <FormControl fullWidth>
          <InputLabel>{label}</InputLabel>
          <Select label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {(options || []).map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    case "checkbox":
      return (
        <FormControlLabel control={<Checkbox checked={!!value} onChange={(e) => onChange(e.target.checked)} />} label={label} />
      );
    case "radio":
      return (
        <FormControl>
          <FormLabel>{label}</FormLabel>
          <RadioGroup value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
            {(options || []).map((opt) => (
              <FormControlLabel key={opt} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
        </FormControl>
      );
    case "toggle":
      return (
        <Stack>
          <FormLabel>{label}</FormLabel>
          <ToggleButtonGroup
            exclusive
            value={value ? "on" : "off"}
            onChange={(_, val) => onChange(val === "on")}
          >
            <ToggleButton value="off">Off</ToggleButton>
            <ToggleButton value="on">On</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      );
    default:
      return null;
  }
};

export default AttributeInput;


