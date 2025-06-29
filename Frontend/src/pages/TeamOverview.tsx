import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, Users } from "lucide-react";
import { authAPI, type Engineer } from "../services/api";

const TeamOverview: React.FC = () => {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [filteredEngineers, setFilteredEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [seniorityFilter, setSeniorityFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  useEffect(() => {
    fetchEngineers();
  }, []);

  useEffect(() => {
    filterEngineers();
  }, [engineers, searchTerm, seniorityFilter, availabilityFilter]);

  const fetchEngineers = async () => {
    try {
      const engineersData = await authAPI.getEngineers();
      setEngineers(engineersData);
    } catch {
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  const filterEngineers = () => {
    let filtered = engineers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (engineer) =>
          engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engineer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          engineer.skills.some((skill) =>
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Seniority filter
    if (seniorityFilter !== "all") {
      filtered = filtered.filter(
        (engineer) => engineer.seniority === seniorityFilter
      );
    }

    // Availability filter
    if (availabilityFilter !== "all") {
      filtered = filtered.filter((engineer) => {
        const utilization =
          (engineer.capacity.totalAllocated / engineer.capacity.maxCapacity) *
          100;
        switch (availabilityFilter) {
          case "available":
            return engineer.capacity.availableCapacity > 0;
          case "overloaded":
            return utilization >= 90;
          case "underutilized":
            return utilization <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredEngineers(filtered);
  };

  const getAvailabilityStatus = (engineer: Engineer) => {
    const utilization =
      (engineer.capacity.totalAllocated / engineer.capacity.maxCapacity) * 100;
    if (utilization >= 90)
      return {
        text: "Overloaded",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
    if (utilization <= 30)
      return {
        text: "Underutilized",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
    if (engineer.capacity.availableCapacity > 0)
      return {
        text: "Available",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    return {
      text: "Fully Allocated",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg text-foreground">Loading team data...</div>
      </div>
    );
  }

  if (engineers.length === 0) {
    return (
      <div className="p-6 space-y-6 bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Team Overview</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">
                No Engineers Found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding engineers to your team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Team Overview</h1>
        {/* <div className="text-sm text-muted-foreground">
          {filteredEngineers.length} of {engineers.length} engineers
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Engineers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engineers.length}</div>
            <p className="text-xs text-muted-foreground ">
              {engineers.filter((e) => e.capacity.availableCapacity > 0).length}{" "}
              available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engineers.filter((e) => e.capacity.availableCapacity > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for new assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            <div className="h-4 w-4 bg-red-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                engineers.filter(
                  (e) =>
                    (e.capacity.totalAllocated / e.capacity.maxCapacity) *
                      100 >=
                    90
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Above 90% capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Utilization
            </CardTitle>
            <div className="h-4 w-4 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engineers.length > 0
                ? Math.round(
                    (engineers.reduce(
                      (sum, e) => sum + e.capacity.totalAllocated,
                      0
                    ) /
                      engineers.reduce(
                        (sum, e) => sum + e.capacity.maxCapacity,
                        0
                      )) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Average capacity usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter engineers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search engineers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={seniorityFilter}
              onChange={(e) => setSeniorityFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Seniority</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Availability</option>
              <option value="available">Available</option>
              <option value="overloaded">Overloaded</option>
              <option value="underutilized">Underutilized</option>
            </select>

            <Button
              onClick={() => {
                setSearchTerm("");
                setSeniorityFilter("all");
                setAvailabilityFilter("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Engineers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Engineers</CardTitle>
          <CardDescription>
            Team members with their current capacity and skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEngineers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No engineers match the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Engineer</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEngineers.map((engineer) => {
                  const availabilityStatus = getAvailabilityStatus(engineer);

                  return (
                    <TableRow key={engineer._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{engineer.name}</div>
                          <div className="text-sm text-gray-500">
                            {engineer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {engineer.skills?.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {engineer.skills && engineer.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{engineer.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {engineer.seniority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{engineer.jobType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              {engineer.capacity.totalAllocated}% allocated
                            </span>
                            <span>
                              {engineer.capacity.availableCapacity}% available
                            </span>
                          </div>
                          <Progress
                            value={engineer.capacity.totalAllocated}
                            max={engineer.capacity.maxCapacity}
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={availabilityStatus.color}>
                          {availabilityStatus.text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamOverview;
