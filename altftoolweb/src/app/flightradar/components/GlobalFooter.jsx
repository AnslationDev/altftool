export const GlobalFooter = () => {
  return (
    <footer className="bg-rice border-t border-timber/30 px-6 py-6 mt-auto">
      <div className="max-w-7xl mx-auto text-center text-grass text-sm">
        &copy; {new Date().getFullYear()} Aero. All rights reserved.
      </div>
    </footer>
  );
};
