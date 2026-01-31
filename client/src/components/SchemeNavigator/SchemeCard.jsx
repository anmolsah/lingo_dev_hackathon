import { ExternalLink, CheckCircle } from "lucide-react";

export function SchemeCard({ scheme }) {
  // Handle both array and object formats for translations
  const translation = Array.isArray(scheme.scheme_translations)
    ? scheme.scheme_translations[0] || {}
    : scheme.scheme_translations || {};

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold">
          {translation.title || scheme.scheme_code}
        </h3>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {scheme.category}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">
        {translation.description ||
          translation.short_description ||
          "No description available"}
      </p>

      {(translation.eligibility_criteria || translation.eligibility) && (
        <div className="mb-4 text-sm">
          <div className="font-semibold mb-1 flex items-center gap-1">
            <CheckCircle size={16} className="text-green-600" />
            Eligibility:
          </div>
          <p className="text-gray-600 line-clamp-2">
            {translation.eligibility_criteria || translation.eligibility}
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button className="btn-primary flex-1 text-sm">View Details</button>
        <button className="btn-secondary flex-1 text-sm">
          Check Eligibility
        </button>
      </div>

      {scheme.ministry && (
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
          <ExternalLink size={12} />
          {scheme.ministry}
        </div>
      )}
    </div>
  );
}
