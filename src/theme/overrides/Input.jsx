export default function TextField(theme) {
  return {
    MuiTextField: {
      styleOverrides: {
        root: {
          // Styles for the base state of all TextField variants

          "&:hover": {},

          "&.Mui-disabled": {
            "& svg": { color: theme.palette.text.disabled },
          },

          "& .MuiInputBase-input": {
            "&::placeholder": {
              opacity: 1,
              color: theme.palette.text.disabled,
            },
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        // Styles specific to the standard variant
        root: {
          borderRadius: "8px",
          border: "1px solid #d0d7de",
          padding: "8px 12px",
          "&:hover": {
            borderColor: "#0969da",
          },
          "&.Mui-focused": {
            borderColor: "#0969da",
          },
          "&.Mui-disabled": {
            borderColor: theme.palette.grey[300],
          },
        },
        underline: {
          "&:before": {
            borderBottomColor: "transparent", // Hide default underline
          },
          "&:after": {
            borderBottomColor: "transparent", // Hide default underline
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        // Styles specific to the filled variant
        root: {
          backgroundColor: theme.palette.grey[500_12],
          borderRadius: "8px",
          border: "1px solid #d0d7de",
          "&:hover": {
            backgroundColor: theme.palette.grey[500_16],
            borderColor: "#0969da",
          },
          "&.Mui-focused": {
            backgroundColor: theme.palette.action.focus,
            borderColor: "#0969da",
          },
          "&.Mui-disabled": {
            backgroundColor: theme.palette.action.disabledBackground,
            borderColor: theme.palette.grey[300],
          },
        },
        underline: {
          "&:before": {
            borderBottomColor: theme.palette.grey[500_56],
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        // Styles specific to the outlined variant
        root: {
          borderRadius: "8px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d0d7de", // Default border color like login page
            borderRadius: "8px", // Set border radius to 8px
            "&:hover": {
              borderColor: "#0969da", // Hover border color like login page
            },
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0969da", // Focused border color like login page
          },
          "&.Mui-disabled": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#d0d7de", // Disabled border color
              "&:hover": {
                borderColor: "#d0d7de", // Keep disabled border color on hover
              },
            },
          },
        },
      },
    },
  };
}
