import React, { useState, useEffect } from "react";
import { TextField, Button, FormLabel } from "@mui/material";

const AddItems = () => {
  const [text, setText] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/Items/get-all")
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = { text: text };
    fetch("http://localhost:3001/Items/add-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShowMessage(true);
          setMessage(data.message);
          setIsError(false);
          setItems([...items, { text: text }]);
        } else {
          setShowMessage(true);
          setMessage(data.message);
          setIsError(true);
        }
      })
      .catch((err) => console.log(err));

    setText("");
  };


  return (
    <div>
      <h1>Add Items</h1>
      <form onSubmit={handleSubmit}>
        <FormLabel>
          <TextField
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            label="Item Name"
            variant="outlined"
            fullWidth
          />
        </FormLabel>
        <Button type="submit" variant="contained">
          Add Item
        </Button>
        {showMessage && (
          <p style={{ color: isError ? "red" : "green" }}>{message}</p>
        )}
      </form>
      <ul>
        {items.map((item) => (
          <li key={item._id}>{item.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default AddItems;

