import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldError } from "react-hook-form"; // Type-only import
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  register: any;
  error?: FieldError;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = "text",
  register,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword && !showPassword ? "password" : "text"}
          {...register(id)}
          className={isPassword ? "pr-10" : ""}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};
