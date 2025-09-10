import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { useHeroContent } from '@/hooks/use-settings';

const HeroContentEditor = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [heroContent, updateHeroContent, isLoading] = useHeroContent();
  const [localContent, setLocalContent] = useState({
    heading: '🍕 PIZZERIA Regina 2000',
    subheading: 'Autentica pizza italiana preparata con ingredienti freschi e forno a legna tradizionale nel cuore di Torino',
    backgroundImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    heroImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  });
  const { toast } = useToast();

  // Sync local content with hook data when it loads
  useEffect(() => {
    if (heroContent && !isLoading) {
      setLocalContent({
        heading: heroContent.heading || '🍕 PIZZERIA Regina 2000',
        subheading: heroContent.subheading || 'Autentica pizza italiana preparata con ingredienti freschi e forno a legna tradizionale nel cuore di Torino',
        backgroundImage: heroContent.backgroundImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        heroImage: heroContent.heroImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
      });
    }
  }, [heroContent, isLoading]);

  const handleSave = async () => {
    setIsSaving(true);
    console.log('🍕 HeroContentEditor: Starting save process...', localContent);

    try {
      // Use the hook to save to database and localStorage
      console.log('🍕 HeroContentEditor: Calling updateHeroContent...');
      const success = await updateHeroContent(localContent);
      console.log('🍕 HeroContentEditor: Save result:', success);

      if (success) {
        // Trigger a custom event to notify other components
        console.log('🍕 HeroContentEditor: Triggering heroContentUpdated event...');
        window.dispatchEvent(new CustomEvent('heroContentUpdated', {
          detail: localContent
        }));

        toast({
          title: '🍕 Successo!',
          description: 'Contenuto hero aggiornato con successo per la pizzeria!',
        });

        console.log('🍕 HeroContentEditor: Save completed successfully');
      } else {
        throw new Error('Failed to save hero content');
      }
    } catch (error) {
      console.error('🍕 HeroContentEditor: Error saving hero content:', error);
      toast({
        title: '❌ Errore',
        description: 'Impossibile salvare il contenuto hero. Riprova.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (heroContent) {
      setLocalContent({
        heading: heroContent.heading || '🍕 PIZZERIA Regina 2000',
        subheading: heroContent.subheading || 'Autentica pizza italiana preparata con ingredienti freschi e forno a legna tradizionale nel cuore di Torino',
        backgroundImage: heroContent.backgroundImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        heroImage: heroContent.heroImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
      });
    }
  };

  const updateHeading = (value: string) => {
    setLocalContent(prev => ({ ...prev, heading: value }));
  };

  const updateSubheading = (value: string) => {
    setLocalContent(prev => ({ ...prev, subheading: value }));
  };

  const updateBackgroundImage = (imageUrl: string) => {
    console.log('🖼️ HeroContentEditor: Background image updated:', imageUrl);
    setLocalContent(prev => ({ ...prev, backgroundImage: imageUrl }));
  };

  const updateHeroImage = (imageUrl: string) => {
    console.log('🖼️ HeroContentEditor: Hero image updated:', imageUrl);
    setLocalContent(prev => ({ ...prev, heroImage: imageUrl }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const hasChanges =
    localContent.heading !== (heroContent?.heading || '') ||
    localContent.subheading !== (heroContent?.subheading || '') ||
    localContent.backgroundImage !== (heroContent?.backgroundImage || '') ||
    localContent.heroImage !== (heroContent?.heroImage || '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Hero Section Editor
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={!hasChanges || isSaving}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Hero Heading</label>
          <Input
            value={localContent.heading}
            onChange={(e) => updateHeading(e.target.value)}
            placeholder="Enter hero section heading"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hero Subheading</label>
          <Textarea
            value={localContent.subheading}
            onChange={(e) => updateSubheading(e.target.value)}
            placeholder="Enter hero section subheading"
            className="w-full"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Background Video</label>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Local Video Active</span>
            </div>
            <p className="text-sm text-green-700 mb-2">
              <strong>Current:</strong> 20250509_211620.mp4
            </p>
            <p className="text-xs text-green-600">
              ✅ Using local video file to save database storage space. Video is served from the public folder.
              If the video fails to load, it will automatically fallback to the background image below.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Fallback Background Image</label>
            <ImageUploader
              currentImage={localContent.backgroundImage}
              onImageSelected={updateBackgroundImage}
              bucketName="uploads"
              folderPath="hero-backgrounds"
              buttonLabel="Upload Fallback Image"
            />
            <p className="text-xs text-gray-500 mt-2">
              This image will be used as a fallback if the video fails to load. Recommended size: 2000x1000px or larger.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Hero Image (Right Side)</label>
          <ImageUploader
            currentImage={localContent.heroImage}
            onImageSelected={updateHeroImage}
            bucketName="uploads"
            folderPath="hero-images"
            buttonLabel="Upload Hero Image"
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload an image to display in the right column of the hero section. This should be your featured pizza or chef photo. Recommended size: 800x600px or larger.
          </p>
        </div>

        {/* Preview Section */}
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-3">Preview</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-500">Heading:</span>
                <p className="font-semibold">{localContent.heading || 'No heading set'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Subheading:</span>
                <p className="text-sm">{localContent.subheading || 'No subheading set'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Background:</span>
                <div className="mt-2 space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-800">Video Background</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">20250509_211620.mp4</p>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400">Fallback Image:</span>
                    {localContent.backgroundImage ? (
                      <div className="mt-1">
                        <img
                          src={localContent.backgroundImage}
                          alt="Fallback background preview"
                          className="w-full h-16 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No fallback image set</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Hero Image (Right Side):</span>
                {localContent.heroImage ? (
                  <div className="mt-2">
                    <img
                      src={localContent.heroImage}
                      alt="Hero image preview"
                      className="w-full h-24 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No hero image set</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ You have unsaved changes. Click "Save Changes" to apply them to your website.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeroContentEditor;
