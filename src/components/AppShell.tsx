import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  User, 
  LogOut,
  Moon,
  Sun,
  Store,
  ShoppingCart,
  Users,
  Megaphone,
  FileText,
  CreditCard,
  Settings,
  Zap,
  HelpCircle,
  Video,
  Archive,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { StoreService, type StoreStatus } from '@/services/StoreService';

const STATUS_BANNER: Partial<Record<StoreStatus, { title: string; text: string; className: string }>> = {
  PENDENTE: {
    title: 'Loja em análise',
    text: 'Sua loja aguarda aprovação da equipe NEOX. Enquanto isso, ela não aparece para os clientes.',
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200',
  },
  REJEITADA: {
    title: 'Loja rejeitada',
    text: 'O cadastro da sua loja não foi aprovado. Corrija os dados e envie novos documentos.',
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-200',
  },
  SUSPENSA: {
    title: 'Loja suspensa',
    text: 'Sua loja está suspensa e não aparece para os clientes.',
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-200',
  },
};

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: store } = useQuery({
    queryKey: ['store'],
    queryFn: StoreService.getStore,
    enabled: user?.role === 'EMPREENDEDOR',
  });
  const banner = store ? STATUS_BANNER[store.status] : undefined;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navigationSections = [
    {
      title: 'Operação',
      items: [
        { name: 'Dashboard', href: '/painel/dashboard', icon: Home },
        { name: 'Produtos', href: '/painel/produtos', icon: Package },
        { name: 'Estoque', href: '/painel/estoque', icon: Archive },
        { name: 'Pedidos', href: '/painel/pedidos', icon: ShoppingCart },
        { name: 'Clientes', href: '/painel/clientes', icon: Users },
      ]
    },
    {
      title: 'Crescimento',
      items: [
        { name: 'Trends', href: '/painel/trends', icon: Video },
        { name: 'Marketing', href: '/painel/marketing', icon: Megaphone },
        { name: 'Relatórios', href: '/painel/relatorios', icon: FileText },
      ]
    },
    {
      title: 'Admin',
      items: [
        { name: 'Financeiro', href: '/painel/financeiro', icon: CreditCard },
        { name: 'Integrações', href: '/painel/integracoes', icon: Zap },
        { name: 'Configurações', href: '/painel/configuracoes', icon: Settings },
        { name: 'Perfil', href: '/painel/perfil', icon: User },
        { name: 'Ajuda', href: '/painel/ajuda', icon: HelpCircle },
      ]
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Store className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">NeoxStore</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-white' : 'text-primary'}`} />
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{user?.name}</div>
                  <div className="text-gray-500 dark:text-gray-400">{user?.email}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {banner && store && (
          <div className={`border-b px-4 sm:px-6 lg:px-8 py-3 flex items-start gap-3 text-sm ${banner.className}`} role="status">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{banner.title}.</span> {banner.text}
              {store.statusReason && <div className="mt-1">Motivo: {store.statusReason}</div>}
            </div>
            {location.pathname !== '/painel/perfil' && (
              <Link to="/painel/perfil" className="font-medium underline shrink-0">Ver perfil da loja</Link>
            )}
          </div>
        )}

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}