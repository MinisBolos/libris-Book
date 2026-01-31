import { Book, FilterCategory } from './types';

const generateBooks = (): Book[] => {
  const categories = [
    FilterCategory.FICTION,
    FilterCategory.BUSINESS,
    FilterCategory.TECH,
    FilterCategory.SCIENCE,
    FilterCategory.SELF_HELP,
    FilterCategory.HISTORY
  ];

  const baseBooks: Book[] = [
    {
      id: '1',
      title: "O Algoritmo da Vida",
      author: "Sofia Martins",
      price: 29.90,
      category: FilterCategory.FICTION,
      coverUrl: "https://picsum.photos/300/450?random=1",
      description: "Uma jornada emocionante em um futuro onde as emoções são controladas por IA.",
      rating: 4.8,
      pages: 320,
      publishedYear: 2024
    },
    {
      id: '2',
      title: "Python para Iniciantes",
      author: "Carlos Tech",
      price: 45.00,
      category: FilterCategory.TECH,
      coverUrl: "https://picsum.photos/300/450?random=2",
      description: "O guia definitivo para começar sua carreira em programação.",
      rating: 4.9,
      pages: 450,
      publishedYear: 2023
    },
    {
      id: '3',
      title: "Mindset de Crescimento",
      author: "Ana Clara",
      price: 35.50,
      category: FilterCategory.SELF_HELP,
      coverUrl: "https://picsum.photos/300/450?random=3",
      description: "Como reprogramar seu cérebro para o sucesso contínuo.",
      rating: 4.7,
      pages: 280,
      publishedYear: 2022
    },
    {
      id: '4',
      title: "O Império das Startups",
      author: "Roberto Justus Silva",
      price: 59.90,
      category: FilterCategory.BUSINESS,
      coverUrl: "https://picsum.photos/300/450?random=4",
      description: "Bastidores das maiores empresas de tecnologia do Brasil.",
      rating: 4.5,
      pages: 380,
      publishedYear: 2023
    },
    {
      id: '5',
      title: "Cosmos Infinito",
      author: "Neil D. Tyson Jr.",
      price: 42.00,
      category: FilterCategory.SCIENCE,
      coverUrl: "https://picsum.photos/300/450?random=5",
      description: "Explorando os mistérios dos buracos negros e além.",
      rating: 4.9,
      pages: 400,
      publishedYear: 2021
    },
    {
      id: '6',
      title: "A Revolução Industrial 4.0",
      author: "Historiador X",
      price: 39.90,
      category: FilterCategory.HISTORY,
      coverUrl: "https://picsum.photos/300/450?random=6",
      description: "Como a tecnologia moldou a sociedade moderna nos últimos 50 anos.",
      rating: 4.6,
      pages: 350,
      publishedYear: 2020
    }
  ];

  const generatedBooks: Book[] = [];
  
  // Generate 44 more books to reach 50
  for (let i = 7; i <= 55; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    generatedBooks.push({
      id: i.toString(),
      title: `O Segredo de ${category} Vol. ${i}`,
      author: `Autor Genérico ${i}`,
      price: parseFloat((Math.random() * 50 + 10).toFixed(2)),
      category: category,
      coverUrl: `https://picsum.photos/300/450?random=${i}`,
      description: `Uma obra fascinante sobre ${category.toLowerCase()} que vai mudar sua perspectiva.`,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Rating between 3.0 and 5.0
      pages: Math.floor(Math.random() * 500 + 100),
      publishedYear: Math.floor(Math.random() * 10 + 2014)
    });
  }

  return [...baseBooks, ...generatedBooks];
};

export const BOOKS = generateBooks();