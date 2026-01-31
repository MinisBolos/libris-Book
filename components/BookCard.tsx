import React from 'react';
import { Book } from '../types';
import { ShoppingCart, Info, Star } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onAddToCart: (book: Book) => void;
  onViewDetails: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onAddToCart, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col group border border-slate-100">
      <div className="relative aspect-[2/3] overflow-hidden cursor-pointer" onClick={() => onViewDetails(book)}>
        <img 
          src={book.coverUrl} 
          alt={book.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          {book.rating}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs font-medium text-indigo-600 mb-1 uppercase tracking-wider">{book.category}</div>
        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        <p className="text-slate-500 text-sm mb-3 line-clamp-1">{book.author}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">
            R$ {book.price.toFixed(2).replace('.', ',')}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => onViewDetails(book)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
              title="Ver Detalhes"
            >
              <Info size={20} />
            </button>
            <button 
              onClick={() => onAddToCart(book)}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-md hover:shadow-lg"
              title="Adicionar ao Carrinho"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};