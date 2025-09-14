export const ATTRIBUTE_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "percentage", label: "Percentage" },
  { value: "currency", label: "Currency (0.00)" },
  { value: "date", label: "Date" },
  { value: "datetime", label: "Date & Time" },
  { value: "select", label: "Drop down menu" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radiobutton" },
  { value: "toggle", label: "Togglebutton" },
];

export const requiresOptions = (type) => ["select", "radio"].includes(type);


