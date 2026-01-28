// types/tag.ts
export interface Tag {
  id: number;
  name: string;
  color: string; // hex color code
  user_id: number;
  created_at: string; // ISO date string
  updated_at?: string; // ISO date string
  version: number;
}

export interface TagCreate {
  name: string;
  color?: string; // defaults to #007bff
}

export interface TagUpdate {
  name?: string;
  color?: string;
}