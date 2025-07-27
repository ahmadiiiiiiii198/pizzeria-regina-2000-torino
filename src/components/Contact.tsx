
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import PatternDivider from "./PatternDivider";
import { useToast } from "@/hooks/use-toast";
import OrderOptionsModal from "./OrderOptionsModal";
import BusinessHoursStatus from "./BusinessHoursStatus";
import { useBusinessHoursContext } from "@/contexts/BusinessHoursContext";
import { supabase } from "@/integrations/supabase/client";

interface ContactContent {
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
  hours: string;
  backgroundImage?: string;
}

const Contact = () => {
  const { toast } = useToast();
  const { formattedHours } = useBusinessHoursContext();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "",
    message: ""
  });

  const [availableSeats, setAvailableSeats] = useState(50); // Default value
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [contactContent, setContactContent] = useState<ContactContent>({
    address: "Corso Regina Margherita, 53/b, 10124, Torino TO, Italia",
    phone: "0110769211",
    email: "anilamyzyri@gmail.com",
    mapUrl: "https://maps.google.com",
    hours: "Lun-Gio: 12:00-14:30, 18:00-00:00\nVen: 12:00-14:30, 18:30-02:00\nSab: 18:30-02:00\nDom: 12:00-14:30, 18:00-00:00"
  });
  
  // Load contact content from database
  const loadContactContent = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'contactContent')
        .single();

      if (error) {
        console.error('Error loading contact content:', error);
        return;
      }

      if (data?.value) {
        setContactContent(prev => ({
          ...prev,
          ...data.value
        }));
      }
    } catch (error) {
      console.error('Failed to load contact content:', error);
    }
  };

  useEffect(() => {
    // Load contact content from database
    loadContactContent();

    // Get restaurant settings from localStorage if available
    const settings = localStorage.getItem('restaurantSettings');
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        if (parsedSettings.totalSeats) {
          setAvailableSeats(parsedSettings.totalSeats);
        }
      } catch (e) {
        console.error('Failed to parse restaurant settings');
      }
    }

    // Get today's date for min date
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date') as HTMLInputElement;
    if (dateInput) {
      dateInput.min = today;
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Form validation
    if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.guests) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // Validate guests count
    const guestsCount = parseInt(formData.guests, 10);
    if (isNaN(guestsCount) || guestsCount <= 0) {
      toast({
        title: "Invalid guests count",
        description: "Please enter a valid number of guests",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    if (guestsCount > availableSeats) {
      toast({
        title: "Not enough seats available",
        description: `Sorry, we can only accommodate up to ${availableSeats} guests per reservation`,
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // In a real app, this would send data to a backend and check actual availability
    // Save reservation to localStorage for demo purposes
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const newReservation = {
      id: Date.now(),
      ...formData,
      status: 'pending'
    };
    
    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    toast({
      title: "Reservation Requested",
      description: `Thank you ${formData.name}! Your reservation for ${formData.guests} guests on ${formData.date} at ${formData.time} has been received.`,
    });
    
    // Reset form
    setFormData({
      name: "",
      phone: "",
      date: "",
      time: "",
      guests: "",
      message: ""
    });
    setIsSubmitting(false);
  };
  
  // Create a style object for the background
  const sectionStyle = {
    backgroundImage: contactContent.backgroundImage ? 
      `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('${contactContent.backgroundImage}')` : 
      undefined,
    backgroundSize: contactContent.backgroundImage ? 'cover' : undefined,
    backgroundPosition: contactContent.backgroundImage ? 'center' : undefined,
  };
  
  return (
    <section 
      id="contact" 
      className="py-24 text-white relative bg-persian-new-pattern" 
      style={sectionStyle}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl text-center font-playfair font-bold mb-2 text-white">
          Contact <span className="text-persian-gold">Us</span>
        </h2>
        <p className="text-center text-gray-300 mb-10 max-w-3xl mx-auto">
          Ci piacerebbe sentirti e accoglierti nel nostro negozio di fiori
        </p>
        
        <PatternDivider className="opacity-70" />
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-persian-navy/50 p-6 rounded-lg backdrop-blur shimmer">
            <h3 className="text-2xl font-playfair text-persian-gold mb-6">Fai un Ordine</h3>

            <div className="space-y-4">
              <p className="text-gray-300 mb-6">
                Scegli come vuoi ordinare: dai nostri prodotti disponibili o con una richiesta personalizzata.
              </p>

              <Button
                onClick={() => setIsOrderModalOpen(true)}
                className="bg-persian-gold text-persian-navy hover:bg-persian-gold/90 w-full py-3 text-lg font-semibold"
              >
                Inizia il Tuo Ordine
              </Button>

              {/* Business Hours Status */}
              <div className="mt-4">
                <BusinessHoursStatus variant="banner" />
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-persian-navy/50 p-6 rounded-lg backdrop-blur mb-6 shimmer">
              <h3 className="text-2xl font-playfair text-persian-gold mb-6">Find Us</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="text-persian-gold mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-gray-300">{contactContent.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-persian-gold mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-gray-300">{contactContent.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-persian-gold mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-gray-300">{contactContent.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-persian-gold mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-medium">Hours</h4>
                    <p className="text-gray-300 whitespace-pre-line">{contactContent.hours || formattedHours}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-persian-navy/50 p-6 rounded-lg backdrop-blur shimmer">
              <h3 className="text-2xl font-playfair text-persian-gold mb-4">Newsletter</h3>
              <p className="text-gray-300 mb-4">Subscribe to receive updates on special events and promotions</p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Your email address"
                  className="bg-white/10 border-persian-gold/30 text-white placeholder:text-gray-400"
                />
                <Button 
                  className="bg-persian-gold text-persian-navy hover:bg-persian-gold/90"
                  onClick={() => toast({ title: "Subscribed!", description: "Thank you for subscribing to our newsletter." })}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <OrderOptionsModal
      isOpen={isOrderModalOpen}
      onClose={() => setIsOrderModalOpen(false)}
    />
  );
};

export default Contact;
