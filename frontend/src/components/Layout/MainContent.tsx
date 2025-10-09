export default function MainContent({ children }) {
    return (
      <main className="flex-1 m-5 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-y-auto transition-colors duration-200">
        {children}
      </main>
    );
  }
  