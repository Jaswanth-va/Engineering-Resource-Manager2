import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../context/alert";
import { projectsAPI, type Project } from "../services/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Plus, Trash2, Calendar, Loader2 } from "lucide-react";

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  // const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const projectsData = await projectsAPI.getAll();
      setProjects(projectsData);
    } catch {
      showAlert("error", "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  // const handleStatusUpdate = async (projectId: string, newStatus: string) => {
  //   setUpdatingStatus(projectId);
  //   try {
  //     await projectsAPI.updateStatus(projectId, newStatus);

  //     // Update local state
  //     setProjects((prev) =>
  //       prev.map((project) =>
  //         project._id === projectId
  //           ? { ...project, status: newStatus }
  //           : project
  //       )
  //     );

  //     showAlert("success", `Project status updated to ${newStatus}`);
  //   } catch (error) {
  //     let errorMessage = "Failed to update project status. Please try again.";

  //     if (error instanceof Error) {
  //       if (error.message.includes("400")) {
  //         errorMessage =
  //           "Cannot complete project while there are active assignments. Please complete all assignments first.";
  //       } else if (error.message.includes("401")) {
  //         errorMessage = "You are not authorized to update this project.";
  //       } else if (error.message.includes("404")) {
  //         errorMessage = "Project not found.";
  //       } else if (
  //         error.message.includes("Network") ||
  //         error.message.includes("fetch")
  //       ) {
  //         errorMessage =
  //           "Unable to connect to the server. Please check your internet connection.";
  //       } else if (error.message.includes("500")) {
  //         errorMessage = "Server error. Please try again later.";
  //       } else if (error.message) {
  //         errorMessage = error.message;
  //       }
  //     }

  //     showAlert("error", errorMessage);
  //   } finally {
  //     setUpdatingStatus(null);
  //   }
  // };

  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${projectName}"? This will also delete all related assignments.`
      )
    ) {
      return;
    }

    setDeletingProject(projectId);
    try {
      await projectsAPI.delete(projectId);
      showAlert("success", `Project "${projectName}" deleted successfully.`);
      fetchProjects(); // Refresh the list
    } catch (error) {
      let errorMessage = "Failed to delete project.";

      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "You are not authorized to delete this project.";
        } else if (error.message.includes("404")) {
          errorMessage = "Project not found.";
        } else if (
          error.message.includes("Network") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Unable to connect to the server. Please check your internet connection.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      showAlert("error", errorMessage);
    } finally {
      setDeletingProject(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          {/* <p className="text-muted-foreground mt-1">
            Manage and view all projects in the system
          </p> */}
        </div>
        <Button
          onClick={() => navigate("/create-project")}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900">
                <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.filter((p) => p.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Planning
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.filter((p) => p.status === "planning").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gray-100 rounded-lg dark:bg-gray-900">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {projects.filter((p) => p.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No projects found
              </h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first project.
              </p>
              <Button
                onClick={() => navigate("/create-project")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Required Skills</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {project.name}
                        </div>
                        {/* <div className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </div> */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(project.startDate)}</TableCell>
                    <TableCell>{formatDate(project.endDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.requiredSkills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {project.requiredSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.requiredSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2 justify-center">
                        {/* <select
                          value={project.status}
                          onChange={(e) =>
                            handleStatusUpdate(project._id, e.target.value)
                          }
                          disabled={updatingStatus === project._id}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          <option value="planning">Planning</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                        </select> */}
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/project/${project._id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button> */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteProject(project._id, project.name)
                          }
                          disabled={deletingProject === project._id}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          {deletingProject === project._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
