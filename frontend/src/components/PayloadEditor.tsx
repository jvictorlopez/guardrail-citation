import { useState, useEffect } from "react";

interface PayloadEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function PayloadEditor({
  value,
  onChange,
  onSubmit,
  loading,
  error,
}: PayloadEditorProps) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError((e as Error).message);
    }
  }, [value]);

  const handleSubmit = () => {
    if (jsonError) return;
    onSubmit();
  };

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <h2 className="panel-title">Request Payload</h2>
      <textarea
        className="code-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "12px",
        }}
      >
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={loading || !!jsonError}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            "Run Guardrail"
          )}
        </button>
        {jsonError && (
          <span style={{ color: "#f87171", fontSize: "0.8rem", fontFamily: "monospace" }}>
            Invalid JSON
          </span>
        )}
        {error && (
          <span style={{ color: "#f87171", fontSize: "0.8rem" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
