import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function CodeEditor() {
  const [code, setCode] = useState("// Start typing your code here...");

  return (
    <div className="p-4 h-[80vh] w-[90%] mx-auto border border-indigo-600 rounded-xl shadow-xl bg-gray-900">
      <Editor
        height="100%"
        theme="vs-dark"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => setCode(value)}
      />
    </div>
  );
}
