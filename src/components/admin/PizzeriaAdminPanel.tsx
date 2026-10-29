import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  LayoutDashboard,
  Pizza,
  PackageCheck,
  Globe,
  Sparkles,
  BadgePercent,
  Users,
  Palette,
  Images,
  Video,
  MessageSquareQuote,
  Megaphone,
  Settings,
  Clock,
  Truck,
  CreditCard,
  Bell,
  Wrench,
  Database,
  ExternalLink,
  LogOut,
  ShoppingCart,
  Menu as MenuIcon,
  X,
  Search,
  ChevronRight,
  TrendingUp,
  Store,
  ShieldCheck,
  Loader2,
  Activity,
  Volume2
} from 'lucide-react';

// Lazy-load individual modules for optimal performance
const ProductsAdmin = lazy(() => import('./ProductsAdmin').catch(() => ({ default: () => <div>Error loading ProductsAdmin</div> })));
const ContentEditor = lazy(() => import('./ContentEditor').catch(() => ({ default: () => <div>Error loading ContentEditor</div> })));
const HeroContentEditor = lazy(() => import('./HeroContentEditor').catch(() => ({ default: () => <div>Error loading HeroContentEditor</div> })));
const LogoEditor = lazy(() => import('./LogoEditor').catch(() => ({ default: () => <div>Error loading LogoEditor</div> })));
const GalleryManager = lazy(() => import('./GalleryManager').catch(() => ({ default: () => <div>Error loading GalleryManager</div> })));
const YouTubeManager = lazy(() => import('./YouTubeManager').catch(() => ({ default: () => <div>Error loading YouTubeManager</div> })));
const CommentsManager = lazy(() => import('./CommentsManager').catch(() => ({ default: () => <div>Error loading CommentsManager</div> })));
const PopupManager = lazy(() => import('./PopupManager').catch(() => ({ default: () => <div>Error loading PopupManager</div> })));
const SettingsManager = lazy(() => import('./SettingsManager').catch(() => ({ default: () => <div>Error loading SettingsManager</div> })));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard').catch(() => ({ default: () => <div>Error loading AnalyticsDashboard</div> })));
const WeOfferManager = lazy(() => import('./WeOfferManager').catch(() => ({ default: () => <div>Error loading WeOfferManager</div> })));
const ChiSiamoImageManager = lazy(() => import('./ChiSiamoImageManager').catch(() => ({ default: () => <div>Error loading ChiSiamoImageManager</div> })));
const ChiSiamoContentManager = lazy(() => import('./ChiSiamoContentManager').catch(() => ({ default: () => <div>Error loading ChiSiamoContentManager</div> })));
const SystemTest = lazy(() => import('./SystemTest').catch(() => ({ default: () => <div>Error loading SystemTest</div> })));
const DatabaseTest = lazy(() => import('./DatabaseTest').catch(() => ({ default: () => <div>Error loading DatabaseTest</div> })));
const SystemConnectionTest = lazy(() => import('../SystemConnectionTest').catch(() => ({ default: () => <div>Error loading SystemConnectionTest</div> })));
const YouTubeConnectionTest = lazy(() => import('../YouTubeConnectionTest').catch(() => ({ default: () => <div>Error loading YouTubeConnectionTest</div> })));
const BusinessHoursManager = lazy(() => import('./BusinessHoursManager').catch(() => ({ default: () => <div>Error loading BusinessHoursManager</div> })));
const ShippingZoneManager = lazy(() => import('./ShippingZoneManager').catch(() => ({ default: () => <div>Error loading ShippingZoneManager</div> })));
const IOSAudioTest = lazy(() => import('../IOSAudioTest').catch(() => ({ default: () => <div>Error loading IOSAudioTest</div> })));
const StripeSettings = lazy(() => import('./StripeSettings').catch(() => ({ default: () => <div>Error loading StripeSettings</div> })));
const NotificationSettings = lazy(() => import('./NotificationSettings').catch(() => ({ default: () => <div>Error loading NotificationSettings</div> })));
const DatabaseSchemaUpdater = lazy(() => import('./DatabaseSchemaUpdater').catch(() => ({ default: () => <div>Error loading DatabaseSchemaUpdater</div> })));
const ProductsDebugger = lazy(() => import('../ProductsDebugger').catch(() => ({ default: () => <div>Error loading ProductsDebugger</div> })));
const MenuProductsConnectionTest = lazy(() => import('../MenuProductsConnectionTest').catch(() => ({ default: () => <div>Error loading MenuProductsConnectionTest</div> })));
const ProductsSchemaFixer = lazy(() => import('../ProductsSchemaFixer').catch(() => ({ default: () => <div>Error loading ProductsSchemaFixer</div> })));
const FrontendConnectionTester = lazy(() => import('../FrontendConnectionTester').catch(() => ({ default: () => <div>Error loading FrontendConnectionTester</div> })));
const BulkStockManager = lazy(() => import('./BulkStockManager').catch(() => ({ default: () => <div>Error loading BulkStockManager</div> })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-500">
    <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-3" />
    <span className="text-sm font-medium">Caricamento modulo in corso...</span>
  </div>
);

// Navigation group type definitions
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  description: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Panoramica',
    items: [
      {
        id: 'dashboard',
        label: 'Cruscotto & Statistiche',
        icon: LayoutDashboard,
        description: 'Metriche vendite, performance e accessi rapidi'
      }
    ]
  },
  {
    title: 'Catalogo & Menu',
    items: [
      {
        id: 'products',
        label: 'Menu & Prodotti',
        icon: Pizza,
        badge: '53 Articoli',
        description: 'Gestione pizze, categorie, prezzi e descrizioni'
      },
      {
        id: 'stock',
        label: 'Disponibilità & Stock',
        icon: PackageCheck,
        description: 'Controllo disponibilità immediata e quantità'
      }
    ]
  },
  {
    title: 'Sito & Contenuti',
    items: [
      {
        id: 'hero',
        label: 'Hero & Copertina',
        icon: Sparkles,
        description: 'Titoli principali, slogan e sfondo hero'
      },
      {
        id: 'offers',
        label: 'Offerte "We Offer"',
        icon: BadgePercent,
        description: '3 schede promozionali in evidenza'
      },
      {
        id: 'about',
        label: 'Chi Siamo & Storia',
        icon: Users,
        description: 'Testi multilingua e foto del pizzaiolo'
      },
      {
        id: 'gallery',
        label: 'Galleria Fotografica',
        icon: Images,
        description: 'Foto del locale, delle pizze e del forno'
      },
      {
        id: 'youtube',
        label: 'Video YouTube',
        icon: Video,
        description: 'Video streaming e video promozionali'
      },
      {
        id: 'logo',
        label: 'Logo & Brand Identity',
        icon: Palette,
        description: 'Logo testata e favicon'
      }
    ]
  },
  {
    title: 'Clienti & Marketing',
    items: [
      {
        id: 'comments',
        label: 'Recensioni & Commenti',
        icon: MessageSquareQuote,
        description: 'Moderazione commenti dei clienti sul sito'
      },
      {
        id: 'popups',
        label: 'Avvisi & Banner Popup',
        icon: Megaphone,
        description: 'Comunicazioni urgenti, ferie e festività'
      }
    ]
  },
  {
    title: 'Configurazioni Negozio',
    items: [
      {
        id: 'settings-hours',
        label: 'Orari di Apertura',
        icon: Clock,
        description: 'Fasce pranzo e cena per ogni giorno'
      },
      {
        id: 'settings-shipping',
        label: 'Zone di Consegna (Free OSM)',
        icon: Truck,
        badge: 'Free Map',
        description: 'Zone chilometriche, tariffe e raggio max'
      },
      {
        id: 'settings-stripe',
        label: 'Pagamenti Stripe',
        icon: CreditCard,
        description: 'Configurazione pagamenti con carta'
      },
      {
        id: 'settings-notifications',
        label: 'Notifiche & Allarmi',
        icon: Bell,
        description: 'Suoni e avvisi per nuovi ordini'
      },
      {
        id: 'settings-general',
        label: 'Info Ristorante & Contatti',
        icon: Settings,
        description: 'Telefono, email, indirizzo e capienza'
      }
    ]
  },
  {
    title: 'Strumenti & Diagnostica',
    items: [
      {
        id: 'tools-system',
        label: 'Test di Sistema',
        icon: Activity,
        description: 'Diagnostica connessioni backend e notifiche'
      },
      {
        id: 'tools-database',
        label: 'Database & Schema',
        icon: Database,
        description: 'Aggiornamento schema e debugger prodotti'
      }
    ]
  }
];

