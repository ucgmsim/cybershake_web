import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

const API_BASE = 'http://localhost:10000'; // Adjust if needed

function App() {
  const [fruits, setFruits] = useState([]);
  const [newFruit, setNewFruit] = useState('');
  const [editFruit, setEditFruit] = useState(null);
  const [editName, setEditName] = useState('');

  const fetchFruits = async () => {
    const res = await axios.get(`${API_BASE}/fruits`);
    setFruits(res.data);
  };

  const addFruit = async () => {
    if (!newFruit) return;
    await axios.post(`${API_BASE}/fruits`, { fruit_name: newFruit });
    setNewFruit('');
    fetchFruits();
  };

  const updateFruit = async () => {
    if (!editFruit || !editName) return;
    await axios.put(`${API_BASE}/fruits/update/`, { fruit: editName });
    setEditFruit(null);
    setEditName('');
    fetchFruits();
  };

  const deleteFruit = async (id) => {
    await axios.delete(`${API_BASE}/fruits/delete`);
    fetchFruits();
  };

  const startEditing = (fruit) => {
    setEditFruit(fruit.id);
    setEditName(fruit.fruit);
  };

  useEffect(() => {
    fetchFruits();
  }, []);

  return (
      <Container maxWidth="sm">
        <Typography variant="h4" align="center" gutterBottom>
          Fruit Manager
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <TextField
              label="New Fruit"
              value={newFruit}
              onChange={(e) => setNewFruit(e.target.value)}
              fullWidth
          />
          <Button variant="contained" color="primary" onClick={addFruit}>
            Add
          </Button>
        </Box>

        {editFruit && (
            <Box display="flex" gap={2} mb={2}>
              <TextField
                  label="Edit Fruit"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  fullWidth
              />
              <Button variant="contained" color="secondary" onClick={updateFruit}>
                Update
              </Button>
            </Box>
        )}

        <List>
          {fruits.map((fruit) => (
              <ListItem key={fruit.id} divider>
                <ListItemText primary={fruit.fruit} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => startEditing(fruit)}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" color="error" onClick={() => deleteFruit(fruit.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
          ))}
        </List>
      </Container>
  );
}

export default App;
