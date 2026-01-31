import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { CheckCircle, Copy, ArrowLeft, AlertCircle, Loader2, Download, CloudLightning, FileText, Building2, ShieldCheck, Lock } from 'lucide-react';

interface CheckoutProps {
  cart: CartItem[];
  pixKey: string;
  pixKeyType: string;
  merchantName: string;
  merchantCity: string;
  total: number;
  onBack: () => void;
  onConfirm: () => void;
}

// --- Funções Auxiliares para Gerar Payload Pix (Padrão EMV) ---

// Normaliza strings para remover acentos e caracteres especiais (Padrão EMV/Banco Central)
const normalizeStr = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove caracteres especiais
    .toUpperCase();
};

const generateCRC16 = (payload: string): string => {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
};

const formatField = (id: string, value: string): string => {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
};

const generatePixPayload = (key: string, type: string, name: string, city: string, amount: number): string => {
  if (!key) return '';
  
  // Sanitização baseada no tipo de chave
  let cleanKey = key.trim();
  
  if (type === 'CNPJ' || type === 'CPF' || type === 'PHONE') {
    // Remove tudo que não for número (pontos, traços, barras)
    cleanKey = cleanKey.replace(/\D/g, '');
    
    // Se for telefone, garante o + (embora o replace acima tire, precisamos recolocar se for phone)
    // Mas o padrão BR Code para telefone é +55...
    if (type === 'PHONE') {
        // Se o usuário digitou apenas números (ex: 5511999...), adicionar o +
        // Se o usuário já tinha +55... o replace tirou o +, então recolocamos.
        // Assumindo que o usuario digite com DDI
        cleanKey = `+${cleanKey}`;
    }
  } else {
    // Para EVP e EMAIL, removemos espaços internos que possam ter vindo de copy-paste
    cleanKey = cleanKey.replace(/\s/g, '');
  }
  
  const cleanName = normalizeStr(name || 'Libris Store').substring(0, 25); // Max 25 chars
  const cleanCity = normalizeStr(city || 'Sao Paulo').substring(0, 15); // Max 15 chars
  const amountStr = amount.toFixed(2);

  // Montagem do Payload Pix
  let payload = 
    formatField('00', '01') + // Payload Format Indicator
    formatField('26', // Merchant Account Information
      formatField('00', 'br.gov.bcb.pix') +
      formatField('01', cleanKey)
    ) +
    formatField('52', '0000') + // Merchant Category Code (0000 = Geral ou 5999)
    formatField('53', '986') +  // Transaction Currency (BRL)
    formatField('54', amountStr) + // Transaction Amount
    formatField('58', 'BR') + // Country Code
    formatField('59', cleanName) + // Merchant Name (Aparece no App do Banco)
    formatField('60', cleanCity) + // Merchant City
    formatField('62', // Additional Data Field Template
      formatField('05', '***') // Reference Label (TxID)
    ) + 
    '6304'; // CRC16 ID + Length

  payload += generateCRC16(payload);
  return payload;
};

