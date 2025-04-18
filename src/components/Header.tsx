import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
            LeetCode Tracker
          </Link>
          <nav className="ml-8">
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="/" 
                  className={`${router.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/companies" 
                  className={`${router.pathname.startsWith('/companies') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}
                >
                  Companies
                </Link>
              </li>
              <li>
                <Link 
                  href="/problems" 
                  className={`${router.pathname.startsWith('/problems') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}
                >
                  Problems
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Theme toggle button positioned at the rightmost with 20px padding */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none mr-5"
          aria-label="Toggle dark mode"
        >
          {mounted && theme === 'dark' ? (
            <FaSun className="w-5 h-5" />
          ) : (
            <FaMoon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;