import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateAssignmentForm from "../components/CreateAssignmentForm";
import { useAlert } from "../context/alert";
import {
  assignmentsAPI,
  projectsAPI,
  authAPI,
  type Project,
  type Engineer,
} from "../services/api";

interface AssignmentFormData {
  projectId: string;
  engineerId: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [projects, setProjects] = useState<Project[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, engineersData] = await Promise.all([
          projectsAPI.getAll(),
          authAPI.getEngineers(),
        ]);

        setProjects(projectsData);
        setEngineers(engineersData);
      } catch {
        showAlert("error", "Failed to load projects and engineers data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showAlert]);

  const handleSubmit = async (data: AssignmentFormData) => {
    try {
      await assignmentsAPI.create(data);
      showAlert("success", "Assignment created successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: unknown) {
      let errorMessage = "Failed to create assignment. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Invalid assignment data. Please check your inputs.";
        } else if (error.message.includes("401")) {
          errorMessage = "You are not authorized to create assignments.";
        } else if (error.message.includes("409")) {
          errorMessage = "Assignment conflicts with existing schedule.";
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background">
      <div className="p-6">
        <CreateAssignmentForm
          projects={projects}
          engineers={engineers}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default CreateAssignment;
