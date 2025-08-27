import { Activity, Note, Project } from "../models/types";
export class AppService {
  private static API_URL = import.meta.env[
    import.meta.env.DEV ? "VITE_API_URL_LOCAL" : "VITE_API_URL"
  ];
  private static CENTRAL_API_KEY = import.meta.env.VITE_CENTRAL_API_KEY;

  public static projects: Project[] = [
    {
      id: "1",
      name: "Project Alpha",
      date: "24 avril 2024",
      type: "folder",
      iconColor: "bg-blue-500",
      progress: 75,
    },
    {
      id: "2",
      name: "Research Study",
      date: "22 avril 2024",
      type: "chart",
      iconColor: "bg-orange-500",
      fileCount: 8,
    },
    {
      id: "3",
      name: "Client Proposal",
      date: "20 avril 2024",
      type: "document",
      iconColor: "bg-teal-500",
    },
    {
      id: "4",
      name: "Marketing Campaign",
      date: "15 avril 2024",
      type: "megaphone",
      iconColor: "bg-teal-500",
    },
    {
      id: "5",
      name: "Agrenain Faw",
      date: "10 avril 2024",
      type: "list",
      iconColor: "bg-orange-500",
    },
  ];

  public static activities: Activity[] = [
    {
      id: "1",
      user: "Juliette Leclerc",
      action: "a ajouté un document",
      time: "11:17",
      avatar: "👩‍💼",
      type: "document",
    },
    {
      id: "2",
      user: "Vitor Pareira",
      action: "a complété une tâche",
      time: "08:42",
      avatar: "👨‍💻",
      type: "task",
    },
    {
      id: "3",
      user: "Alice Durand",
      action: "a ajouté une note",
      time: "Avr 22",
      avatar: "👩‍🎨",
      type: "note",
    },
    {
      id: "4",
      user: "Antoine Laurent",
      action: "a téléchargé un fichier",
      time: "Avr 22",
      avatar: "👨‍🔬",
      type: "file",
    },
  ];

  public static notes: Note[] = [
    {
      id: "1",
      title: "Memo",
      content: "Discuter des prochaines étapes lors de la réunion d'équipe",
    },
    {
      id: "2",
      title: "Surd : Here-applignée",
      content: "ak poonte",
    },
  ];

  public static keyPoints = [
    "Implémentation d'une solution primaire, gestion des coûts",
    "Surveillance des équipements structurés dans un environnement unifié",
    "Assurer des solutions efficaces basées sur une construction équitable",
    "Fournir une gestion des processus client et de transport",
  ];

  public static getAllProjects(): Project[] {
    return this.projects;
  }

  public static async getProjectById(id: string) {
    return this.projects.find((project) => project.id === id);
  }

  public static getAllActivities() {
    return this.activities;
  }

  public static getAllNotes() {
    return this.notes;
  }

  public static getKeyPoints() {
    return this.keyPoints;
  }

  public static createProject(project: Omit<Project, "id">): Project {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
    };
    this.projects.unshift(newProject);
    return newProject;
  }

  public static updateProject(
    id: string,
    updates: Partial<Project>
  ): Project | null {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.projects[index] = { ...this.projects[index], ...updates };
    return this.projects[index];
  }

  public static deleteProject(id: string): boolean {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.projects.splice(index, 1);
    return true;
  }
}
