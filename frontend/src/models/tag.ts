export interface Tag {
  id: string;
  name: string; // tag name, unique per user
  color: string; // hex color code from accessible palette
  userId: string; // owner identifier
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}