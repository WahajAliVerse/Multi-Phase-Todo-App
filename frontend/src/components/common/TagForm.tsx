import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Typography 
} from '@mui/material';

interface TagFormProps {
  tag?: {
    id?: number;
    name: string;
    color?: string;
  };
  onSubmit: (tag: { name: string; color?: string }) => void;
  onCancel?: () => void;
}

const TagForm: React.FC<TagFormProps> = ({ tag, onSubmit, onCancel }) => {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      alert('Tag name is required');
      return;
    }
    
    if (name.length < 1 || name.length > 50) {
      alert('Tag name must be between 1 and 50 characters');
      return;
    }
    
    onSubmit({
      name,
      color: color || undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {tag?.id ? 'Edit Tag' : 'Create New Tag'}
      </Typography>
      
      <TextField
        fullWidth
        label="Tag Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        required
        inputProps={{ maxLength: 50 }}
        helperText="Tag name must be between 1 and 50 characters"
      />
      
      <TextField
        fullWidth
        label="Color (hex code)"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        margin="normal"
        placeholder="#FF0000"
        helperText="Optional color code for the tag (e.g., #FF0000)"
      />
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" color="primary">
          {tag?.id ? 'Update Tag' : 'Create Tag'}
        </Button>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TagForm;