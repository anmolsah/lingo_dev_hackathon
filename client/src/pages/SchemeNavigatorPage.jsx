import { useState, useEffect } from "react";
import { SchemeCard } from "../components/SchemeNavigator/SchemeCard";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export function SchemeNavigatorPage() {
  const [schemes, setSchemes] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemes();
  }, [category]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/schemes?category=${category}&lang=en`,
      );
      const data = await response.json();
      setSchemes(data.data || []);
    } catch (error) {
      console.error("Error fetching schemes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Government Schemes</h1>
      <p className="text-gray-600 mb-8">
        Discover government schemes available for you and check your
        eligibility.
      </p>

      <div className="mb-6">
        <label className="mr-2 font-semibold">Filter by category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">All Categories</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="agriculture">Agriculture</option>
          <option value="tribal_welfare">Tribal Welfare</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : schemes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No schemes found for this category.
        </div>
      )}
    </div>
  );
}
