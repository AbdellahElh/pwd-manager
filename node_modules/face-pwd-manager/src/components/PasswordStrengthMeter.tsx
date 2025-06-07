// src/components/PasswordStrengthMeter.tsx
import React, { useMemo } from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

/**
 * PasswordStrengthMeter provides visual feedback on password strength
 */
const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
}) => {
  /**
   * Calculate password strength score (0-100)
   * - Length: 0-40 points (8 chars = 20, 16+ chars = 40)
   * - Complexity: 0-60 points
   *   - Has lowercase: 10 points
   *   - Has uppercase: 10 points
   *   - Has number: 10 points
   *   - Has symbol: 10 points
   *   - Has 3+ numbers: 10 points
   *   - Has 2+ symbols: 10 points
   */
  const { score, feedback } = useMemo(() => {
    // Start with 0 points
    let score = 0;

    // No score for empty passwords
    if (!password) {
      return { score: 0, feedback: "Enter a password" };
    }

    // Score for length (max 40 points)
    const length = password.length;
    if (length >= 16) {
      score += 40;
    } else if (length >= 12) {
      score += 30;
    } else if (length >= 8) {
      score += 20;
    } else if (length >= 6) {
      score += 10;
    }

    // Score for complexity (max 60 points)
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    const numberCount = (password.match(/[0-9]/g) || []).length;
    const symbolCount = (password.match(/[^A-Za-z0-9]/g) || []).length;

    if (hasLowercase) score += 10;
    if (hasUppercase) score += 10;
    if (hasNumbers) score += 10;
    if (hasSymbols) score += 10;
    if (numberCount >= 3) score += 10;
    if (symbolCount >= 2) score += 10;

    // Provide feedback based on score
    let feedback = "";
    if (score >= 90) {
      feedback = "Excellent password!";
    } else if (score >= 70) {
      feedback = "Strong password";
    } else if (score >= 50) {
      feedback = "Good password";
    } else if (score >= 30) {
      feedback = "Moderate password";
    } else {
      feedback = "Weak password";
    }

    // Add specific suggestions for improvement
    const suggestions = [];
    if (!hasLowercase) suggestions.push("Add lowercase letters");
    if (!hasUppercase) suggestions.push("Add uppercase letters");
    if (!hasNumbers) suggestions.push("Add numbers");
    if (!hasSymbols) suggestions.push("Add symbols");
    if (length < 12) suggestions.push("Make it longer");

    if (suggestions.length > 0) {
      feedback += ": " + suggestions.join(", ");
    }

    return { score, feedback };
  }, [password]);

  // Determine color based on score
  const getColorClass = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColorClass()} transition-all duration-300`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className="text-sm mt-1 text-gray-400">{feedback}</p>
    </div>
  );
};

export default PasswordStrengthMeter;