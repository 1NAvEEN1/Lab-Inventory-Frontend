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
  Typography,
  Box,
} from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const CurrencyField = ({ label, value, onChange, disabled }) => (
  <Box>
    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
    <TextField
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      inputProps={{ step: "0.01" }}
      fullWidth
      size="small"
      disabled={disabled}
      sx={{ mb: 1 }}
    />
  </Box>
);

const PercentageField = ({ label, value, onChange, disabled }) => (
  <Box>
    <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
    <TextField
      type="number"
      value={value ?? ""}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      InputProps={{ endAdornment: <span>%</span> }}
      fullWidth
      size="small"
      disabled={disabled}
      sx={{ mb: 1 }}
    />
  </Box>
);

const AttributeInput = ({ attribute, value, onChange, disabled = false }) => {
  const { label, type, options } = attribute;

  switch (type) {
    case "text":
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
          <TextField
            size="small"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            disabled={disabled}
            sx={{ mb: 1 }}
          />
        </Box>
      );
    case "number":
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
          <TextField
            size="small"
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            fullWidth
            disabled={disabled}
            sx={{ mb: 1 }}
          />
        </Box>
      );
    case "percentage":
      return (
        <PercentageField
          size="small"
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case "currency":
      return (
        <CurrencyField
          size="small"
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case "date":
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={value ? dayjs(value) : null}
              onChange={(d) => onChange(d ? d.toISOString() : null)}
              slotProps={{
                textField: { size: "small", fullWidth: true, disabled: disabled, sx: { mb: 1 } },
              }}
              disabled={disabled}
            />
          </LocalizationProvider>
        </Box>
      );
    case "datetime":
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              value={value ? dayjs(value) : null}
              onChange={(d) => onChange(d ? d.toISOString() : null)}
              slotProps={{
                textField: { size: "small", fullWidth: true, disabled: disabled, sx: { mb: 1 } },
              }}
              disabled={disabled}
            />
          </LocalizationProvider>
        </Box>
      );
    case "select":
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
          <FormControl fullWidth size="small" disabled={disabled} sx={{ mb: 1 }}>
            <Select
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
            >
              {(options || []).map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      );
    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
            />
          }
          label={label}
        />
      );
    case "radio":
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
          <FormControl disabled={disabled}>
            <RadioGroup
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
            >
              {(options || []).map((opt) => (
                <FormControlLabel
                  key={opt}
                  value={opt}
                  control={<Radio disabled={disabled} size="small" />}
                  label={opt}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      );
    case "toggle":
      return (
        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600 }}>{label}</Typography>
          <ToggleButtonGroup
            exclusive
            value={value ? "on" : "off"}
            onChange={(_, val) => onChange(val === "on")}
            disabled={disabled}
            size="small"
          >
            <ToggleButton value="off" disabled={disabled}>
              Off
            </ToggleButton>
            <ToggleButton value="on" disabled={disabled}>
              On
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      );
    default:
      return null;
  }
};

export default AttributeInput;
