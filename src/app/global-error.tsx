"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F8FAFC" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#09090B", marginBottom: 8 }}>
            Algo salió mal
          </h2>
          <p style={{ fontSize: 14, color: "#71717A", marginBottom: 24, textAlign: "center", maxWidth: 400 }}>
            Ocurrió un error inesperado en la aplicación. Intenta recargar la página.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              background: "#09090B",
              color: "white",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
