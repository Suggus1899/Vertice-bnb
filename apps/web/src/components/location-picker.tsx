import dynamic from 'next/dynamic';

// Importación dinámica con ssr: false para evitar errores de window/leaflet
const LocationPickerClient = dynamic(
  () => import('./location-picker-client'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }
);

export default LocationPickerClient;