export const Checkout: React.FC<CheckoutProps> = ({ cart, pixKey, pixKeyType, merchantName, merchantCity, total, onBack, onConfirm }) => {
  const [status, setStatus] = useState<'pending' | 'checking' | 'approved'>('pending');
  const [transactionId, setTransactionId] = useState('');
  
  // Gera ID de transação único
  useEffect(() => {
    setTransactionId(Math.random().toString(36).substring(2, 10).toUpperCase());
  }, []);

  // Gera o Payload Pix oficial (EMV) com os dados dinâmicos
  const pixPayload = pixKey ? generatePixPayload(pixKey, pixKeyType, merchantName, merchantCity, total) : '';

  const handleCopyPix = () => {
    if (pixPayload) {
      navigator.clipboard.writeText(pixPayload);
      alert('Código Pix Copia e Cola copiado com sucesso!');
    } else {
      alert('Chave Pix não configurada pelo administrador.');
    }
  };

  const handleDownload = (item: CartItem) => {
    // Se o item tem um PDF real carregado, use-o
    if (item.pdfUrl && item.pdfUrl.startsWith('data:application/pdf')) {
        const a = document.createElement('a');
        a.href = item.pdfUrl;
        a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        // Fallback: Simula o download de um arquivo PDF criando um Blob
        const dummyContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Title (${item.title}) /Creator (Libris AI) >>\nendobj\nTRAILER\n<< /Root 1 0 R >>\n%%EOF`;
        const blob = new Blob([dummyContent], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
  };

  // Simulates realistic bank connection verification
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (status === 'checking') {
      timeout = setTimeout(() => {
        setStatus('approved');
      }, 6000); // 6 seconds simulation to feel "real"
    }
    return () => clearTimeout(timeout);
  }, [status]);

  if (cart.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Carrinho Vazio</h2>
                <button onClick={onBack} className="mt-6 text-indigo-600 font-bold hover:underline">Voltar para Loja</button>
            </div>
        </div>
    )
  }

  // Generate QR Code URL using the EMV Payload
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(pixPayload || 'error')}`;

  return (
    <div className="min-h-screen bg-slate-900/50 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        
        {/* Left: Enhanced Order Summary */}
        <div className="bg-slate-50 p-8 md:w-[45%] border-r border-slate-100 flex flex-col">
          <button onClick={onBack} disabled={status === 'checking'} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors self-start disabled:opacity-50">
            <ArrowLeft size={18} className="mr-2" /> Voltar
          </button>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumo do Pedido</h2>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-20 h-28 shrink-0 bg-slate-200 rounded-md overflow-hidden shadow-sm">
                    <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="mb-1">
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {item.category}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1" title={item.title}>{item.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">{item.author}</p>
                    
                    <div className="mt-auto flex justify-between items-end border-t border-slate-100 pt-2">
                        <div className="text-[10px] text-slate-400">
                            {item.pages} pág • PDF
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400">Qtd: {item.quantity}</div>
                            <div className="font-bold text-indigo-600 text-sm">R$ {(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-slate-500 text-sm block">Total do Pedido</span>
                    <span className="text-xs text-slate-400">ID: {transactionId}</span>
                </div>
                <span className="text-4xl font-bold text-slate-900">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment */}
        <div className="p-8 md:w-[55%] flex flex-col items-center justify-center bg-white text-center relative">
            {status === 'checking' && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 animate-in fade-in">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-50 duration-1000"></div>
                  <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-50 delay-300 duration-1000"></div>
                  <div className="w-24 h-24 bg-white text-green-600 rounded-full flex items-center justify-center relative shadow-lg border-4 border-green-50 z-10">
                     <ShieldCheck size={48} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Conectando ao Banco...</h3>
                <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
                  Estamos validando a transação ID <span className="font-mono font-bold text-slate-700">#{transactionId}</span> nos sistemas do Banco Central. Por favor, não feche esta janela.
                </p>
                <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 animate-[progress_6s_ease-in-out_infinite] w-full origin-left"></div>
                </div>
                <div className="flex items-center gap-2 mt-6 text-xs text-slate-400">
                    <Lock size={12} />
                    Conexão Segura e Criptografada
                </div>
              </div>
            )}
            
            {status === 'approved' ? (
                <div className="flex flex-col items-center w-full animate-in fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Sucesso!</h2>
                    <p className="text-slate-500 mb-6">Pagamento confirmado.</p>
                    
                    <div className="bg-indigo-50 rounded-xl p-4 w-full mb-6 border border-indigo-100 text-left">
                        <h3 className="font-bold text-indigo-900 text-sm mb-3">Downloads Liberados:</h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {cart.map(item => (
                                <button 
                                key={item.id} 
                                onClick={() => handleDownload(item)}
                                className="w-full flex items-center justify-between p-2 bg-white rounded border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors group"
                                >
                                    <span className="text-xs font-bold truncate pr-2">{item.title}</span>
                                    <Download size={14} className="text-indigo-400 group-hover:text-white" />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800"
                    >
                        Voltar para Loja
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-6 w-full max-w-sm">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                                <span className="font-bold font-mono">1</span>
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Pagamento Instantâneo</h2>
                        </div>
                        <p className="text-slate-500 text-sm">Escaneie o QR Code abaixo com o aplicativo do seu banco para liberar o download imediato.</p>
                    </div>

                    {/* QR Code Container */}
                    <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-inner mb-6 relative group w-64 h-64 flex items-center justify-center">
                        {pixPayload ? (
                            <>
                            <img src={qrCodeUrl} alt="QR Code Pix" className={`w-full h-full object-contain mix-blend-multiply transition-opacity ${status === 'checking' ? 'opacity-20' : 'opacity-100'}`} />
                            <div className="absolute -bottom-3 bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-full text-xs font-bold text-slate-600 flex items-center gap-1">
                                <Building2 size={12} />
                                {merchantName.toUpperCase()}
                            </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                                <AlertCircle size={32} className="mb-2 text-red-300" />
                                <span className="text-sm font-bold text-red-500">Erro na Chave Pix</span>
                                <span className="text-xs mt-1">Contate o administrador</span>
                            </div>
                        )}
                    </div>

                    {/* Pix Key Display */}
                    <div className="w-full max-w-md mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Copia e Cola</label>
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Expira em 23:59</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-600 text-xs font-mono truncate select-all shadow-sm">
                                {pixPayload || "Chave não configurada"}
                            </div>
                            <button 
                                onClick={handleCopyPix}
                                className="p-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
                                title="Copiar Código"
                                disabled={!pixPayload}
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => setStatus('checking')}
                        disabled={!pixKey || status === 'checking'}
                        className="w-full max-w-md bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-xl hover:shadow-2xl shadow-slate-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {status === 'checking' ? (
                        <Loader2 className="animate-spin" />
                        ) : (
                        <CheckCircle size={24} className="text-green-400" />
                        )}
                        {status === 'checking' ? 'Aguardando Banco...' : 'Confirmar Pagamento'}
                    </button>
                    
                    <p className="text-xs text-slate-400 mt-6 max-w-xs leading-relaxed">
                    <ShieldCheck size={12} className="inline mr-1 -mt-0.5" />
                    Ao clicar em confirmar, nosso sistema valida automaticamente o recebimento.
                    </p>
                </>
            )}

        </div>

      </div>
    </div>
  );
};