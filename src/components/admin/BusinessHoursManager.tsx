import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Clock, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { businessHoursService } from '@/services/businessHoursService';

interface TimePeriod {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface DayHours {
  lunch: TimePeriod;
  dinner: TimePeriod;
}

interface WeeklyHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

const BusinessHoursManager = () => {
  const { toast } = useToast();
  // Initialize with null to avoid showing misleading default times
  // Component will show loading state until real data is fetched
  const [hours, setHours] = useState<WeeklyHours | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = [
    { key: 'monday', label: 'Lunedì' },
    { key: 'tuesday', label: 'Martedì' },
    { key: 'wednesday', label: 'Mercoledì' },
    { key: 'thursday', label: 'Giovedì' },
    { key: 'friday', label: 'Venerdì' },
    { key: 'saturday', label: 'Sabato' },
    { key: 'sunday', label: 'Domenica' }
  ];

  // Load business hours
  useEffect(() => {
    loadBusinessHours();
  }, []);

  const loadBusinessHours = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 [BusinessHoursManager] Loading business hours from service...');
      const businessHours = await businessHoursService.getBusinessHours();
      setHours(businessHours);
      console.log('✅ [BusinessHoursManager] Business hours loaded successfully:', businessHours);
    } catch (error) {
      console.error('❌ [BusinessHoursManager] Error loading business hours:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli orari di apertura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDayHours = (day: keyof WeeklyHours, period: 'lunch' | 'dinner', field: keyof TimePeriod, value: any) => {
    if (!hours) return;
    
    setHours(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [period]: {
            ...prev[day][period],
            [field]: value
          }
        }
      };
    });
  };

  const saveBusinessHours = async () => {
    if (!hours) return; // Can't save if no hours loaded
    
    try {
      setIsSaving(true);
      
      console.log('💾 [BusinessHoursManager] Saving business hours to database...');
      
      // Save to database
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'businessHours',
          value: hours as any, // Cast to any to satisfy Supabase Json type
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        throw error;
      }

      console.log('✅ [BusinessHoursManager] Database update successful');

      // Force complete refresh to verify changes immediately
      console.log('🔄 [BusinessHoursManager] Forcing complete refresh...');
      const updatedHours = await businessHoursService.forceRefresh();
      console.log('✅ [BusinessHoursManager] Verified updated hours:', updatedHours);

      // Update local state to reflect changes immediately
      setHours(updatedHours);

      toast({
        title: "Successo",
        description: "Orari di apertura salvati con successo. Le modifiche sono attive immediatamente.",
      });

      console.log('✅ [BusinessHoursManager] Save operation completed successfully');
    } catch (error) {
      console.error('❌ [BusinessHoursManager] Error saving business hours:', error);
      toast({
        title: "Errore",
        description: "Impossibile salvare gli orari di apertura",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const setAllDaysSame = () => {
    if (!hours) return;
    
    const mondayHours = {
      lunch: { ...hours.monday.lunch },
      dinner: { ...hours.monday.dinner }
    };
    const newHours = { ...hours };
    
    Object.keys(newHours).forEach(day => {
      newHours[day as keyof WeeklyHours] = {
        lunch: { ...mondayHours.lunch },
        dinner: { ...mondayHours.dinner }
      };
    });
    
    setHours(newHours);
    toast({
      title: "Orari copiati",
      description: "Gli orari del lunedì sono stati applicati a tutti i giorni",
    });
  };

  if (isLoading || !hours) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Caricamento orari...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-4 mb-6">
        <Button 
          onClick={setAllDaysSame}
          variant="outline"
          className="flex items-center"
        >
          <Clock className="h-4 w-4 mr-2" />
          Applica orari lunedì a tutti i giorni
        </Button>
        <Button 
          onClick={loadBusinessHours}
          variant="outline"
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Ricarica
        </Button>
      </div>

      {/* Days Configuration */}
      <div className="grid gap-4">
        {daysOfWeek.map(({ key, label }) => (
          <Card key={key} className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Lunch Hours */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Pranzo</Label>
                    <Switch
                      checked={hours[key as keyof WeeklyHours].lunch.isOpen}
                      onCheckedChange={(checked) => updateDayHours(key as keyof WeeklyHours, 'lunch', 'isOpen', checked)}
                    />
                  </div>
                  {hours[key as keyof WeeklyHours].lunch.isOpen && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${key}-lunch-open`} className="text-sm">Apertura Pranzo</Label>
                        <Input
                          id={`${key}-lunch-open`}
                          type="time"
                          value={hours[key as keyof WeeklyHours].lunch.openTime}
                          onChange={(e) => updateDayHours(key as keyof WeeklyHours, 'lunch', 'openTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${key}-lunch-close`} className="text-sm">Chiusura Pranzo</Label>
                        <Input
                          id={`${key}-lunch-close`}
                          type="time"
                          value={hours[key as keyof WeeklyHours].lunch.closeTime}
                          onChange={(e) => updateDayHours(key as keyof WeeklyHours, 'lunch', 'closeTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dinner Hours */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Cena</Label>
                    <Switch
                      checked={hours[key as keyof WeeklyHours].dinner.isOpen}
                      onCheckedChange={(checked) => updateDayHours(key as keyof WeeklyHours, 'dinner', 'isOpen', checked)}
                    />
                  </div>
                  {hours[key as keyof WeeklyHours].dinner.isOpen && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`${key}-dinner-open`} className="text-sm">Apertura Cena</Label>
                        <Input
                          id={`${key}-dinner-open`}
                          type="time"
                          value={hours[key as keyof WeeklyHours].dinner.openTime}
                          onChange={(e) => updateDayHours(key as keyof WeeklyHours, 'dinner', 'openTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${key}-dinner-close`} className="text-sm">Chiusura Cena</Label>
                        <Input
                          id={`${key}-dinner-close`}
                          type="time"
                          value={hours[key as keyof WeeklyHours].dinner.closeTime}
                          onChange={(e) => updateDayHours(key as keyof WeeklyHours, 'dinner', 'closeTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {!hours[key as keyof WeeklyHours].lunch.isOpen && !hours[key as keyof WeeklyHours].dinner.isOpen && (
                  <p className="text-gray-500 italic text-center py-4">Chiuso tutto il giorno</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={saveBusinessHours}
          disabled={isSaving}
          className="flex items-center"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Salvataggio...' : 'Salva Orari'}
        </Button>
      </div>
    </div>
  );
};

export default BusinessHoursManager;
