import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, BookOpen, X, Trash2, Filter, Menu, Settings, Eye, Book as BookIcon } from 'lucide-react';
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
  
  // Initialize books from Local Storage or fallback to default constants
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const savedBooks = localStorage.getItem('libris_inventory');
      if (savedBooks) {
        return JSON.parse(savedBooks);
      }
    } catch (error) {
      console.error("Erro ao carregar livros do armazenamento:", error);
    }
    return BOOKS;
  });
  
  // Save books to Local Storage whenever they change
  useEffect(() => {
    localStorage.setItem('libris_inventory', JSON.stringify(books));
  }, [books]);
  
  // Pix Configuration State
  const [pixKey, setPixKey] = useState<string>('livraria@libris.com.br'); 
  const [pixKeyType, setPixKeyType] = useState<string>('EMAIL'); // EMAIL, CPF, CNPJ, PHONE, EVP (Aleatoria)
  const [merchantName, setMerchantName] = useState<string>('Libris Book');
  const [merchantCity, setMerchantCity] = useState<string>('Sao Paulo');
  
  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Store State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingBook, setReadingBook] = useState<Book | null>(null); // State for Preview Mode
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

  // Generate fake content for preview
  const getPreviewContent = (book: Book) => {
    const paragraphs = [];
    paragraphs.push(`Bem-vindo à prévia de "${book.title}".`);
    paragraphs.push(book.description);
    
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    
    for(let i=0; i<5; i++) {
        paragraphs.push(lorem);
    }
    
    return paragraphs;
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
              <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">Libris <span className="text-indigo-600">Book</span></span>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-slate-800">Libris Book</span>
          </div>
          <p>© {new Date().getFullYear()} Libris Book. Todos os direitos reservados.</p>
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
          <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
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

            <div className="p-5 border-t border-slate-100 bg-slate-50 safe-pb-area">
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
          <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedBook(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg sm:max-w-2xl">
              <div className="relative max-h-[90vh] overflow-y-auto">
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="absolute top-4 right-4 bg-white/50 hover:bg-white p-2 rounded-full z-10 transition-colors"
                >
                  <X size={20} className="text-slate-800" />
                </button>
                <div className="grid sm:grid-cols-2">
                  <div className="h-48 sm:h-full relative bg-slate-100 group cursor-pointer" onClick={() => { setReadingBook(selectedBook); setSelectedBook(null); }}>
                     <img src={selectedBook.coverUrl} alt={selectedBook.title} className="w-full h-full object-cover" />
                     {/* Overlay on hover indicating preview */}
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Eye size={48} className="mb-2" />
                        <span className="font-bold text-lg">Ler Prévia</span>
                     </div>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col">
                    <div className="mb-auto">
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold mb-3 uppercase tracking-wider">
                        {selectedBook.category}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 leading-tight">{selectedBook.title}</h2>
                      <p className="text-base sm:text-lg text-slate-600 mb-4">{selectedBook.author}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 mb-6">
                        <span className="flex items-center gap-1"><span className="text-yellow-500">★</span> {selectedBook.rating}</span>
                        <span>•</span>
                        <span>{selectedBook.pages} págs</span>
                        <span>•</span>
                        <span>{selectedBook.publishedYear}</span>
                      </div>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                        {selectedBook.description}
                      </p>
                    </div>
                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                            R$ {selectedBook.price.toFixed(2).replace('.', ',')}
                        </span>
                        <button 
                            onClick={() => { addToCart(selectedBook); setSelectedBook(null); }}
                            className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            <ShoppingCart size={20} />
                            Adicionar
                        </button>
                      </div>
                      <button 
                         onClick={() => { setReadingBook(selectedBook); setSelectedBook(null); }}
                         className="w-full border-2 border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                         <Eye size={20} />
                         Ler Prévia Grátis
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODE (Watermarked Reader) */}
      {readingBook && (
        <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col animate-in fade-in" onContextMenu={(e) => e.preventDefault()}>
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 z-50 relative">
                <div className="flex items-center gap-3">
                    <button onClick={() => setReadingBook(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                    <div className="hidden sm:block">
                        <h3 className="font-bold text-sm leading-none">{readingBook.title}</h3>
                        <span className="text-xs text-slate-400">{readingBook.author}</span>
                    </div>
                </div>
                <div className="text-xs font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    MODO DE PRÉVIA • APENAS LEITURA
                </div>
            </div>

            {/* Reader Content */}
            <div className="flex-1 overflow-y-auto bg-[#f8f5f2] relative flex justify-center py-8 px-4 select-none">
                
                {/* WATERMARK LAYER - Covers everything */}
                <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden flex flex-wrap gap-x-24 gap-y-32 p-10 justify-center content-start opacity-[0.15]">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="transform -rotate-45 text-slate-900 font-black text-2xl sm:text-4xl whitespace-nowrap">
                            PRÉVIA LIBRIS • NÃO COPIAR
                        </div>
                    ))}
                </div>

                {/* Page Container */}
                <div className="w-full max-w-3xl bg-white shadow-2xl min-h-[1000px] p-8 sm:p-16 relative z-10 text-slate-800 leading-relaxed">
                    {/* Fake Header inside Page */}
                    <div className="border-b-2 border-slate-100 pb-8 mb-8 text-center">
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-2">{readingBook.title}</h1>
                        <p className="text-lg text-slate-500 italic">por {readingBook.author}</p>
                    </div>
                    
                    {/* Generated Content */}
                    <div className="font-serif text-lg space-y-6 text-justify">
                        {getPreviewContent(readingBook).map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                        
                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border-t border-slate-100 mt-12">
                            <BookIcon size={48} className="text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-900">Gostou do que leu?</h3>
                            <p className="text-slate-500 max-w-md">Adquira a versão completa para continuar lendo e ter acesso ao conteúdo exclusivo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
      <Librarian inventory={books} />
    </div>
  );
};

export default App;