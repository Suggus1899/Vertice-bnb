"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  Select,
} from "@vetice/ui";
import ImageUpload from "@/components/image-upload";
import LocationPicker from "@/components/location-picker";

type PropertyType = "ROOM" | "APARTMENT" | "HOUSE";
type Gender = "MIXED" | "FEMALE_ONLY" | "MALE_ONLY";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [images, setImages] = React.useState<File[]>([]);

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    priceUsd: "",
    address: "",
    city: "",
    state: "",
    country: "Venezuela",
    type: "APARTMENT" as PropertyType,
    gender: "MIXED" as Gender,
    latitude: 10.4806,
    longitude: -66.9036,
    services: {
      wifi: true,
      ac: false,
      parking: false,
      laundry: false,
      kitchen: false,
      gym: false,
      pool: false,
      security: false,
    },
    paymentMethods: ["pagoMovil", "cashUsd"],
  });

  const handleImageUpload = async (files: File[]) => {
    // Aquí iría la lógica real de upload a Cloudinary
    // Por ahora solo guardamos los archivos
    setImages(files);
    console.log("Images to upload:", files);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleServiceChange = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service as keyof typeof prev.services],
      },
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Obtener token
      const token = localStorage.getItem("accessToken");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (user.role !== "HOST") {
        throw new Error("Solo los anfitriones pueden crear propiedades");
      }

      // Preparar datos
      const propertyData = {
        title: formData.title,
        description: formData.description,
        priceUsd: parseFloat(formData.priceUsd),
        address: formData.address,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country,
        type: formData.type,
        gender: formData.gender,
        latitude: formData.latitude,
        longitude: formData.longitude,
        services: formData.services,
        paymentMethods: formData.paymentMethods,
      };

      // 1. Crear propiedad
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(propertyData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear propiedad");
      }

      const property = data.data;

      // 2. Subir imágenes (si hay)
      if (images.length > 0) {
        // Aquí iría el upload real de imágenes
        console.log("Uploading images for property:", property.id);
      }

      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard/properties");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear propiedad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nueva Propiedad</h1>
        <p className="text-muted-foreground mt-1">
          Completa el formulario para publicar tu propiedad
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales de tu propiedad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <p className="text-sm">{error}</p>
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  <p className="text-sm">¡Propiedad creada exitosamente!</p>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Apartamento moderno en Altamira"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descripción *</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe tu propiedad..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                  disabled={isLoading || success}
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Propiedad *</Label>
                  <Select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isLoading || success}
                  >
                    <option value="ROOM">Habitación</option>
                    <option value="APARTMENT">Apartamento</option>
                    <option value="HOUSE">Casa</option>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isLoading || success}
                  >
                    <option value="MIXED">Mixto</option>
                    <option value="FEMALE_ONLY">Solo Mujeres</option>
                    <option value="MALE_ONLY">Solo Hombres</option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priceUsd">Precio (USD) *</Label>
                <Input
                  id="priceUsd"
                  name="priceUsd"
                  type="number"
                  placeholder="450"
                  value={formData.priceUsd}
                  onChange={handleChange}
                  required
                  disabled={isLoading || success}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
              <CardDescription>
                Haz clic en el mapa para seleccionar la ubicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                height="300px"
              />

              <div className="grid gap-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Av. Principal, Edificio..."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  required
                  disabled={isLoading || success}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Caracas"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={isLoading || success}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Distrito Capital"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={isLoading || success}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Coordenadas: {formData.latitude.toFixed(6)},{" "}
                {formData.longitude.toFixed(6)}
              </div>
            </CardContent>
          </Card>

          {/* Servicios */}
          <Card>
            <CardHeader>
              <CardTitle>Servicios</CardTitle>
              <CardDescription>
                Selecciona los servicios que ofrece tu propiedad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(formData.services).map(([service, enabled]) => (
                  <label
                    key={service}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleServiceChange(service)}
                      disabled={isLoading || success}
                      className="h-4 w-4 rounded border-input"
                    />
                    <span className="text-sm capitalize">
                      {service === "wifi" && "📶 WiFi"}
                      {service === "ac" && "❄️ Aire Acondicionado"}
                      {service === "parking" && "🚗 Estacionamiento"}
                      {service === "laundry" && "🧺 Lavandería"}
                      {service === "kitchen" && "🍳 Cocina"}
                      {service === "gym" && "💪 Gimnasio"}
                      {service === "pool" && "🏊 Piscina"}
                      {service === "security" && "👮 Seguridad"}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pago */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>
                Selecciona los métodos de pago que aceptas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes("pagoMovil")}
                    onChange={() => handlePaymentMethodChange("pagoMovil")}
                    disabled={isLoading || success}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">Pago Móvil</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes("cashUsd")}
                    onChange={() => handlePaymentMethodChange("cashUsd")}
                    disabled={isLoading || success}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">Efectivo USD</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes("zelle")}
                    onChange={() => handlePaymentMethodChange("zelle")}
                    disabled={isLoading || success}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">Zelle</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes("bankTransfer")}
                    onChange={() => handlePaymentMethodChange("bankTransfer")}
                    disabled={isLoading || success}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm">Transferencia</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
              <CardDescription>
                Sube imágenes de tu propiedad (máximo 10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload onUpload={handleImageUpload} maxFiles={10} />
            </CardContent>
          </Card>
        </div>

        {/* Acciones */}
        <CardFooter className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || success}>
            {isLoading ? "Creando..." : success ? "Creada" : "Crear Propiedad"}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
}
