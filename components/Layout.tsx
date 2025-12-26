
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  theme: 'light' | 'dark' | 'auto';
}

const Layout: React.FC<LayoutProps> = ({ children, theme }) => {
  // Resolver tema automático
  const resolvedTheme = React.useMemo(() => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  // Escutar mudanças na preferência do sistema para tema auto
  React.useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Forçar re-render quando preferência do sistema mudar
        window.dispatchEvent(new Event('theme-change'));
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);
  return (
    <div className={`h-screen w-screen overflow-hidden transition-colors duration-300 ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="h-full w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default Layout;
