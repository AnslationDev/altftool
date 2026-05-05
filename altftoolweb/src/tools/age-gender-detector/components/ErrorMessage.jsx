import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex gap-3">
      <AlertCircle className="text-red-600" />
      <p className="text-red-700">{message}</p>
    </div>
  );
}