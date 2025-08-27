import { AppService } from "../../services/app.service";
import ProjectListView from "./components/ProjectListView";

export default function Dashboard() {
  return (
    <>
      <ProjectListView
        projects={AppService.projects}
        onProjectClick={(project) => console.log(project)}
      />
    </>
  );
}
