
import React, { useState, useEffect } from 'react';
import { Pizza, ChefHat, Clock, Star, Flower } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { supabase } from '@/integrations/supabase/client';

const About = () => {
  const { language, t } = useLanguage();
  const [aboutContent, setAboutContent] = useState(null);
  const [chiSiamoContent, setChiSiamoContent] = useState(null);
  const [chiSiamoImage, setChiSiamoImage] = useState({
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    alt: 'Pizzeria Regina 2000 - La nostra storia'
  });

  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'aboutContent')
          .single();

        if (!error && data?.value) {
          setAboutContent(data.value);
        }
      } catch (error) {
        console.log('About content not found in database, using default');
      }
    };

    const loadChiSiamoContent = async () => {
      try {
        console.log('🔄 [About] Loading Chi Siamo content from database...');
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'chiSiamoContent')
          .single();

        if (!error && data?.value) {
          console.log('✅ [About] Chi Siamo content loaded:', data.value);
          setChiSiamoContent(data.value);
        } else {
          console.log('⚠️ [About] No Chi Siamo content found, using default');
        }
      } catch (error) {
        console.error('❌ [About] Error loading Chi Siamo content:', error);
      }
    };

    const loadChiSiamoImage = async () => {
      try {
        console.log('🔄 [About] Loading Chi Siamo image from database...');
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'chiSiamoImage')
          .single();

        if (!error && data?.value) {
          console.log('✅ [About] Chi Siamo image loaded:', data.value);
          setChiSiamoImage(data.value);
        } else {
          console.log('⚠️ [About] No Chi Siamo image found, using default');
        }
      } catch (error) {
        console.error('❌ [About] Error loading Chi Siamo image:', error);
      }
    };

    loadAboutContent();
    loadChiSiamoContent();
    loadChiSiamoImage();

    // Set up real-time listener for Chi Siamo content and image changes
    const timestamp = Date.now();
    const channelName = `chi-siamo-updates-${timestamp}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'regina',
        table: 'settings',
        filter: 'key=eq.chiSiamoImage'
      }, async (payload) => {
        console.log('🔔 [About] Real-time Chi Siamo image update received from admin');
        if (payload.new?.value) {
          setChiSiamoImage(payload.new.value);
          console.log('✅ [About] Chi Siamo image updated from real-time change');
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'regina',
        table: 'settings',
        filter: 'key=eq.chiSiamoContent'
      }, async (payload) => {
        console.log('🔔 [About] Real-time Chi Siamo content update received from admin');
        if (payload.new?.value) {
          setChiSiamoContent(payload.new.value);
          console.log('✅ [About] Chi Siamo content updated from real-time change');
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Multilingual content
  const content = {
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
      tagline: 'Creiamo bellezza, un fiore alla volta'
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
    },
    fr: {
      title: 'À Propos de Pizzeria Regina 2000',
      storyTitle: 'Notre Histoire',
      paragraph1: 'Pizzeria Regina 2000 est née d\'une passion pour la tradition italienne authentique et l\'expérience culinaire transmise à travers le temps. Depuis 2000, nous offrons de la pizza italienne préparée avec amour, des ingrédients frais et notre four à bois traditionnel.',
      paragraph2: 'Nos pizzas naissent d\'une passion profonde pour la tradition culinaire italienne. Seulement des ingrédients sélectionnés, seulement l\'authenticité made in Turin. 🍕 Situés au cœur de Turin, nous offrons une expérience artisanale et une passion pour la vraie pizza italienne.',
      quote: '📍 Trouvez-nous au centre de Turin – où la tradition italienne rencontre l\'hospitalité piémontaise.',
      quoteAuthor: 'Un voyage à travers les saveurs, la tradition et l\'authenticité',
      servicesTitle: 'Dans notre pizzeria vous pouvez trouver:',
      services: [
        'Pizza italienne cuite au four à bois',
        'Ingrédients frais et de première qualité',
        'Pâte préparée quotidiennement avec levage naturel',
        'Service pour événements et fêtes personnalisé'
      ],
      stats: {
        years: 'Années d\'Expérience',
        customers: 'Clients Satisfaits',
        varieties: 'Variétés de Pizzas'
      },
      closingMessage: 'Venez nous rendre visite à Pizzeria Regina 2000 et découvrez le vrai goût de la tradition italienne.',
      tagline: 'Créer des saveurs authentiques, une pizza à la fois'
    },
    ar: {
      title: 'حول بيتزيريا ريجينا 2000',
      storyTitle: 'قصتنا',
      paragraph1: 'ولدت بيتزيريا ريجينا 2000 من شغف بالتقاليد الإيطالية الأصيلة والخبرة الطهوية المتوارثة عبر الزمن. منذ عام 2000، نقدم البيتزا الإيطالية المحضرة بحب، مع مكونات طازجة وفرننا التقليدي الذي يعمل بالحطب.',
      paragraph2: 'بيتزاتنا تولد من شغف عميق بالتقاليد الطهوية الإيطالية. فقط مكونات مختارة، فقط أصالة صنع في تورين. 🍕 تقع في قلب تورين، نقدم خبرة حرفية وشغف بالبيتزا الإيطالية الأصيلة.',
      quote: '📍 اعثر علينا في وسط تورين – حيث تلتقي التقاليد الإيطالية بالضيافة البيدمونتية.',
      quoteAuthor: 'رحلة عبر النكهات والتقاليد والأصالة',
      servicesTitle: 'في بيتزيريتنا يمكنك أن تجد:',
      services: [
        'بيتزا إيطالية مطبوخة في فرن الحطب',
        'مكونات طازجة وعالية الجودة',
        'عجين محضر يومياً مع تخمير طبيعي',
        'خدمة للفعاليات والحفلات والتموين المخصص'
      ],
      stats: {
        years: 'سنوات الخبرة',
        customers: 'عملاء راضون',
        varieties: 'أنواع البيتزا'
      },
      closingMessage: 'تعال لزيارتنا في بيتزيريا ريجينا 2000 واكتشف الطعم الحقيقي للتقاليد الإيطالية.',
      tagline: 'نخلق نكهات أصيلة، بيتزا واحدة في كل مرة'
    },
    fa: {
      title: 'درباره پیتزریا رجینا 2000',
      storyTitle: 'داستان ما',
      paragraph1: 'پیتزریا رجینا 2000 از عشق به سنت‌های اصیل ایتالیایی و تجربه آشپزی که در طول زمان منتقل شده، متولد شد. از سال 2000، ما پیتزای ایتالیایی تهیه شده با عشق، مواد تازه و کوره سنتی هیزمی خود ارائه می‌دهیم.',
      paragraph2: 'پیتزاهای ما از عشق عمیق به سنت‌های آشپزی ایتالیایی متولد می‌شوند. فقط مواد انتخابی، فقط اصالت ساخت تورین. 🍕 واقع در قلب تورین، ما تجربه صنعتگری و عشق به پیتزای اصیل ایتالیایی ارائه می‌دهیم.',
      quote: '📍 ما را در مرکز تورین پیدا کنید – جایی که سنت ایتالیایی با مهمان‌نوازی پیدمونتی ملاقات می‌کند.',
      quoteAuthor: 'سفری در میان طعم‌ها، سنت و اصالت',
      servicesTitle: 'در پیتزریای ما می‌توانید پیدا کنید:',
      services: [
        'پیتزای ایتالیایی پخته شده در کوره هیزمی',
        'مواد تازه و با کیفیت بالا',
        'خمیر تهیه شده روزانه با تخمیر طبیعی',
        'خدمات برای رویدادها، جشن‌ها و کترینگ شخصی‌سازی شده'
      ],
      stats: {
        years: 'سال تجربه',
        customers: 'مشتریان راضی',
        varieties: 'انواع پیتزا'
      },
      closingMessage: 'برای دیدن ما به پیتزریا رجینا 2000 بیایید و طعم واقعی سنت ایتالیایی را کشف کنید.',
      tagline: 'خلق طعم‌های اصیل، یک پیتزا در هر زمان'
    }
  };

  // Use database content if available, otherwise fallback to hardcoded content
  const currentContent = chiSiamoContent
    ? (chiSiamoContent[language] || chiSiamoContent.it)
    : (content[language] || content.it);

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-pizza-cream via-white to-pizza-orange/10 relative overflow-hidden">
      {/* Pizza-themed background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pizza-red rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pizza-orange rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pizza-green rounded-full blur-xl animate-pulse animation-delay-4000"></div>
      </div>



      {/* Floating pizza icons */}
      <div className="absolute top-20 right-20 text-pizza-orange/20 animate-float">
        <ChefHat size={50} />
      </div>
      <div className="absolute bottom-20 left-20 text-pizza-red/20 animate-float animation-delay-2000">
        <Pizza size={40} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Pizza className="text-pizza-red animate-pizza-spin" size={48} />
              <ChefHat className="text-pizza-orange animate-tomato-bounce" size={48} />
              <Pizza className="text-pizza-green animate-pizza-spin animation-delay-2000" size={48} />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-pizza-dark mb-6 font-fredoka">
              👨‍🍳 {currentContent.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h3 className="text-2xl md:text-3xl font-semibold text-pizza-dark mb-6 font-pacifico flex items-center">
                🍕 {currentContent.storyTitle}
              </h3>
              <p className="text-pizza-brown mb-6 leading-relaxed font-roboto text-lg">
                {currentContent.paragraph1}
              </p>
              <p className="text-pizza-brown mb-6 leading-relaxed font-roboto text-lg">
                {currentContent.paragraph2}
              </p>

              {/* Services Section */}
              <div className="mb-6">
                <h4 className="text-xl font-semibold text-pizza-dark mb-4 font-fredoka flex items-center">
                  🏪 {currentContent.servicesTitle}
                </h4>
                <ul className="space-y-3">
                  {currentContent.services.map((service, index) => (
                    <li key={index} className="flex items-start gap-3 text-pizza-brown font-roboto">
                      <div className="w-3 h-3 bg-gradient-to-r from-pizza-red to-pizza-orange rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <span className="text-lg">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center p-4 bg-gradient-to-br from-peach-50 to-coral-50 rounded-xl">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-peach-600 to-coral-600 font-playfair">14</div>
                  <div className="text-sm text-gray-600 font-inter">{currentContent.stats.years}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-700 font-playfair">5000+</div>
                  <div className="text-sm text-gray-600 font-inter">{currentContent.stats.customers}</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-coral-600 font-playfair">100+</div>
                  <div className="text-sm text-gray-600 font-inter">{currentContent.stats.varieties}</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={chiSiamoImage.image}
                  alt={chiSiamoImage.alt}
                  className="rounded-xl w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* REMOVED: The overlay panel that was here */}
            </div>
          </div>

          {/* Closing Message */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-white to-peach-50 p-8 rounded-2xl shadow-lg border border-peach-200 max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 font-inter leading-relaxed mb-4">
                {currentContent.closingMessage}
              </p>
              <div className="flex items-center justify-center gap-2 text-peach-600">
                <Flower size={20} />
                <span className="text-sm font-medium">{currentContent.tagline}</span>
                <Flower size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
