export default function Layout({ children }) {
  return (
    <div className="flex flex-1 gap-4 p-6 overflow-hidden">
      {children}
    </div>
  );
}
