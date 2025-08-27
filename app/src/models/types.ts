export interface Project {
  id: string;
  name: string;
  date: string;
  type: "folder" | "chart" | "document" | "megaphone" | "list";
  iconColor: string;
  fileCount?: number;
  progress?: number;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
  type: "document" | "task" | "note" | "file";
}

export interface Note {
  id: string;
  title: string;
  content: string;
}
