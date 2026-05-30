import { useMemo } from "react";
import Editor from "@monaco-editor/react";

export default function MonacoEditorWrapper({
  language,
  value,
  onChange,
  height = "260px",
  readOnly = false,
  disableCopyPaste = true,
}) {
  const monacoLang = useMemo(() => {
    if (language === "python") return "python";
    if (language === "cpp") return "cpp";
    if (language === "java") return "java";
    return "plaintext";
  }, [language]);

  return (
    <div className="rounded-xl border border-emerald-500/70 overflow-hidden bg-slate-950">
      <Editor
        height={height}
        defaultLanguage={monacoLang}
        language={monacoLang}
        value={value}
        onChange={(v) => onChange?.(v ?? "")}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
        }}
        theme="vs-dark"
        onMount={(editor, monaco) => {
          // Disable copy-paste functionality
          if (disableCopyPaste) {
            editor.onDidPaste((e) => {
              // Prevent paste
              e.preventDefault?.();
              return false;
            });
            
            // Override paste command
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
              // Do nothing - disable paste
              return null;
            });
            
            // Override copy command
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
              // Do nothing - disable copy
              return null;
            });
            
            // Override cut command
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
              // Do nothing - disable cut
              return null;
            });
          }
          
          // Suppress storage warnings in console
          try {
            const originalError = console.error;
            console.error = (...args) => {
              const msg = args[0]?.toString?.() || '';
              if (msg.includes('storage') || msg.includes('Tracking Prevention')) {
                return; // Suppress storage-related warnings
              }
              originalError.apply(console, args);
            };
          } catch (e) {
            // Ignore suppression errors
          }
        }}
      />
    </div>
  );
}
