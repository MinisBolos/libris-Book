import React, { useState, useEffect } from 'react';
import { Book, FilterCategory } from '../types';
import { Plus, Save, ArrowLeft, Trash2, Pencil, RotateCcw, Check, Upload, FileText, Image as ImageIcon, Wand2 } from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
  onAddBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  pixKey: string;
  pixKeyType: string;
  merchantName: string;
  merchantCity: string;
  onUpdatePixConfig: (key: string, type: string, name: string, city: string) => void;
  books: Book[];
  onRemoveBook: (id: string) => void;
  existingCategories: string[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onBack, 
  onAddBook, 
  onEditBook,
  pixKey, 
  pixKeyType,
  merchantName,
  merchantCity,
  onUpdatePixConfig,
  books,
  onRemoveBook,
  existingCategories
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'settings'>('books');
  
  // Pix Config State
  const [pixConfig, setPixConfig] = useState({
    key: pixKey,
    type: pixKeyType,
    name: merchantName,
    city: merchantCity
  });

  const [notification, setNotification] = useState('');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync state with props when tab opens or props change
  useEffect(() => {
    setPixConfig({
      key: pixKey,
      type: pixKeyType,
      name: merchantName,
      city: merchantCity
    });
  }, [pixKey, pixKeyType, merchantName, merchantCity]);

  // Form State
  const initialFormState = {
    title: '',
    author: '',
    price: 0,
    category: 'Ficção',
    coverUrl: '',
    description: '',
    pages: 100,
    publishedYear: new Date().getFullYear(),
    rating: 5.0,
    pdfUrl: ''
  };

  const [formData, setFormData] = useState<Partial<Book>>(initialFormState);

  const handleSavePix = () => {
    onUpdatePixConfig(pixConfig.key, pixConfig.type, pixConfig.name, pixConfig.city);
    showNotification('Configurações Pix atualizadas com sucesso!');
  };

  const detectKeyType = (value: string) => {
    const clean = value.trim();
    // Auto-detect type based on pattern
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean)) {
      return 'EVP';
    }
    if (clean.includes('@')) {
      return 'EMAIL';
    }
    if (/^\d{2,3}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/.test(clean)) {
      return 'CNPJ';
    }
    if (/^\+55/.test(clean)) {
      return 'PHONE';
    }
    if (/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(clean)) {
      return 'CPF';
    }
    return null;
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const detected = detectKeyType(val);
    setPixConfig(prev => ({
      ...prev,
      key: val,
      type: detected || prev.type // Only update type if detected, otherwise keep current
    }));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const startEditing = (book: Book) => {
    setIsEditing(true);
    setEditingId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      category: book.category,
      coverUrl: book.coverUrl,
      description: book.description,
      pages: book.pages,
      publishedYear: book.publishedYear,
      rating: book.rating,
      pdfUrl: book.pdfUrl || ''
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Generic File Upload Handler (for PDF and Cover)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'pdf' && file.type !== 'application/pdf') {
        alert('Por favor, envie apenas arquivos PDF.');
        return;
      }
      if (type === 'image' && !file.type.startsWith('image/')) {
        alert('Por favor, envie apenas arquivos de imagem.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'pdf') {
            setFormData(prev => ({ ...prev, pdfUrl: result }));
        } else {
            setFormData(prev => ({ ...prev, coverUrl: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.price) {
      showNotification('Preencha os campos obrigatórios.');
      return;
    }

    const bookData: Book = {
      id: isEditing && editingId ? editingId : Date.now().toString(),
      title: formData.title!,
      author: formData.author!,
      price: Number(formData.price),
      category: formData.category || 'Geral',
      coverUrl: formData.coverUrl || 'https://picsum.photos/300/450',
      description: formData.description || 'Sem descrição.',
      rating: Number(formData.rating) || 5,
      pages: Number(formData.pages) || 100,
      publishedYear: Number(formData.publishedYear) || new Date().getFullYear(),
      pdfUrl: formData.pdfUrl
    };

    if (isEditing) {
      onEditBook(bookData);
      showNotification('Livro atualizado com sucesso!');
      cancelEditing();
    } else {
      onAddBook(bookData);
      showNotification('Livro cadastrado com sucesso!');
      setFormData(initialFormState);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          </div>
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('books')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'books' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Livros
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Configurações
            </button>
          </div>
        </div>

        <div className="p-6">
          {notification && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center gap-2 animate-in fade-in">
              <Save size={20} />
              {notification}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <Wand2 size={20} className="text-indigo-600" />
                   Configuração de Pagamento Pix
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Chave</label>
                      <select
                        value={pixConfig.type}
                        onChange={(e) => setPixConfig({...pixConfig, type: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                      >
                        <option value="CNPJ">CNPJ</option>
                        <option value="EVP">Chave Aleatória (EVP)</option>
                        <option value="EMAIL">E-mail</option>
                        <option value="CPF">CPF</option>
                        <option value="PHONE">Telefone</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Chave Pix</label>
                      <input 
                        type="text" 
                        value={pixConfig.key}
                        onChange={handleKeyChange}
                        placeholder={
                            pixConfig.type === 'CNPJ' ? '00.000.000/0001-00' :
                            pixConfig.type === 'EVP' ? 'Ex: 123e4567-e89b-12d3-a456-426614174000' :
                            pixConfig.type === 'PHONE' ? '+5511999999999' : 'Chave...'
                        }
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500">
                    <p className="font-bold mb-1 text-slate-700">Dica:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li><strong>CNPJ:</strong> Digite apenas números ou com pontuação.</li>
                        <li><strong>Chave Aleatória (EVP):</strong> Copie exatamente como no app do banco (geralmente 32 caracteres ou formato UUID).</li>
                        <li><strong>Telefone:</strong> Use o formato internacional (ex: +55...).</li>
                    </ul>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Beneficiário</label>
                        <input 
                          type="text" 
                          value={pixConfig.name}
                          onChange={(e) => setPixConfig({...pixConfig, name: e.target.value})}
                          placeholder="Ex: Libris Store"
                          maxLength={25}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                         <p className="text-xs text-slate-500 mt-1">Nome que aparecerá no comprovante.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                        <input 
                          type="text" 
                          value={pixConfig.city}
                          onChange={(e) => setPixConfig({...pixConfig, city: e.target.value})}
                          placeholder="Ex: Sao Paulo"
                          maxLength={15}
                          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                  </div>

                  <button 
                    onClick={handleSavePix}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-4 w-full md:w-auto"
                  >
                    <Save size={18} />
                    Salvar Configurações
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'books' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  {isEditing ? (
                    <Pencil size={20} className="text-amber-500" />
                  ) : (
                    <Plus size={20} className="text-indigo-600" />
                  )}
                  {isEditing ? 'Editar Livro' : 'Cadastrar Novo Livro'}
                </h2>
                
                <form onSubmit={handleSubmitBook} className="space-y-4 relative">
                  {isEditing && (
                    <div className="absolute -top-10 right-0">
                      <button 
                        type="button" 
                        onClick={cancelEditing}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-500 bg-slate-100 px-2 py-1 rounded-md transition-colors"
                      >
                        <RotateCcw size={12} /> Cancelar Edição
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Autor</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.author}
                        onChange={e => setFormData({...formData, author: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Preço (R$)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria (Selecione ou Digite)</label>
                      <input 
                        list="categories" 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        placeholder="Ex: Ficção"
                      />
                      <datalist id="categories">
                        {existingCategories.map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ano</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.publishedYear}
                        onChange={e => setFormData({...formData, publishedYear: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capa do Livro</label>
                    <div className="grid grid-cols-[1fr,auto] gap-2 items-center">
                        <div className="relative group cursor-pointer h-[50px]">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'image')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${formData.coverUrl && formData.coverUrl.startsWith('data:') ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 bg-slate-50 text-slate-500 group-hover:border-indigo-400'}`}>
                                <ImageIcon size={20} />
                                <span className="font-medium text-sm">Carregar Imagem</span>
                            </div>
                        </div>
                        {formData.coverUrl && (
                            <div className="w-[40px] h-[50px] border border-slate-200 rounded overflow-hidden">
                                <img src={formData.coverUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                  </div>

                  {/* Manual URL Input Fallback */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ou URL da Capa</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                      value={formData.coverUrl}
                      onChange={e => setFormData({...formData, coverUrl: e.target.value})}
                    />
                  </div>
                  
                  {/* PDF Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arquivo PDF</label>
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={(e) => handleFileUpload(e, 'pdf')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full p-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${formData.pdfUrl ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-300 bg-slate-50 text-slate-500 group-hover:border-indigo-400'}`}>
                        {formData.pdfUrl ? (
                          <>
                            <FileText size={20} />
                            <span className="font-medium text-sm">PDF Carregado</span>
                          </>
                        ) : (
                          <>
                            <Upload size={20} />
                            <span className="font-medium text-sm">Clique para enviar PDF</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                    <textarea 
                      rows={3}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                      isEditing 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isEditing ? (
                      <><Check size={20} /> Atualizar Livro</>
                    ) : (
                      <><Plus size={20} /> Cadastrar Livro</>
                    )}
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-[600px] overflow-y-auto">
                <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Gerenciar Inventário ({books.length})</h3>
                <div className="space-y-3">
                  {[...books].reverse().map(book => (
                    <div key={book.id} className={`bg-white p-3 rounded-lg border flex gap-3 shadow-sm transition-all ${editingId === book.id ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                      <img src={book.coverUrl} alt="" className="w-10 h-14 object-cover rounded bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{book.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs text-slate-500 truncate">{book.author}</span>
                           {book.pdfUrl && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-bold">PDF OK</span>}
                        </div>
                        <p className="text-xs font-medium text-indigo-600 mt-1">R$ {book.price.toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col gap-2 justify-center">
                        <button 
                          onClick={() => startEditing(book)}
                          className="text-slate-300 hover:text-amber-500 transition-colors p-1"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => onRemoveBook(book.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};