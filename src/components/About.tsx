
import React, { useState, useEffect } from 'react';
import { Pizza, ChefHat, Clock, Star, Flower } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { supabase } from '@/integrations/supabase/client';

const About = () => {
  const { language, t } = useLanguage();
  const [aboutContent, setAboutContent] = useState(null);

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

    loadAboutContent();
  }, []);

  // Multilingual content
  const content = {
    it: {
      title: 'Chi Siamo - Pizzeria Regina 2000',
      storyTitle: 'La Nostra Storia',
      paragraph1: 'Pizzeria Regina 2000 nasce dalla passione per l\'autentica tradizione italiana e dall\'esperienza culinaria tramandata nel tempo. Dal 2000, offriamo pizza italiana preparata con amore, ingredienti freschi e il nostro forno a legna tradizionale.',
      paragraph2: 'Le nostre pizze nascono da una profonda passione per la tradizione culinaria italiana. Solo ingredienti selezionati, solo autenticità made in Torino. 🍕 Situati nel cuore di Torino, offriamo esperienza artigianale e passione per la vera pizza italiana.',
      quote: '📍 Trovaci nel centro di Torino – dove la tradizione italiana incontra l\'ospitalità piemontese.',
      quoteAuthor: 'Un viaggio tra sapori, tradizione e autenticità',
      servicesTitle: 'Nella nostra pizzeria puoi trovare:',
      services: [
        'Pizza italiana cotta nel forno a legna',
        'Ingredienti freschi e di prima qualità',
        'Impasto preparato quotidianamente con lievitazione naturale',
        'Servizio per eventi, feste e catering personalizzato'
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
      title: 'About Francesco Fiori & Piante',
      storyTitle: 'Our Story',
      paragraph1: 'Francesco Fiori & Piante was born from a passion for natural beauty and artisanal experience passed down through time. From the most delicate moments like funerals, to the most beautiful days like weddings, we offer floral arrangements created with love and care.',
      paragraph2: 'Our creations are born from a deep passion for natural beauty. Only selected flowers, only elegance made in Turin. 🌼 Located inside the Porta Palazzo Market, we offer artisanal experience and passion for natural beauty.',
      quote: '📍 Find us at Porta Palazzo, Turin – in the heart of the city\'s most vibrant and colorful market.',
      quoteAuthor: 'A journey through scents, colors and floral harmonies',
      servicesTitle: 'In our shop you can find:',
      services: [
        'Fresh flowers for every occasion',
        'Indoor and outdoor plants to decorate with nature',
        'High quality fake flowers, ideal for long-lasting decorations',
        'Tailor-made floral services for ceremonies, events, and environments'
      ],
      stats: {
        years: 'Years Experience',
        customers: 'Happy Customers',
        varieties: 'Flower Varieties'
      },
      closingMessage: 'Come visit us at Francesco Fiori & Piante and bring a touch of nature into your life.',
      tagline: 'Creating beauty, one flower at a time'
    },
    fr: {
      title: 'À Propos de Francesco Fiori & Piante',
      storyTitle: 'Notre Histoire',
      paragraph1: 'Francesco Fiori & Piante est né d\'une passion pour la beauté naturelle et l\'expérience artisanale transmise à travers le temps. Des moments les plus délicats comme les funérailles, aux plus beaux jours comme les mariages, nous offrons des arrangements floraux créés avec amour et soin.',
      paragraph2: 'Nos créations naissent d\'une passion profonde pour la beauté naturelle. Seulement des fleurs sélectionnées, seulement l\'élégance made in Turin. 🌼 Situés à l\'intérieur du Marché de Porta Palazzo, nous offrons une expérience artisanale et une passion pour la beauté naturelle.',
      quote: '📍 Trouvez-nous à Porta Palazzo, Turin – au cœur du marché le plus vivant et coloré de la ville.',
      quoteAuthor: 'Un voyage à travers les parfums, couleurs et harmonies florales',
      servicesTitle: 'Dans notre boutique vous pouvez trouver:',
      services: [
        'Fleurs fraîches pour chaque occasion',
        'Plantes d\'intérieur et d\'extérieur pour décorer avec la nature',
        'Fleurs artificielles de haute qualité, idéales pour des décorations durables',
        'Services floraux sur mesure pour cérémonies, événements et environnements'
      ],
      stats: {
        years: 'Années d\'Expérience',
        customers: 'Clients Satisfaits',
        varieties: 'Variétés de Fleurs'
      },
      closingMessage: 'Venez nous rendre visite chez Francesco Fiori & Piante et apportez une touche de nature dans votre vie.',
      tagline: 'Créer la beauté, une fleur à la fois'
    },
    ar: {
      title: 'حول فرانشيسكو فيوري وبيانتي',
      storyTitle: 'قصتنا',
      paragraph1: 'ولد فرانشيسكو فيوري وبيانتي من شغف بالجمال الطبيعي والخبرة الحرفية المتوارثة عبر الزمن. من اللحظات الأكثر حساسية مثل الجنازات، إلى أجمل الأيام مثل حفلات الزفاف، نقدم تنسيقات زهرية مصنوعة بحب وعناية.',
      paragraph2: 'إبداعاتنا تولد من شغف عميق بالجمال الطبيعي. فقط زهور مختارة، فقط أناقة صنع في تورين. 🌼 تقع داخل سوق بورتا بالازو، نقدم خبرة حرفية وشغف بالجمال الطبيعي.',
      quote: '📍 اعثر علينا في بورتا بالازو، تورين – في قلب أكثر أسواق المدينة حيوية وألوانًا.',
      quoteAuthor: 'رحلة عبر العطور والألوان والتناغمات الزهرية',
      servicesTitle: 'في متجرنا يمكنك أن تجد:',
      services: [
        'زهور طازجة لكل مناسبة',
        'نباتات داخلية وخارجية للتزيين بالطبيعة',
        'زهور صناعية عالية الجودة، مثالية للديكورات طويلة الأمد',
        'خدمات زهرية مخصصة للاحتفالات والفعاليات والبيئات'
      ],
      stats: {
        years: 'سنوات الخبرة',
        customers: 'عملاء سعداء',
        varieties: 'أنواع الزهور'
      },
      closingMessage: 'تعال لزيارتنا في فرانشيسكو فيوري وبيانتي وأضف لمسة من الطبيعة إلى حياتك.',
      tagline: 'نخلق الجمال، زهرة واحدة في كل مرة'
    },
    fa: {
      title: 'درباره فرانچسکو فیوری و پیانته',
      storyTitle: 'داستان ما',
      paragraph1: 'فرانچسکو فیوری و پیانته از عشق به زیبایی طبیعی و تجربه صنعتگری که در طول زمان منتقل شده، متولد شد. از حساس‌ترین لحظات مانند تشییع جنازه، تا زیباترین روزها مانند عروسی، ما تنظیمات گل ارائه می‌دهیم که با عشق و مراقبت ساخته شده‌اند.',
      paragraph2: 'آثار ما از عشق عمیق به زیبایی طبیعی متولد می‌شوند. فقط گل‌های انتخابی، فقط ظرافت ساخت تورین. 🌼 واقع در داخل بازار پورتا پالازو، ما تجربه صنعتگری و عشق به زیبایی طبیعی ارائه می‌دهیم.',
      quote: '📍 ما را در پورتا پالازو، تورین پیدا کنید – در قلب پر جنب و جوش‌ترین و رنگارنگ‌ترین بازار شهر.',
      quoteAuthor: 'سفری در میان عطرها، رنگ‌ها و هارمونی‌های گل',
      servicesTitle: 'در فروشگاه ما می‌توانید پیدا کنید:',
      services: [
        'گل‌های تازه برای هر مناسبت',
        'گیاهان داخلی و خارجی برای تزیین با طبیعت',
        'گل‌های مصنوعی با کیفیت بالا، ایده‌آل برای تزیینات بادوام',
        'خدمات گل سفارشی برای مراسم، رویدادها و محیط‌ها'
      ],
      stats: {
        years: 'سال تجربه',
        customers: 'مشتریان خوشحال',
        varieties: 'انواع گل'
      },
      closingMessage: 'برای دیدن ما به فرانچسکو فیوری و پیانته بیایید و لمسی از طبیعت را به زندگی‌تان بیاورید.',
      tagline: 'خلق زیبایی، یک گل در هر زمان'
    }
  };

  const currentContent = content[language] || content.it;
  const image = 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

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
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-peach-600 to-coral-600 font-playfair">20+</div>
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
                  src={image}
                  alt="Francesco Florist at work"
                  className="rounded-xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-white to-peach-50 p-6 rounded-xl shadow-lg border border-peach-200 max-w-sm">
                <p className="text-sm font-semibold text-gray-800 font-playfair mb-3">{currentContent.quote}</p>
                {currentContent.quote && (
                  <ul className="text-xs text-gray-600 font-inter space-y-1">
                    {currentContent.services.map((service, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-peach-500 mr-2">•</span>
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {currentContent.quoteAuthor && (
                  <p className="text-xs text-gray-600 font-inter italic mt-2">{currentContent.quoteAuthor}</p>
                )}
              </div>
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
