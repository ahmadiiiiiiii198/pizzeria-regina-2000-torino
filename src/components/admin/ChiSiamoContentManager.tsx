import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  RefreshCw,
  Eye,
  FileText,
  AlertCircle,
  Loader2,
  Users,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChiSiamoContent {
  it: {
    title: string;
    storyTitle: string;
    paragraph1: string;
    paragraph2: string;
    quote: string;
    quoteAuthor: string;
    servicesTitle: string;
    services: string[];
    stats: {
      years: string;
      customers: string;
      varieties: string;
    };
    closingMessage: string;
    tagline: string;
  };
  en: {
    title: string;
    storyTitle: string;
    paragraph1: string;
    paragraph2: string;
    quote: string;
    quoteAuthor: string;
    servicesTitle: string;
    services: string[];
    stats: {
      years: string;
      customers: string;
      varieties: string;
    };
    closingMessage: string;
    tagline: string;
  };
}

const DEFAULT_CONTENT: ChiSiamoContent = {
  it: {
    title: 'Chi Siamo - Pizzeria Regina 2000',
    storyTitle: 'La Nostra Storia',
    paragraph1: 'Pizzeria Regina 2000 nasce dalla passione per l\'autentica tradizione italiana e dall\'esperienza culinaria tramandata nel tempo. Da 14 anni, offriamo pizza italiana preparata con amore, ingredienti freschi e il nostro forno a legna tradizionale.',
    paragraph2: 'Le nostre pizze nascono da una profonda passione per la tradizione culinaria italiana. Solo ingredienti selezionati, solo autenticità made in Torino. 🍕 Situati nel cuore di Torino, offriamo esperienza artigianale e passione per la vera pizza italiana.',
    quote: '📍 Trovaci nel centro di Torino – dove la tradizione italiana incontra l\'ospitalità piemontese.',
    quoteAuthor: 'Un viaggio tra sapori, tradizione e autenticità',
    servicesTitle: 'Nella nostra pizzeria puoi trovare:',
    services: [
      'Pizza italiana cotta nel forno a legna',
      'Ingredienti freschi e di prima qualità',
      'Impasto preparato quotidianamente con lievitazione naturale',
      'Servizio per eventi e feste personalizzato'
    ],
    stats: {
      years: 'Anni di Esperienza',
      customers: 'Clienti Soddisfatti',
      varieties: 'Varietà di Pizze'
    },
    closingMessage: 'Vieni a trovarci alla Pizzeria Regina 2000 e scopri il vero sapore della tradizione italiana.',
    tagline: 'Creiamo sapori autentici, una pizza alla volta'
  },
  en: {
    title: 'About Pizzeria Regina 2000',
    storyTitle: 'Our Story',
    paragraph1: 'Pizzeria Regina 2000 was born from a passion for authentic Italian tradition and culinary experience passed down through time. For 14 years, we offer Italian pizza prepared with love, fresh ingredients and our traditional wood-fired oven.',
    paragraph2: 'Our pizzas are born from a deep passion for Italian culinary tradition. Only selected ingredients, only authenticity made in Turin. 🍕 Located in the heart of Turin, we offer artisanal experience and passion for authentic Italian pizza.',
    quote: '📍 Find us in the center of Turin – where Italian tradition meets Piedmontese hospitality.',
    quoteAuthor: 'A journey through flavors, tradition and authenticity',
    servicesTitle: 'In our pizzeria you can find:',
    services: [
      'Italian pizza cooked in a wood-fired oven',
      'Fresh and top quality ingredients',
      'Dough prepared daily with natural leavening',
      'Service for events and personalized parties'
    ],
    stats: {
      years: 'Years of Experience',
      customers: 'Satisfied Customers',
      varieties: 'Pizza Varieties'
    },
    closingMessage: 'Come visit us at Pizzeria Regina 2000 and discover the true taste of Italian tradition.',
    tagline: 'Creating authentic flavors, one pizza at a time'
  }
};

