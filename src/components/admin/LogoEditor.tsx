
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, RefreshCw, Loader2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { useLogoSettings } from "@/hooks/use-settings";

const LogoEditor = () => {
  const [logoSettings, updateLogoSettings, isLoading] = useLogoSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const success = await updateLogoSettings(logoSettings);

      if (success) {
        toast({
          title: '🍕 Logo Aggiornato!',
          description: 'Il logo della pizzeria è stato aggiornato con successo.',
        });
      } else {
        toast({
          title: '⚠️ Salvato Localmente',
          description: 'Logo salvato localmente. Si sincronizzerà quando la connessione sarà ripristinata.',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Errore',
        description: 'Impossibile salvare il logo. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUploaded = (imageUrl: string) => {
    updateLogoSettings({ ...logoSettings, logoUrl: imageUrl });
    setImageLoaded(false);
    setImageError(false);
  };

  const defaultSettings = {
    logoUrl: "/pizzeria-regina-logo.png",
    altText: "Pizzeria Regina 2000 Torino Logo",
  };

  const resetToDefault = async () => {
    try {
      setIsSaving(true);
      const success = await updateLogoSettings(defaultSettings);

      if (success) {
        toast({
          title: "🔄 Logo Ripristinato",
          description: "Il logo è stato ripristinato al default della pizzeria",
        });
        setImageLoaded(false);
        setImageError(false);
      } else {
        toast({
          title: "⚠️ Ripristinato Localmente",
          description: "Logo ripristinato localmente. Si sincronizzerà quando la connessione sarà ripristinata.",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Errore",
        description: "Impossibile ripristinare il logo. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          <p className="text-sm text-gray-600">Caricamento impostazioni logo...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestione Logo</h3>
          <p className="text-sm text-gray-600">Carica e modifica il logo della pizzeria (immagine sinistra)</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          variant="default"
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              Salva Modifiche
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo della Pizzeria</CardTitle>
          <CardDescription>
            Carica e personalizza il logo di Pizzeria Regina 2000
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="border rounded-md p-6 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
              {!imageLoaded && !imageError && logoSettings?.logoUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                  <p className="text-sm text-gray-500">Caricamento logo...</p>
                </div>
              )}

              {logoSettings?.logoUrl && !imageError && (
                <div className="bg-slate-100 p-3 rounded-full">
                  <img
                    src={logoSettings.logoUrl}
                    alt={logoSettings.altText || "Logo Pizzeria"}
                    className={`h-32 w-32 object-contain transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      console.error('❌ Logo failed to load:', logoSettings.logoUrl);
                      setImageError(true);
                      setImageLoaded(false);
                    }}
                  />
                </div>
              )}

              {imageError && (
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <div className="text-red-500 text-4xl mb-2">🍕</div>
                  <p className="text-sm text-red-600">Errore nel caricamento del logo</p>
                  <p className="text-xs text-gray-500 mt-1">Prova a caricare una nuova immagine</p>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {imageError ? 'Logo non disponibile' : 'Logo Attuale'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Carica Nuovo Logo</Label>
              <ImageUploader
                onImageSelected={handleImageUploaded}
                buttonLabel="Scegli Immagine Logo"
                bucketName="uploads"
                folderPath="logos"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Raccomandato: Immagine quadrata, almeno 200x200 pixel, PNG o SVG con sfondo trasparente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-alt-text">Testo Alternativo</Label>
              <Input
                id="logo-alt-text"
                value={logoSettings?.altText || ''}
                onChange={(e) => updateLogoSettings({ ...logoSettings, altText: e.target.value })}
                placeholder="Descrivi il logo per screen reader e SEO"
              />
              <p className="text-xs text-muted-foreground">
                Aiuta l'accessibilità e il SEO descrivendo il contenuto del logo
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={resetToDefault}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Ripristinando...
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                Ripristina Default
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                Salva Modifiche
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogoEditor;
