import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAlert } from "../context/alert";
import { authAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { User, Save, Loader2 } from "lucide-react";

interface ProfileFormData {
  name: string;
  email: string;
  skills: string[];
  seniority: "junior" | "mid" | "senior";
  jobType: "full-time" | "part-time";
}

const EngineerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showAlert } = useAlert();
  const [saving, setSaving] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    email: "",
    skills: [],
    seniority: "junior",
    jobType: "full-time",
  });

  const availableSkills = [
    "React",
    "Node.js",
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "Angular",
    "Vue.js",
    "MongoDB",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "CI/CD",
    "Agile",
    "Scrum",
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        skills: user.skills || [],
        seniority: (user.seniority as "junior" | "mid" | "senior") || "junior",
        jobType: (user.jobType as "full-time" | "part-time") || "full-time",
      });
      setSelectedSkills(user.skills || []);
    }
  }, [user]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSkills.length === 0) {
      showAlert("error", "Please select at least one skill.");
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        ...profileData,
        skills: selectedSkills,
      };

      const response = await authAPI.updateProfile(updatedData);
      showAlert("success", "Profile updated successfully!");

      // Update the user context with new data
      if (updateUser) {
        const updatedUserData = {
          ...user!,
          ...response.user,
        };
        updateUser(updatedUserData);

        // Also update localStorage to keep it in sync
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }
    } catch (error) {
      let errorMessage = "Failed to update profile. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("400")) {
          errorMessage = "Invalid profile data. Please check your inputs.";
        } else if (error.message.includes("401")) {
          errorMessage = "You are not authorized to update your profile.";
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
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6 bg-background p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
          <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Update your personal information and skills
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed. Contact your administrator if needed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seniority">Seniority Level</Label>
                  <select
                    id="seniority"
                    value={profileData.seniority}
                    onChange={(e) =>
                      handleInputChange("seniority", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-level</option>
                    <option value="senior">Senior</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <select
                    id="jobType"
                    value={profileData.jobType}
                    onChange={(e) =>
                      handleInputChange("jobType", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        selectedSkills.includes(skill) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                {selectedSkills.length === 0 && (
                  <p className="text-red-500 text-sm">
                    Please select at least one skill
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={saving || selectedSkills.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center dark:bg-blue-900">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {profileData.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profileData.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Seniority
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {profileData.seniority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Job Type
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {profileData.jobType}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Skills ({selectedSkills.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {selectedSkills.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No skills selected
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-2">Profile Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Keep your skills up to date for better project matching
                </li>
                <li>• Update your seniority level as you gain experience</li>
                <li>• Accurate job type helps with capacity planning</li>
                <li>
                  • Your profile information helps managers make better
                  assignments
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EngineerProfile;