const ChiSiamoContentManager = () => {
  const [content, setContent] = useState<ChiSiamoContent>(DEFAULT_CONTENT);
  const [activeLanguage, setActiveLanguage] = useState<'it' | 'en'>('it');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current content from database
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      console.log('📥 [ChiSiamoContentManager] Loading content from database...');

      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'chiSiamoContent')
        .single();

      if (!error && data?.value) {
        const loadedContent = data.value as ChiSiamoContent;
        console.log('✅ [ChiSiamoContentManager] Content loaded:', loadedContent);
        setContent(loadedContent);
      } else {
        console.log('⚠️ [ChiSiamoContentManager] No content found, using defaults');
        setContent(DEFAULT_CONTENT);
      }
    } catch (error) {
      console.error('❌ [ChiSiamoContentManager] Error loading content:', error);
      toast.error('Errore nel caricamento del contenuto');
      setContent(DEFAULT_CONTENT);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setContent(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleStatsChange = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [activeLanguage]: {
        ...prev[activeLanguage],
        stats: {
          ...prev[activeLanguage].stats,
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...content[activeLanguage].services];
    newServices[index] = value;
    handleInputChange('services', newServices);
  };

  const addService = () => {
    const newServices = [...content[activeLanguage].services, ''];
    handleInputChange('services', newServices);
  };

  const removeService = (index: number) => {
    const newServices = content[activeLanguage].services.filter((_, i) => i !== index);
    handleInputChange('services', newServices);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 [ChiSiamoContentManager] Saving content:', content);

      // Validate required fields
      if (!content.it.title.trim() || !content.en.title.trim()) {
        toast.error('Titolo è obbligatorio per entrambe le lingue');
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'chiSiamoContent',
          value: content,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('❌ [ChiSiamoContentManager] Save error:', error);
        toast.error('Errore nel salvataggio: ' + error.message);
        return;
      }

      console.log('✅ [ChiSiamoContentManager] Content saved successfully');
      toast.success('Contenuto Chi Siamo salvato con successo!');
      setHasChanges(false);

    } catch (error) {
      console.error('❌ [ChiSiamoContentManager] Unexpected error:', error);
      toast.error('Errore imprevisto durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Caricamento contenuto Chi Siamo...</span>
      </div>
    );
  }

  const currentContent = content[activeLanguage];

  return (
    <Card className="bg-white rounded-2xl shadow-xl border border-gray-200">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl border-b border-blue-200">
        <CardTitle className="flex items-center justify-between text-blue-800">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 rounded-lg mr-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            Gestione Contenuto "Chi Siamo"
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveLanguage('it')}
              variant={activeLanguage === 'it' ? 'default' : 'outline'}
              size="sm"
            >
              IT
            </Button>
            <Button
              onClick={() => setActiveLanguage('en')}
              variant={activeLanguage === 'en' ? 'default' : 'outline'}
              size="sm"
            >
              EN
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="text-blue-600">
          Modifica tutti i testi della sezione Chi Siamo per {activeLanguage === 'it' ? 'Italiano' : 'Inglese'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Titolo Principale</Label>
          <Input
            value={currentContent.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Titolo della sezione Chi Siamo"
          />
        </div>

        {/* Story Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Titolo Storia</Label>
          <Input
            value={currentContent.storyTitle}
            onChange={(e) => handleInputChange('storyTitle', e.target.value)}
            placeholder="Titolo della storia (es. La Nostra Storia)"
          />
        </div>

        {/* Paragraphs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Primo Paragrafo</Label>
            <Textarea
              value={currentContent.paragraph1}
              onChange={(e) => handleInputChange('paragraph1', e.target.value)}
              rows={4}
              placeholder="Primo paragrafo della storia..."
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Secondo Paragrafo</Label>
            <Textarea
              value={currentContent.paragraph2}
              onChange={(e) => handleInputChange('paragraph2', e.target.value)}
              rows={4}
              placeholder="Secondo paragrafo della storia..."
            />
          </div>
        </div>

        {/* Quote */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Citazione</Label>
            <Textarea
              value={currentContent.quote}
              onChange={(e) => handleInputChange('quote', e.target.value)}
              rows={2}
              placeholder="Citazione principale..."
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Autore Citazione</Label>
            <Input
              value={currentContent.quoteAuthor}
              onChange={(e) => handleInputChange('quoteAuthor', e.target.value)}
              placeholder="Autore della citazione"
            />
          </div>
        </div>

        {/* Services Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Titolo Servizi</Label>
            <Input
              value={currentContent.servicesTitle}
              onChange={(e) => handleInputChange('servicesTitle', e.target.value)}
              placeholder="Titolo della sezione servizi"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Lista Servizi</Label>
              <Button
                onClick={addService}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Aggiungi
              </Button>
            </div>
            {currentContent.services.map((service, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  placeholder={`Servizio ${index + 1}`}
                />
                <Button
                  onClick={() => removeService(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Statistiche</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Anni</Label>
              <Input
                value={currentContent.stats.years}
                onChange={(e) => handleStatsChange('years', e.target.value)}
                placeholder="Anni di Esperienza"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Clienti</Label>
              <Input
                value={currentContent.stats.customers}
                onChange={(e) => handleStatsChange('customers', e.target.value)}
                placeholder="Clienti Soddisfatti"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Varietà</Label>
              <Input
                value={currentContent.stats.varieties}
                onChange={(e) => handleStatsChange('varieties', e.target.value)}
                placeholder="Varietà di Pizze"
              />
            </div>
          </div>
        </div>

        {/* Closing Message */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Messaggio di Chiusura</Label>
          <Textarea
            value={currentContent.closingMessage}
            onChange={(e) => handleInputChange('closingMessage', e.target.value)}
            rows={3}
            placeholder="Messaggio finale della sezione..."
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tagline</Label>
          <Input
            value={currentContent.tagline}
            onChange={(e) => handleInputChange('tagline', e.target.value)}
            placeholder="Tagline della pizzeria"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Button
              onClick={loadContent}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Ricarica
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="flex items-center text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Modifiche non salvate
              </div>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Salva Contenuto
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChiSiamoContentManager;
