"use client";

// Custom global error boundary. Replaces Next.js's built-in `_global-error`
// page, whose default prerender can crash on some runtimes
// ("Cannot read properties of null (reading 'useContext')"). This one is
// self-contained (its own <html>/<body>, inline styles — no CSS pipeline or
// context dependency), so it prerenders cleanly everywhere.

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a08",
          color: "#f7f3ec",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ padding: "24px", maxWidth: "28rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.72rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#a8895c",
            }}
          >
            Teeth by Trev
          </p>
          <h1
            style={{
              margin: "1rem 0 0",
              fontWeight: 300,
              fontSize: "2rem",
              lineHeight: 1.2,
            }}
          >
            Something went wrong.
          </h1>
          <p
            style={{
              margin: "0.75rem 0 0",
              color: "rgba(247,243,236,0.6)",
              lineHeight: 1.6,
            }}
          >
            Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.85rem 2rem",
              borderRadius: "9999px",
              border: "none",
              background: "#b89b6e",
              color: "#0c0a08",
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
