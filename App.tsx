import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, BookOpen, X, Trash2, Filter, Menu, Settings } from 'lucide-react';
import { Book, CartItem, ViewState } from './types';
import { BOOKS } from './constants';
import { BookCard } from './components/BookCard';
import { Librarian } from './components/Librarian';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { Checkout } from './components/Checkout';

const App: React.FC = () => {
  // Application State
  const [currentView, setCurrentView] = useState<ViewState>('store');
  const [books, setBooks] = useState<Book[]>(BOOKS);
  
  // Pix Configuration State
  const [pixKey, setPixKey] = useState<string>('livraria@libris.com.br'); 
  const [pixKeyType, setPixKeyType] = useState<string>('EMAIL'); // EMAIL, CPF, CNPJ, PHONE, EVP (Aleatoria)
  const [merchantName, setMerchantName] = useState<string>('Libris Store');
  const [merchantCity, setMerchantCity] = useState<string>('Sao Paulo');
  
  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Store State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic Categories: Calculate categories based on current books
  const categories = useMemo(() => {
    const uniqueCategories = new Set(books.map(b => b.category));
    return ['Todos', ...Array.from(uniqueCategories).sort()];
  }, [books]);

  // Filter Logic
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, books]);

  // Cart Logic
  const addToCart = (book: Book) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === book.id);
      if (existing) {
        return prev.map(item => item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...book, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (bookId: string) => {
    setCart(prev => prev.filter(item => item.id !== bookId));
  };

  const updateQuantity = (bookId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === bookId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handlers for Views
  const handleCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
  };

  const handleFinishPayment = () => {
    setCart([]);
    setCurrentView('store');
  };
  
  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
  };

  const handleUpdatePixConfig = (key: string, type: string, name: string, city: string) => {
    setPixKey(key);
    setPixKeyType(type);
    setMerchantName(name);
    setMerchantCity(city);
  };

  // Render Logic
  if (currentView === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLogin 
          onLogin={() => setIsAdminLoggedIn(true)}
          onBack={() => setCurrentView('store')}
        />
      );
    }

    return (
      <AdminPanel 
        onBack={() => setCurrentView('store')}
        onAddBook={(newBook) => setBooks(prev => [...prev, newBook])}
        onEditBook={handleUpdateBook}
        onRemoveBook={(id) => setBooks(prev => prev.filter(b => b.id !== id))}
        pixKey={pixKey}
        pixKeyType={pixKeyType}
        merchantName={merchantName}
        merchantCity={merchantCity}
        onUpdatePixConfig={handleUpdatePixConfig}
        books={books}
        existingCategories={categories.filter(c => c !== 'Todos')}
      />
    );
  }

  if (currentView === 'checkout') {
    return (
      <Checkout 
        cart={cart}
        total={cartTotal}
        pixKey={pixKey}
        pixKeyType={pixKeyType}
        merchantName={merchantName}
        merchantCity={merchantCity}
        onBack={() => setCurrentView('store')}
        onConfirm={handleFinishPayment}
      />
    );
  }

  // Store View (Default)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => {setSelectedCategory('Todos'); setSearchTerm('');}}>
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <BookOpen size={24} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">Libris<span className="text-indigo-600">AI</span></span>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por título ou autor..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4">
              <button 
                className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              <button 
                className="md:hidden p-2 text-slate-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-lg animate-in slide-in-from-top-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                 <button
                 key={cat}
                 onClick={() => { setSelectedCategory(cat); setIsMobileMenuOpen(false); }}
                 className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                   selectedCategory === cat
                     ? 'bg-indigo-600 text-white'
                     : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                 }`}
               >
                 {cat}
               </button>
              ))}
            </div>
             {/* Admin Link Mobile */}
             <div className="pt-2 border-t border-slate-100">
                <button 
                  onClick={() => { setCurrentView('admin'); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm text-slate-600 w-full p-2 hover:bg-slate-50 rounded"
                >
                  <Settings size={16} />
                  Área do Administrador
                </button>
             </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Categories Bar (Desktop) */}
        <div className="hidden md:flex items-center space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center text-slate-400 mr-2">
            <Filter size={16} className="mr-1" />
            <span className="text-sm font-medium">Filtrar:</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {selectedCategory === 'Todos' ? 'Catálogo Completo' : selectedCategory}
          </h2>
          <span className="text-sm text-slate-500">{filteredBooks.length} livros encontrados</span>
        </div>

        {/* Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                onAddToCart={addToCart}
                onViewDetails={setSelectedBook}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
              <BookOpen size={48} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Nenhum livro encontrado</h3>
            <p className="text-slate-500 mt-1">Tente buscar por outro termo ou categoria.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}}
              className="mt-4 px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-800">Libris AI Store</span>
          </div>
          <p>© {new Date().getFullYear()} Libris AI. Todos os direitos reservados.</p>
          <div className="mt-4 flex justify-center">
            <button 
              onClick={() => setCurrentView('admin')}
              className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <Settings size={12} /> Área do Administrador
            </button>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Seu Carrinho
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p>Seu carrinho está vazio.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <img src={item.coverUrl} alt={item.title} className="w-16 h-24 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800 line-clamp-1">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.author}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-1 py-0.5">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded">-</button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded">+</button>
                        </div>
                        <span className="font-bold text-slate-900">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 self-start p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600">Total</span>
                <span className="text-2xl font-bold text-slate-900">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <button 
                disabled={cart.length === 0}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCheckout}
              >
                Finalizar Compra
              </button>
            </div>
          </div>
        </>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedBook(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
              <div className="relative">
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 right-4 bg-white/50 hover:bg-white p-2 rounded-full z-10 transition-colors"
                >
                  <X size={20} className="text-slate-800" />
                </button>
                <div className="grid sm:grid-cols-2">
                  <div className="h-64 sm:h-full relative bg-slate-100">
                     <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col">
                    <div className="mb-auto">
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold mb-3 uppercase tracking-wider">
                        {selectedBook.category}
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">{selectedBook.title}</h2>
                      <p className="text-lg text-slate-600 mb-4">{selectedBook.author}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                        <span className="flex items-center gap-1"><span className="text-yellow-500">★</span> {selectedBook.rating}</span>
                        <span>•</span>
                        <span>{selectedBook.pages} págs</span>
                        <span>•</span>
                        <span>{selectedBook.publishedYear}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {selectedBook.description}
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                      <span className="text-3xl font-bold text-slate-900">
                        R$ {selectedBook.price.toFixed(2).replace('.', ',')}
                      </span>
                      <button 
                        onClick={() => { addToCart(selectedBook); setSelectedBook(null); }}
                        className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={20} />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <Librarian inventory={books} />
    </div>
  );
};

export default App;