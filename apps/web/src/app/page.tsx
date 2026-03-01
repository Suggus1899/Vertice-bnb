export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Bienvenido a <span className="text-vertice-primary">Vértice</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Plataforma de búsqueda de alojamiento estudiantil
        </p>
        
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold text-xl mb-2">🔍 Búsqueda Geoespacial</h3>
            <p className="text-muted-foreground">
              Encuentra propiedades cerca de tu universidad usando búsqueda por radio
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold text-xl mb-2">💬 Chat en Tiempo Real</h3>
            <p className="text-muted-foreground">
              Comunícate directamente con los anfitriones
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold text-xl mb-2">💰 Pagos Multi-moneda</h3>
            <p className="text-muted-foreground">
              Paga en USD o Bs con tasa de cambio BCV
            </p>
          </div>
        </div>
        
        <div className="mt-12 p-6 rounded-lg border bg-accent text-accent-foreground">
          <h2 className="text-2xl font-bold mb-4">🚀 Estado del Proyecto</h2>
          <p className="mb-2">
            <strong>Fase 1:</strong> Fundamentos en progreso
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>✅ Monorepo con TurboRepo</li>
            <li>✅ Backend Express configurado</li>
            <li>✅ Frontend Next.js configurado</li>
            <li>⏳ App móvil Expo</li>
            <li>⏳ Sistema de diseño UI</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
