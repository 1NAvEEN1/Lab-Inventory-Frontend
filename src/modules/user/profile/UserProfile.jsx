import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  Grid,
  TextField,
  Divider,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { showAlertMessage } from "../../../app/alertMessageController";
import { setAuth } from "../../../reducers/authSlice";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [formData, setFormData] = useState({
    First_Name: user?.First_Name || "",
    Last_Name: user?.Last_Name || "",
    Email: user?.Email || "",
    User_Role: user?.User_Role || 0,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      First_Name: user?.First_Name || "",
      Last_Name: user?.Last_Name || "",
      Email: user?.Email || "",
      User_Role: user?.User_Role || 0,
    });
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    // For now, we'll just update the local state
    const updatedUser = { ...user, ...formData };
    dispatch(setAuth({ 
      accessToken: useSelector((state) => state.auth.accessToken),
      refreshToken: useSelector((state) => state.auth.refreshToken),
      user: updatedUser 
    }));
    
    setIsEditing(false);
    showAlertMessage({ 
      message: "Profile updated successfully", 
      type: "success" 
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const getRoleText = (role) => {
    switch (role) {
      case 0:
        return "Admin";
      case 1:
        return "Manager";
      case 2:
        return "User";
      default:
        return "Unknown";
    }
  };

  const getInitials = () => {
    const firstName = user?.First_Name || "";
    const lastName = user?.Last_Name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Picture and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", p: 3 }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "#e6f1fd",
                    fontSize: "2.5rem",
                    fontWeight: 600,
                    mb: 2,
                    border: "4px solid #fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  {getInitials()}
                </Avatar>
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                  size="small"
                  onClick={() => setOpenImageDialog(true)}
                >
                  <ImageIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {user?.First_Name} {user?.Last_Name}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mb: 2 }}
              >
                {getRoleText(user?.User_Role)}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                disabled={isEditing}
                sx={{ borderRadius: 2 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Personal Information
                </Typography>
                {isEditing && (
                  <Box>
                    <IconButton
                      color="success"
                      onClick={handleSave}
                      sx={{ mr: 1 }}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={handleCancel}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      First Name
                    </Typography>
                  </Box>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={formData.First_Name}
                      onChange={handleInputChange("First_Name")}
                      variant="outlined"
                      size="small"
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
                  ) : (
                    <Typography variant="body1" sx={{ pl: 4 }}>
                      {user?.First_Name || "Not provided"}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Last Name
                    </Typography>
                  </Box>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={formData.Last_Name}
                      onChange={handleInputChange("Last_Name")}
                      variant="outlined"
                      size="small"
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
                  ) : (
                    <Typography variant="body1" sx={{ pl: 4 }}>
                      {user?.Last_Name || "Not provided"}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Email Address
                    </Typography>
                  </Box>
                  {isEditing ? (
                    <TextField
                      fullWidth
                      value={formData.Email}
                      onChange={handleInputChange("Email")}
                      variant="outlined"
                      size="small"
                      type="email"
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
                  ) : (
                    <Typography variant="body1" sx={{ pl: 4 }}>
                      {user?.Email || "Not provided"}
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <BadgeIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Role
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ pl: 4 }}>
                    {getRoleText(user?.User_Role)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Upload Dialog */}
      <Dialog open={openImageDialog} onClose={() => setOpenImageDialog(false)}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Profile picture upload functionality will be implemented here.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            This feature will allow you to upload and update your profile picture.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImageDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
