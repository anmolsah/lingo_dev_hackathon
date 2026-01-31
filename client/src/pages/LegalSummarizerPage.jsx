import { useState } from "react";
import { DocumentUpload } from "../components/LegalSummarizer/DocumentUpload";

export function LegalSummarizerPage() {
  const [summary, setSummary] = useState("");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Legal Document Summarizer</h1>
      <p className="text-gray-600 mb-8">
        Upload a legal document and get a plain language summary in your
        preferred language.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Upload Document</h2>
          <DocumentUpload onSummaryGenerated={setSummary} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Summary</h2>
          {summary ? (
            <div className="card bg-gray-50">
              <p className="whitespace-pre-wrap">{summary}</p>
            </div>
          ) : (
            <div className="card bg-gray-50 text-gray-400 text-center py-12">
              Upload a document to see the summary
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
