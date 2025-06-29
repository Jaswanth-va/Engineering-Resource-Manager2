import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Engineer, Project } from "../services/api";

interface AssignmentFormData {
  projectId: string;
  engineerId: string;
  startDate: string;
  endDate: string;
  allocationPercentage: number;
}

interface CreateAssignmentFormProps {
  projects: Project[];
  engineers: Engineer[];
  onSubmit: (data: AssignmentFormData) => void;
  onCancel: () => void;
}

const CreateAssignmentForm: React.FC<CreateAssignmentFormProps> = ({
  projects,
  engineers,
  onSubmit,
  onCancel,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(
    null
  );
  const [allocationPercentage, setAllocationPercentage] = useState<number>(0);

  const assignmentSchema = z
    .object({
      projectId: z.string().min(1, "Project is required"),
      engineerId: z.string().min(1, "Engineer is required"),
      allocationPercentage: z
        .number()
        .min(1, "Allocation percentage must be at least 1%")
        .max(100, "Allocation percentage cannot exceed 100%"),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
    })
    .refine(
      (data) => {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate > startDate;
      },
      {
        message: "End date must be after start date",
        path: ["endDate"],
      }
    )
    .refine(
      (data) => {
        if (!selectedProject) return true;
        const assignmentStart = new Date(data.startDate);
        const assignmentEnd = new Date(data.endDate);
        const projectStart = new Date(selectedProject.startDate);
        const projectEnd = new Date(selectedProject.endDate);

        return assignmentStart >= projectStart && assignmentEnd <= projectEnd;
      },
      {
        message: "Assignment dates must fall within the project timeline",
        path: ["startDate"],
      }
    );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
  });

  const watchedStartDate = watch("startDate");
  const watchedAllocation = watch("allocationPercentage");

  // Filter engineers based on selected project's required skills
  const filteredEngineers = selectedProject
    ? engineers.filter((engineer) =>
        selectedProject.requiredSkills.some((skill) =>
          engineer.skills.includes(skill)
        )
      )
    : [];

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p._id === projectId);
    setSelectedProject(project || null);
    setSelectedEngineer(null);
    setValue("projectId", projectId);
    setValue("engineerId", "");
    setValue("startDate", "");
    setValue("endDate", "");
  };

  const handleEngineerChange = (engineerId: string) => {
    const engineer = engineers.find((e) => e._id === engineerId);
    setSelectedEngineer(engineer || null);
    setValue("engineerId", engineerId);
  };

  const incrementAllocation = () => {
    setAllocationPercentage((prev) => Math.min(prev + 5, 100));
  };

  const decrementAllocation = () => {
    setAllocationPercentage((prev) => Math.max(prev - 5, 0));
  };

  const handleFormSubmit = async (data: AssignmentFormData) => {
    const assignmentData = {
      ...data,
      allocationPercentage,
    };
    await onSubmit(assignmentData);
  };

  // Update form values when state changes
  useEffect(() => {
    setValue("allocationPercentage", allocationPercentage);
  }, [allocationPercentage, setValue]);

  const getSkillMatchPercentage = () => {
    if (!selectedEngineer || !selectedProject) return 0;

    const projectSkills = selectedProject.requiredSkills || [];
    const engineerSkills = selectedEngineer.skills || [];
    const matchedSkills = engineerSkills.filter((skill) =>
      projectSkills.includes(skill)
    );

    return projectSkills.length > 0
      ? Math.round((matchedSkills.length / projectSkills.length) * 100)
      : 0;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-foreground">
        Create New Assignment
      </h1>

      <Card className="w-full mx-auto">
        <CardContent>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="pt-10 space-y-6"
          >
            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectId && (
                <p className="text-red-500 text-sm">
                  {errors.projectId.message}
                </p>
              )}
            </div>

            {/* Project Details */}
            {selectedProject && (
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-foreground">
                        {selectedProject.name}
                      </h4>
                      <Badge variant="outline">{selectedProject.status}</Badge>
                    </div>
                    {selectedProject.status === "completed" && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Note:</strong> This project is currently
                          completed. Creating a new assignment will reactivate
                          the project status to "active".
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description}
                    </p>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Required Skills:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProject.requiredSkills?.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        Project Period:{" "}
                        {new Date(
                          selectedProject.startDate
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(selectedProject.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Engineer Selection */}
            <div className="space-y-2">
              <Label htmlFor="engineer">Engineer</Label>
              <Select
                onValueChange={handleEngineerChange}
                disabled={!selectedProject}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedProject
                        ? `Select an engineer (${filteredEngineers.length} matching skills)`
                        : "Select a project first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredEngineers.map((engineer) => (
                    <SelectItem key={engineer._id} value={engineer._id}>
                      {engineer.name} - {engineer.seniority} ({engineer.jobType}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.engineerId && (
                <p className="text-red-500 text-sm">
                  {errors.engineerId.message}
                </p>
              )}
              {selectedProject && filteredEngineers.length === 0 && (
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                  No engineers found with matching skills for this project.
                </p>
              )}
            </div>

            {/* Engineer Details */}
            {selectedEngineer && (
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-foreground">
                        {selectedEngineer.name}
                      </h4>
                      <Badge variant="outline">
                        {selectedEngineer.seniority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Email: {selectedEngineer.email}</p>
                      <p>Job Type: {selectedEngineer.jobType}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          Available Capacity:{" "}
                          {selectedEngineer.capacity.availableCapacity}%
                        </span>
                        <span>
                          Max Capacity: {selectedEngineer.capacity.maxCapacity}%
                        </span>
                      </div>
                      <Progress
                        value={selectedEngineer.capacity.totalAllocated}
                        max={selectedEngineer.capacity.maxCapacity}
                        className="h-2"
                      />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        Skills:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedEngineer.skills?.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  type="date"
                  id="startDate"
                  min={selectedProject?.startDate}
                  max={selectedProject?.endDate}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  {...register("endDate", { required: "End date is required" })}
                  type="date"
                  id="endDate"
                  min={watchedStartDate || selectedProject?.startDate}
                  max={selectedProject?.endDate}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Allocation Percentage */}
            <div className="space-y-2">
              <Label htmlFor="allocationPercentage">
                Allocation Percentage
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={decrementAllocation}
                  className="w-10 h-10"
                >
                  -
                </Button>
                <Input
                  {...register("allocationPercentage", {
                    required: "Allocation percentage is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Allocation percentage must be at least 1%",
                    },
                    max: {
                      value: 100,
                      message: "Allocation percentage cannot exceed 100%",
                    },
                  })}
                  type="number"
                  min="1"
                  max="100"
                  value={allocationPercentage || ""}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setAllocationPercentage(value);
                  }}
                  className="w-24 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={incrementAllocation}
                  className="w-10 h-10"
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              {errors.allocationPercentage && (
                <p className="text-red-500 text-sm">
                  {errors.allocationPercentage.message}
                </p>
              )}
              {selectedEngineer && !isNaN(watchedAllocation) && (
                <div className="text-sm text-muted-foreground">
                  {watchedAllocation >
                  selectedEngineer.capacity.availableCapacity ? (
                    <span className="text-red-600">
                      Warning: Allocation exceeds available capacity by{" "}
                      {watchedAllocation -
                        selectedEngineer.capacity.availableCapacity}
                      %
                    </span>
                  ) : (
                    <span className="text-green-600">
                      Available capacity after assignment:{" "}
                      {selectedEngineer.capacity.availableCapacity -
                        watchedAllocation}
                      %
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Skills Match */}
            {selectedEngineer && selectedProject && (
              <div className="space-y-2">
                <Label>Skills Match</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${getSkillMatchPercentage()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {getSkillMatchPercentage()}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getSkillMatchPercentage() >= 80
                    ? "Excellent skills match!"
                    : getSkillMatchPercentage() >= 60
                    ? "Good skills match"
                    : "Limited skills match - consider training or different assignment"}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedEngineer}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                Create Assignment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAssignmentForm;