export const PizzeriaAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const { handleLogout } = useAdminAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('it-IT', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter navigation items by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS;
    const q = searchQuery.toLowerCase();
    return NAV_GROUPS.map(group => ({
      ...group,
      items: group.items.filter(
        item => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      )
    })).filter(group => group.items.length > 0);
  }, [searchQuery]);

  // Find active item details for breadcrumbs
  const currentItem = useMemo(() => {
    for (const group of NAV_GROUPS) {
      const found = group.items.find(item => item.id === activeTab);
      if (found) return { ...found, groupTitle: group.title };
    }
    return { id: 'dashboard', label: 'Cruscotto', icon: LayoutDashboard, description: '', groupTitle: 'Panoramica' };
  }, [activeTab]);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-red-500 selection:text-white">
      {/* ============================================================== */}
      {/* SIDEBAR NAVIGATION (Modern Slate/Zinc Theme) */}
      {/* ============================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-950/40">
              <Pizza className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Regina 2000
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  Admin
                </span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-medium text-slate-400">Torino Centro</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar in Sidebar */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Cerca sezione..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:ring-red-500 focus-visible:border-red-500 rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Item Tree */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-red-600 text-white shadow-md shadow-red-950/40 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
          {/* Quick Direct Link to Live Orders */}
          <Button
            onClick={() => window.open('/ordini', '_blank')}
            className="w-full h-9 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Pannello Ordini</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Button>

          {/* User Profile & Logout */}
          <div className="pt-1 flex items-center justify-between px-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
                A
              </div>
              <div className="truncate">
                <p className="text-slate-200 font-medium truncate leading-tight">Amministratore</p>
                <p className="text-[10px] text-slate-500 leading-tight">Sessione Attiva</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Esci dall'account"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* ============================================================== */}
      {/* MAIN VIEWPORT */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-slate-500 font-medium">{currentItem.groupTitle}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-white font-semibold flex items-center gap-1.5">
                <currentItem.icon className="h-4 w-4 text-red-500" />
                {currentItem.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentDateTime}</span>
            </div>

            {/* View Live Website Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="h-8 text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg flex items-center gap-1.5"
            >
              <Store className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vedi Negozio Live</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>

            {/* Quick Live Orders CTA Button */}
            <Button
              size="sm"
              onClick={() => window.open('/ordini', '_blank')}
              className="h-8 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Ordini Live</span>
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* ============================================================== */}
          {/* TAB: DASHBOARD */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Hero Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-950 to-slate-900 border border-red-900/30 p-6 md:p-8 shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
                      <Sparkles className="h-3.5 w-3.5" />
                      Pannello di Controllo Pizzeria Regina 2000
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      Benvenuto nel gestionale, Amministratore!
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 max-w-xl">
                      Da qui puoi controllare il menu completo di 53 prodotti, aggiornare stock, prezzi,
                      personalizzare contenuti visivi e gestire consegne a domicilio a Torino.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => window.open('/ordini', '_blank')}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg text-sm px-5 h-10 rounded-xl flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Schermata Ordini Attivi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('products')}
                      className="bg-slate-900/80 border-slate-700 hover:bg-slate-800 text-white text-sm px-4 h-10 rounded-xl flex items-center gap-2"
                    >
                      <Pizza className="h-4 w-4 text-red-400" />
                      Gestisci Menu
                    </Button>
                  </div>
                </div>
              </div>

              {/* KPI Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Menu Prodotti</span>
                    <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                      <Pizza className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">53 Articoli</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>Tutti convertiti in WebP & CDN</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Validazione Indirizzi</span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Truck className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">Free OSM</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Photon Geocoder Attivo</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Raggio Consegna</span>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                      <Store className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">15 Km Max</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
                    <span>Torino & Comuni limitrofi</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Pagamenti Online</span>
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mt-2">Stripe</div>
                  <div className="text-xs text-purple-400 flex items-center gap-1 mt-1 font-medium">
                    <span>Carta di credito / Apple Pay</span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Accessi Rapidi alle Funzionalità
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-red-500/50 hover:bg-slate-950 text-left transition-all group flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
                      <Pizza className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm group-hover:text-red-400 transition-colors">
                        Modifica Menu & Pizze
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Aggiungi nuove pizze, aggiorna prezzi, ingredienti e categorie.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('stock')}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950 text-left transition-all group flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                      <PackageCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm group-hover:text-emerald-400 transition-colors">
                        Disponibilità Stock Rapida
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Attiva o disattiva istantaneamente prodotti esauriti per la serata.
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings-shipping')}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-950 text-left transition-all group flex items-start gap-4"
                  >
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                      <Truck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors">
                        Tariffe e Zone di Consegna
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Configura zone chilometriche da Corso Regina Margherita e soglia gratis.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Analytics Section Component */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Report & Analytics Dettagliati</h3>
                    <p className="text-xs text-slate-400">Statistiche di vendita e andamento ordini</p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <AnalyticsDashboard />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PRODUCTS & MENU */}
          {/* ============================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                      <Pizza className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Menu & Gestione Prodotti</h2>
                      <p className="text-xs text-slate-400">
                        Crea, modifica immagini WebP su CDN Supabase, imposta prezzi e descrizioni
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab('stock')}
                    variant="outline"
                    className="text-xs bg-slate-900 border-slate-800 text-slate-200 hover:text-white"
                  >
                    <PackageCheck className="h-4 w-4 mr-2 text-emerald-400" />
                    Passa a Gestione Stock
                  </Button>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <ProductsAdmin />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: STOCK MANAGEMENT */}
          {/* ============================================================== */}
          {activeTab === 'stock' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <PackageCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Disponibilità & Stock Prodotti</h2>
                    <p className="text-xs text-slate-400">
                      Imposta rapidamente la disponibilità di ingredienti e prodotti per il servizio odierno
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <BulkStockManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: HERO SECTION */}
          {/* ============================================================== */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Sezione Hero di Copertina</h2>
                    <p className="text-xs text-slate-400">
                      Modifica il titolo principale, sottotitolo e video/immagine di sfondo della testata
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <HeroContentEditor />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: WE OFFER SECTION */}
          {/* ============================================================== */}
          {activeTab === 'offers' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                    <BadgePercent className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Sezione "We Offer" (Offerte Speciali)</h2>
                    <p className="text-xs text-slate-400">
                      Personalizza i 3 riquadri di specialità (Pizza a Metro, Farina 5 Stagioni, Impasto)
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <WeOfferManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: ABOUT US (CHI SIAMO) */}
          {/* ============================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Sezione "Chi Siamo"</h2>
                    <p className="text-xs text-slate-400">
                      Modifica la storia della pizzeria in 4 lingue e la foto del maestro pizzaiolo
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="texts" className="space-y-6">
                  <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <TabsTrigger
                      value="texts"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      Testi Multilingua
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      Immagine Pizzaiolo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="texts">
                    <Suspense fallback={<LoadingSpinner />}>
                      <ChiSiamoContentManager />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="image">
                    <Suspense fallback={<LoadingSpinner />}>
                      <ChiSiamoImageManager />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: PHOTO GALLERY */}
          {/* ============================================================== */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Images className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Galleria Fotografica</h2>
                    <p className="text-xs text-slate-400">
                      Carica nuove foto in alta definizione per mostrare pizze, ingredienti e il locale
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <GalleryManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: YOUTUBE VIDEOS */}
          {/* ============================================================== */}
          {activeTab === 'youtube' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                    <Video className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Video YouTube</h2>
                    <p className="text-xs text-slate-400">
                      Gestisci i video promozionali e video shorts incorporati nel sito
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <YouTubeManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: LOGO & BRANDING */}
          {/* ============================================================== */}
          {activeTab === 'logo' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <Palette className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Logo & Identità Visiva</h2>
                    <p className="text-xs text-slate-400">
                      Carica e configura il logo principale della pizzeria e le icone
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <LogoEditor />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: COMMENTS & REVIEWS */}
          {/* ============================================================== */}
          {activeTab === 'comments' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400">
                    <MessageSquareQuote className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Recensioni & Commenti Clienti</h2>
                    <p className="text-xs text-slate-400">
                      Modera, approva o nascondi i feedback lasciati dai clienti della pizzeria
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <CommentsManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: POPUPS & ANNOUNCEMENTS */}
          {/* ============================================================== */}
          {activeTab === 'popups' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Popup & Avvisi Promo</h2>
                    <p className="text-xs text-slate-400">
                      Crea messaggi popup per chiusure festività, sconti speciali o promozioni
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <PopupManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: OPENING HOURS */}
          {/* ============================================================== */}
          {activeTab === 'settings-hours' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Orari di Apertura Settimanali</h2>
                    <p className="text-xs text-slate-400">
                      Configura gli orari per pranzo e cena; controlla la disponibilità degli ordini
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <BusinessHoursManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: SHIPPING & DELIVERY ZONES */}
          {/* ============================================================== */}
          {activeTab === 'settings-shipping' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-white">Zone di Consegna & Tariffe</h2>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        Free OpenStreetMap Attivo
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Geocodifica gratuita integrata: calcolo istantaneo delle distanze e costi di consegna
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <ShippingZoneManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: STRIPE PAYMENTS */}
          {/* ============================================================== */}
          {activeTab === 'settings-stripe' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Impostazioni Pagamento Stripe</h2>
                    <p className="text-xs text-slate-400">
                      Configura chiavi API Stripe e parametri di checkout per pagamenti con carta
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <StripeSettings />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: NOTIFICATIONS */}
          {/* ============================================================== */}
          {activeTab === 'settings-notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Notifiche & Allarmi Ordini</h2>
                    <p className="text-xs text-slate-400">
                      Configura suonerie, allarmi acustici e preferenze notifiche
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <NotificationSettings />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: GENERAL SETTINGS */}
          {/* ============================================================== */}
          {activeTab === 'settings-general' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-slate-800 text-slate-300">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Informazioni Ristorante & Contatti</h2>
                    <p className="text-xs text-slate-400">
                      Nome locale, recapiti telefonici, email, indirizzo civico e lingue attive
                    </p>
                  </div>
                </div>
                <Suspense fallback={<LoadingSpinner />}>
                  <SettingsManager />
                </Suspense>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: SYSTEM DIAGNOSTICS & TESTS */}
          {/* ============================================================== */}
          {activeTab === 'tools-system' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Diagnostica & Test Connessioni</h2>
                    <p className="text-xs text-slate-400">
                      Verifica rapida della connettività database, YouTube e audio notifiche iOS
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="system" className="space-y-6">
                  <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex-wrap h-auto gap-1">
                    <TabsTrigger
                      value="system"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      System Test
                    </TabsTrigger>
                    <TabsTrigger
                      value="database"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      Database Connect
                    </TabsTrigger>
                    <TabsTrigger
                      value="frontend"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      Frontend Connect
                    </TabsTrigger>
                    <TabsTrigger
                      value="youtube"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      YouTube
                    </TabsTrigger>
                    <TabsTrigger
                      value="audio"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      iOS Audio
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="system">
                    <Suspense fallback={<LoadingSpinner />}>
                      <SystemConnectionTest />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="database">
                    <Suspense fallback={<LoadingSpinner />}>
                      <DatabaseTest />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="frontend">
                    <Suspense fallback={<LoadingSpinner />}>
                      <FrontendConnectionTester />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="youtube">
                    <Suspense fallback={<LoadingSpinner />}>
                      <YouTubeConnectionTest />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="audio">
                    <Suspense fallback={<LoadingSpinner />}>
                      <IOSAudioTest />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: DATABASE TOOLS & SCHEMA */}
          {/* ============================================================== */}
          {activeTab === 'tools-database' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-5">
                  <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Manutenzione Database & Schema</h2>
                    <p className="text-xs text-slate-400">
                      Strumenti per verificare colonne mancanti, riparare tabelle e fare debug
                    </p>
                  </div>
                </div>

                <Tabs defaultValue="debugger" className="space-y-6">
                  <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex-wrap h-auto gap-1">
                    <TabsTrigger
                      value="debugger"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      Debugger Prodotti
                    </TabsTrigger>
                    <TabsTrigger
                      value="fixer"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      Schema Fixer
                    </TabsTrigger>
                    <TabsTrigger
                      value="updater"
                      className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg"
                    >
                      Schema Updater
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="debugger">
                    <Suspense fallback={<LoadingSpinner />}>
                      <ProductsDebugger />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="fixer">
                    <Suspense fallback={<LoadingSpinner />}>
                      <ProductsSchemaFixer />
                    </Suspense>
                  </TabsContent>

                  <TabsContent value="updater">
                    <Suspense fallback={<LoadingSpinner />}>
                      <DatabaseSchemaUpdater />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PizzeriaAdminPanel;
