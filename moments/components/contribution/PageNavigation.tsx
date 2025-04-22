import { Page } from "./SignatureEditModal";

// PageNavigation Component
interface PageNavigationProps {
    pages: Page[];
    activePage: number;
    setActivePage: (index: number) => void;
    addPage: () => void;
    handleDeletePage: (index: number) => void;
  }
  
  export const PageNavigation: React.FC<PageNavigationProps> = ({
    pages,
    activePage,
    setActivePage,
    addPage,
    handleDeletePage,
  }) => (
    <div className="flex justify-center space-x-4 mb-6">
      {pages.map((_, index) => (
        <div
          key={index}
          className={`w-10 h-10 flex items-center justify-center rounded-full border-2 cursor-pointer ${
            activePage === index
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-purple-600 border-gray-300'
          }`}
          onClick={() => setActivePage(index)}
        >
          {index + 1}
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={addPage} className="text-purple-600 underline text-sm">
          Add another page
        </button>
        {pages.length > 1 && (
          <button
            onClick={() => handleDeletePage(activePage)}
            className="text-red-600 hover:text-red-800"
            title="Delete page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );