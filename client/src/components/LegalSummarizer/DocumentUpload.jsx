import { useState } from "react";
import { Upload, FileText } from "lucide-react";

export function DocumentUpload({ onSummaryGenerated }) {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a PDF file");
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("document", file);
    formData.append("targetLanguage", language);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/legal/summarize`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      const data = await response.json();
      onSummaryGenerated(data.summary);
    } catch (err) {
      setError(err.message || "Error processing document");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="text-blue-600 hover:text-blue-700 font-semibold">
            Choose a PDF file
          </span>
          <span className="text-gray-500"> or drag and drop</span>
        </label>
        {file && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-700">
            <FileText size={20} />
            <span>{file.name}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block mb-2 font-semibold">
          Translate summary to:
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="input"
        >
          <option value="hi">Hindi (हिंदी)</option>
          <option value="bn">Bengali (বাংলা)</option>
          <option value="te">Telugu (తెలుగు)</option>
          <option value="mr">Marathi (मराठी)</option>
          <option value="ta">Tamil (தமிழ்)</option>
          <option value="kn">Kannada (ಕನ್ನಡ)</option>
          <option value="gu">Gujarati (ગુજરાતી)</option>
          <option value="or">Odia (ଓଡ଼ିଆ)</option>
          <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="btn-primary w-full"
      >
        {loading ? "Processing..." : "Summarize & Translate"}
      </button>
    </form>
  );
}
