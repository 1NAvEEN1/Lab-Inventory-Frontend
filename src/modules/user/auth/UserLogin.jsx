import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import UsersService from "../../../services/usersService";
import { setAuth } from "../../../reducers/authSlice";
import { showLoading, hideLoading } from "../../../reducers/loaderSlice";
import { showAlertMessage } from "../../../app/alertMessageController";

const LoginSchema = Yup.object().shape({
  Email: Yup.string().email("Invalid email").required("Required"),
  Password: Yup.string().required("Required"),
});

const UserLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    dispatch(showLoading({ isVisible: true, message: "Signing in..." }));
    try {
      const { data } = await UsersService.login({
        Email: values.Email,
        Password: values.Password,
      });
      console.log(data);
      if (data?.status === "success") {
        const userData = data?.data;
        const accessToken = userData?.accessToken;
        const refreshToken = userData?.refreshToken;
        const user = {
          Id: userData?.Id,
          Email: userData?.Email,
          User_Role: userData?.User_Role,
          First_Name: userData?.First_Name,
          Last_Name: userData?.Last_Name,
          Image: userData?.Image,
        };
        dispatch(setAuth({ accessToken, refreshToken, user }));
        showAlertMessage({ message: "Login successful", type: "success" });
        navigate(from, { replace: true });
      } else if (data?.status === "error") throw new Error(data?.error);
    } catch (err) {
      showAlertMessage({
        message: err?.message || "Login failed",
        type: "error",
      });
    } finally {
      dispatch(hideLoading());
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: 380 }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
          Login
        </Typography>

        <Formik
          initialValues={{ Email: "", Password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form noValidate>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Email
                  </Typography>
                  <TextField
                    name="Email"
                    type="email"
                    value={values.Email}
                    size="small"
                    onChange={(e) => setFieldValue("Email", e.target.value)}
                    fullWidth
                    variant="outlined"
                    error={touched.Email && Boolean(errors.Email)}
                    helperText={touched.Email && errors.Email}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#d0d7de",
                          borderRadius: "8px",
                        },
                        "&:hover fieldset": {
                          borderColor: "#0969da",
                          borderRadius: "8px",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#0969da",
                          borderRadius: "8px",
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    Password
                  </Typography>
                  <FormControl fullWidth variant="outlined">
                    <OutlinedInput
                      name="Password"
                      type={showPassword ? "text" : "password"}
                      value={values.Password}
                      size="small"
                      onChange={(e) =>
                        setFieldValue("Password", e.target.value)
                      }
                      error={touched.Password && Boolean(errors.Password)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#d0d7de",
                          borderRadius: "8px",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#0969da",
                          borderRadius: "8px",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#0969da",
                          borderRadius: "8px",
                        },
                      }}
                    />
                    {touched.Password && errors.Password && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 1.5 }}
                      >
                        {errors.Password}
                      </Typography>
                    )}
                  </FormControl>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ mt: 2 }}
                >
                  Sign In
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default UserLogin;
