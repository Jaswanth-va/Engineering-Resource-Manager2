import React from "react";
import { useNavigate } from "react-router-dom";
import CreateProjectForm from "../components/CreateProjectForm";
import { useAlert } from "../context/alert";
import { projectsAPI, type ProjectData } from "../services/api";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleSubmit = async (data: ProjectData) => {
    try {
      await projectsAPI.create(data);
      showAlert("success", "Project created successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      let errorMessage = "Failed to create project. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Invalid project data. Please check your inputs.";
        } else if (error.message.includes("401")) {
          errorMessage = "You are not authorized to create projects.";
        } else if (error.message.includes("409")) {
          errorMessage = "A project with this name already exists.";
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
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="space-y-6 bg-background">
      <div className="p-6">
        <CreateProjectForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CreateProject;
