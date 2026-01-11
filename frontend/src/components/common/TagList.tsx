import React from 'react';
import { 
  Box, 
  Chip,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

interface Tag {
  id: number;
  name: string;
  color?: string;
}

interface TagListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (id: number) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, onEdit, onDelete }) => {
  if (tags.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No tags available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {tags.map((tag) => (
        <Chip
          key={tag.id}
          label={tag.name}
          sx={{ 
            backgroundColor: tag.color || 'default',
            color: tag.color ? 'white' : 'inherit'
          }}
          onDelete={() => onDelete(tag.id)}
          onClick={() => onEdit(tag)}
          variant="outlined"
        />
      ))}
    </Box>
  );
};

export default TagList;