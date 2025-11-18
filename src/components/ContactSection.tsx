import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  MessageSquare,
  Pizza,
  ChefHat
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePizzeriaHours } from '@/hooks/usePizzeriaHours';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: string;
}

const ContactSection = () => {
  const { toast } = useToast();
  const { allHours } = usePizzeriaHours();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: 'Corso Regina Margherita, 53/b, 10124, Torino TO, Italia',
    phone: '0110769211',
    email: 'anilamyzyri@gmail.com',
    hours: 'Lun-Dom: 12:00 - 24:00'
  });

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  // Load contact info from database
  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'contactContent')
        .single();

      if (data?.value) {
        setContactInfo({
          address: data.value.address || contactInfo.address,
          phone: data.value.phone || contactInfo.phone,
          email: data.value.email || contactInfo.email,
          hours: data.value.hours || contactInfo.hours
        });
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: 'Campi Obbligatori',
        description: 'Per favore compila tutti i campi obbligatori.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order from contact form
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || null,
          customer_address: null, // No address provided in contact form
          total_amount: 0, // Will be determined later
          status: 'pending', // Custom request pending review
          payment_status: 'pending',
          notes: `Contact Form Request - Subject: ${subjectOptions.find(opt => opt.value === formData.subject)?.label}\nMessage: ${formData.message}`,
          metadata: {
            source: 'contact_form',
            subject: formData.subject,
            original_message: formData.message
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order item for custom request
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: 'custom-request',
          product_name: `Custom Request - ${subjectOptions.find(opt => opt.value === formData.subject)?.label}`,
          product_price: 0, // To be determined
          quantity: 1,
          subtotal: 0,
          metadata: {
            source: 'contact_form',
            subject: formData.subject,
            message: formData.message
          }
        });

      if (itemError) throw itemError;

      // Create notification for admin
      const { error: notificationError } = await supabase
        .from('order_notifications')
        .insert({
          order_id: order.id,
          message: `New custom request from ${formData.name} - ${subjectOptions.find(opt => opt.value === formData.subject)?.label}`,
          is_read: false
        });

      if (notificationError) {
        console.error('Failed to create notification:', notificationError);
      }

      toast({
        title: 'Messaggio Inviato! ✅',
        description: 'Grazie per averci contattato. Ti risponderemo presto!',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Errore nell\'invio',
        description: 'Si è verificato un errore. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subjectOptions = [
    { value: 'general', label: '🍕 Informazioni Generali' },
    { value: 'order', label: '📞 Prenotazione Pizza' },
    { value: 'delivery', label: '🚗 Consegne a Domicilio' },
    { value: 'group', label: '👥 Gruppi e Feste' },
    { value: 'complaint', label: '📝 Feedback' },
    { value: 'other', label: '💬 Altro' }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-pizza-cream via-white to-pizza-orange/10 relative overflow-hidden">
      {/* Pizza-themed background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pizza-red rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pizza-orange rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pizza-green rounded-full blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating pizza icons */}
      <div className="absolute top-20 right-20 text-pizza-orange/20 animate-float">
        <Pizza size={50} />
      </div>
      <div className="absolute bottom-20 left-20 text-pizza-red/20 animate-float animation-delay-2000">
        <ChefHat size={40} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6 space-x-4">
            <div className="bg-pizza-red/10 p-4 rounded-full">
              <Pizza className="h-12 w-12 text-pizza-red animate-pizza-spin" />
            </div>
            <div className="bg-pizza-orange/10 p-4 rounded-full">
              <ChefHat className="h-12 w-12 text-pizza-orange animate-tomato-bounce" />
            </div>
            <div className="bg-pizza-green/10 p-4 rounded-full">
              <Pizza className="h-12 w-12 text-pizza-green animate-pizza-spin animation-delay-2000" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-pizza-dark mb-6 font-fredoka">
            📞 Contattaci
          </h2>
          <p className="text-xl text-pizza-brown max-w-3xl mx-auto leading-relaxed font-roboto">
            Siamo qui per soddisfare la tua voglia di pizza! Contattaci per prenotazioni,
            eventi speciali e per scoprire le nostre deliziose pizze italiana.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          
          {/* Contact Form */}
          <Card className="shadow-2xl border-2 border-pizza-orange/20 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-pizza-red to-pizza-orange text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center gap-3 font-fredoka">
                <Pizza className="h-6 w-6 animate-pizza-spin" />
                🍕 Ordina o Scrivi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Il tuo nome"
                      required
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="la-tua-email@esempio.com"
                      required
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Telefono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+39 123 456 7890"
                      className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-700 font-medium">
                      Oggetto *
                    </Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                      <SelectTrigger className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue placeholder="Seleziona un oggetto" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-700 font-medium">
                    Messaggio *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Scrivi qui il tuo messaggio..."
                    rows={5}
                    required
                    className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Invia Messaggio
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold">Informazioni di Contatto</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Indirizzo</h3>
                    <p className="text-gray-600">{contactInfo.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Telefono</h3>
                    <a href={`tel:${contactInfo.phone}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                    <a href={`mailto:${contactInfo.email}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Orari di Apertura</h3>
                    <p className="text-gray-600 whitespace-pre-line">{allHours || contactInfo.hours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Google Map */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="h-64 relative">
                  <iframe
                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDnJS3eyAnguEeCdZIMmYUNzq8LOBhmkMA&q=Corso+Regina+Margherita+53+10124+Torino+Italy&zoom=16&maptype=roadmap"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-lg"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <a
                      href="https://www.google.com/maps/dir//Corso+Regina+Margherita+53+10124+Torino+Italy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors text-sm font-medium"
                    >
                      <MapPin className="h-4 w-4" />
                      Indicazioni
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
