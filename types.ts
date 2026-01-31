export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  coverUrl: string;
  category: string;
  description: string;
  rating: number;
  pages: number;
  publishedYear: number;
  pdfUrl?: string; // Stores the Base64 data of the PDF file
}

export interface CartItem extends Book {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export enum FilterCategory {
  ALL = 'Todos',
  FICTION = 'Ficção',
  BUSINESS = 'Negócios',
  TECH = 'Tecnologia',
  SCIENCE = 'Ciência',
  SELF_HELP = 'Autoajuda',
  HISTORY = 'História'
}

export type ViewState = 'store' | 'admin' | 'checkout';