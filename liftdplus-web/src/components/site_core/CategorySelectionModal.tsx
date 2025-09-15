import React, { useState } from "react";
import { HiX, HiCheck } from "react-icons/hi";
import { AVAILABLE_TAGS } from "@/utils/tagMapper";

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  postTitle: string;
  isLoading?: boolean;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  postTitle,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = AVAILABLE_TAGS.topic;
  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
    }
  };

  const handleCancel = () => {
    setSelectedCategory("");
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Save Post</h3>
            <p className="text-sm text-gray-600 mt-1 truncate">
              &quot;{postTitle}&quot;
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <HiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Categories List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No categories found
            </div>
          ) : (
            <div className="p-2">
              {filteredCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  disabled={isLoading}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === category
                      ? "bg-accent text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="font-medium">{category}</span>
                  {selectedCategory === category && (
                    <HiCheck className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCategory || isLoading}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Post</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectionModal;
