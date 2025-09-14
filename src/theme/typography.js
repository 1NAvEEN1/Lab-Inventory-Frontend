import { pxToRem, responsiveFontSizes } from "../utils/getFontValue";

// ----------------------------------------------------------------------

// const FONT_PRIMARY = "Public Sans, sans-serif"; // Google Font
// const FONT_SECONDARY = 'CircularStd, sans-serif'; // Local Font

const typography = {
  fontFamily: ["Inter"].join(","),
  fontSize: 12,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: {
    fontWeight: 700,
    lineHeight: 80 / 64,
    fontSize: pxToRem(37),
    letterSpacing: 2,
    ...responsiveFontSizes({ sm: 48, md: 54, lg: 59 }),
  },
  h2: {
    fontWeight: 700,
    lineHeight: 64 / 48,
    fontSize: pxToRem(30),
    ...responsiveFontSizes({ sm: 37, md: 41, lg: 45 }),
  },
  h3: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(22),
    ...responsiveFontSizes({ sm: 24, md: 28, lg: 30 }),
  },
  h4: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(19),
    ...responsiveFontSizes({ sm: 19, md: 22, lg: 22 }),
  },
  h5: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(17),
    ...responsiveFontSizes({ sm: 18, md: 19, lg: 19 }),
  },
  h6: {
    fontWeight: 700,
    lineHeight: 28 / 18,
    fontSize: pxToRem(16),
    ...responsiveFontSizes({ sm: 17, md: 17, lg: 17 }),
  },
  subtitle1: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(15),
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 22 / 14,
    fontSize: pxToRem(13),
  },
  body1: {
    lineHeight: 1.5,
    fontSize: pxToRem(13), // Changed Here
  },
  body2: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(13),
  },
  smallText: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(10),
  },
  caption: {
    lineHeight: 1.5,
    fontSize: pxToRem(11),
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(11),
    textTransform: "uppercase",
  },
  button: {
    fontWeight: 700,
    lineHeight: 24 / 14,
    fontSize: pxToRem(13),
    textTransform: "capitalize",
  },
};

export default typography;
