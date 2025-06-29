import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAlert } from "../context/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Calendar,
  Clock,
  TrendingUp,
  User,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { dashboardAPI, assignmentsAPI, type Assignment } from "../services/api";

const EngineerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const assignmentsData = await dashboardAPI.getEngineerDashboard();
      setAssignments(assignmentsData);
    } catch {
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    assignmentId: string,
    newStatus: string
  ) => {
    setUpdatingStatus(assignmentId);
    try {
      await assignmentsAPI.update(assignmentId, { status: newStatus });

      // Update local state
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment._id === assignmentId
            ? { ...assignment, status: newStatus }
            : assignment
        )
      );

      showAlert("success", `Assignment status updated to ${newStatus}`);
    } catch (error) {
      let errorMessage =
        "Failed to update assignment status. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Invalid status update request.";
        } else if (error.message.includes("401")) {
          errorMessage = "You are not authorized to update this assignment.";
        } else if (error.message.includes("404")) {
          errorMessage = "Assignment not found.";
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
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const totalAllocated = assignments.reduce((sum, assignment) => {
    return assignment.status === "active"
      ? sum + assignment.allocationPercentage
      : sum;
  }, 0);

  const maxCapacity = user?.jobType === "part-time" ? 50 : 100;
  const availableCapacity = Math.max(0, maxCapacity - totalAllocated);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        {/* <div className="text-sm text-muted-foreground">Welcome back, {user?.name}!</div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxCapacity}%</div>
            <p className="text-xs text-muted-foreground">
              {user?.jobType} position
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated}%</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCapacity}%</div>
            <p className="text-xs text-muted-foreground">
              Ready for new assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter((a) => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {assignments.length} total assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Overview */}
      <Card>
        <CardHeader>
          <CardTitle>My Capacity Overview</CardTitle>
          <CardDescription>Current allocation and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Allocated: {totalAllocated}%</span>
              <span>Available: {availableCapacity}%</span>
            </div>
            <Progress
              value={totalAllocated}
              max={maxCapacity}
              className="h-4"
            />
            <div className="text-sm text-muted-foreground">
              {availableCapacity > 0
                ? `You have ${availableCapacity}% capacity available for new assignments.`
                : "You are fully allocated. Contact your manager if you need capacity adjustments."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Skills */}
      <Card>
        <CardHeader>
          <CardTitle>My Skills</CardTitle>
          <CardDescription>Technologies and expertise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user?.skills?.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              <strong>Seniority:</strong> {user?.seniority}
            </p>
            <p>
              <strong>Employment Type:</strong> {user?.jobType}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>My Assignments</CardTitle>
          <CardDescription>
            Current and upcoming project assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No assignments found. Contact your manager for project
              assignments.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Project Status</TableHead>
                  <TableHead>Allocation</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Assignment Status</TableHead>
                  <TableHead>Assigned By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {assignment.projectId.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.projectId.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getProjectStatusColor(
                          assignment.projectId.status || "planning"
                        )}
                      >
                        {assignment.projectId.status || "planning"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {assignment.allocationPercentage}%
                        </span>
                        <Progress
                          value={assignment.allocationPercentage}
                          max={100}
                          className="w-20 h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          From:{" "}
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          To:{" "}
                          {new Date(assignment.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      {assignment.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2"
                          onClick={() =>
                            handleStatusUpdate(assignment._id, "completed")
                          }
                          disabled={updatingStatus === assignment._id}
                        >
                          {updatingStatus === assignment._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Complete
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {assignment.assignedBy?.name || "Unknown"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Project Skills Match */}
      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills Alignment</CardTitle>
            <CardDescription>
              How your skills match current project requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const mySkills = user?.skills || [];
                const requiredSkills =
                  assignment.projectId.requiredSkills || [];
                const matchedSkills = mySkills.filter((skill) =>
                  requiredSkills.includes(skill)
                );
                const matchPercentage =
                  requiredSkills.length > 0
                    ? Math.round(
                        (matchedSkills.length / requiredSkills.length) * 100
                      )
                    : 0;

                return (
                  <div key={assignment._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {assignment.projectId.name}
                      </h4>
                      <Badge
                        variant={
                          matchPercentage >= 80
                            ? "default"
                            : matchPercentage >= 60
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {matchPercentage}% match
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">
                          Required Skills:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {requiredSkills.map((skill) => (
                            <Badge
                              key={skill}
                              variant={
                                mySkills.includes(skill) ? "default" : "outline"
                              }
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {matchPercentage < 100 && (
                        <div className="text-sm text-yellow-600">
                          Consider updating your skills to better match project
                          requirements.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EngineerDashboard;
