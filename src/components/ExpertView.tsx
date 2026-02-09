import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Plus, ArrowUpRight, Send, ShoppingBag, Languages,
} from 'lucide-react';
import { ChatMessage, Expert, Product } from '../types';

/* ── Expert Data ────────────────────────────────────────── */

const EXPERTS: Expert[] = [
  {
    id: 'M01',
    name: 'Jiwon Kim',
    specialty: 'Editorial Skin-Prep',
    desc: 'Vogue Korea & Gentle Monster campaign director. 12 years of editorial excellence.',
    img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=600',
    rate: '$29',
    tag: 'Seoul Direct',
  },
  {
    id: 'M02',
    name: 'Sangho Park',
    specialty: 'Structural Contouring',
    desc: 'Master of skeletal highlighting and shadow play. BLACKPINK tour makeup director.',
    img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600',
    rate: '$35',
    tag: 'Seoul Direct',
  },
];

/* ── Simulated Translation Chat Messages ────────────────── */

const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'system',
    text: 'Session started. Live translation is active.',
    timestamp: new Date(),
  },
  {
    id: '2',
    sender: 'expert',
    text: '안녕하세요! 프로필 분석 결과를 확인했어요. 쿨톤 피부에 딱 맞는 제품을 준비했습니다.',
    translatedText: "Hi! I've reviewed your profile analysis. I prepared products that perfectly match your cool-toned skin.",
    timestamp: new Date(),
  },
  {
    id: '3',
    sender: 'expert',
    text: '이 제품을 추천드려요.',
    translatedText: 'I recommend this product for you.',
    timestamp: new Date(),
    productRecommendation: {
      name: 'Dewy Glow Cushion',
      brand: 'Laneige',
      price: '$34.00',
      desc: 'Luminous finish cushion with SPF50+',
      matchScore: 94,
      ingredients: ['Niacinamide', 'Hyaluronic Acid'],
      safetyRating: 'EWG Green',
    },
  },
];

/* ── Chat Bubble Component ──────────────────────────────── */

const ChatBubble: React.FC<{
  message: ChatMessage;
  onAddToCart?: (product: Product) => void;
}> = ({ message, onAddToCart }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="text-center py-4">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-300 bg-gray-50 px-4 py-2 rounded-full">
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Main translation (large) */}
        <div
          className={`px-6 py-4 rounded-3xl ${
            isUser
              ? 'bg-black text-white rounded-br-lg'
              : 'bg-white border border-gray-100 text-deep rounded-bl-lg shadow-sm'
          }`}
        >
          <p className="text-sm font-medium leading-relaxed">
            {message.translatedText || message.text}
          </p>
        </div>

        {/* Original text (small italic below) */}
        {message.translatedText && (
          <p
            className={`mt-2 text-[10px] italic text-gray-300 font-medium px-2 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Product recommendation card in chat */}
        {message.productRecommendation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[9px] font-black text-[#FF4D8D] uppercase">
                  {message.productRecommendation.brand}
                </p>
                <p className="text-sm font-bold">{message.productRecommendation.name}</p>
              </div>
              <span className="text-sm font-black">{message.productRecommendation.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-green-500 uppercase">
                {message.productRecommendation.safetyRating}
              </span>
              <button
                onClick={() => onAddToCart?.(message.productRecommendation!)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-colors cursor-pointer"
              >
                <ShoppingBag size={12} /> Add to Archive
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

/* ── Main Expert View ───────────────────────────────────── */

const ExpertView: React.FC = () => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: inputText,
      translatedText: inputText,  // In production, this would call a translation API
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleAddToCart = (product: Product) => {
    const systemMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'system',
      text: `${product.name} added to your archive.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMsg]);
  };

  /* ── Expert Selection Screen ──── */
  if (!selectedExpert) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#F9F9F9] -mx-6 lg:-mx-12 -mt-10 px-6 lg:px-12"
      >
        {/* Header */}
        <section className="py-24 border-b border-black/5">
          <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-6 uppercase">
            Selected Artists
          </p>
          <h2 className="text-[60px] lg:text-[100px] heading-font leading-[0.85] tracking-tight mb-12 uppercase">
            Meet Your <br />
            <span className="italic">Director.</span>
          </h2>
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <p className="max-w-md text-sm text-gray-400 leading-relaxed font-medium">
              We don't just match you with a stylist. We connect you with a director who
              redefines your identity through the Seoul lens.
            </p>
            <div className="flex items-center gap-2 group cursor-pointer">
              <span className="text-xs font-black border-b border-black pb-1 uppercase">
                View All Curators
              </span>
              <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            </div>
          </div>
        </section>

        {/* Expert Cards */}
        <section className="py-20 grid grid-cols-1 lg:grid-cols-2 gap-[2px] bg-black/5">
          {EXPERTS.map((expert) => (
            <div
              key={expert.id}
              onClick={() => setSelectedExpert(expert)}
              className="group relative bg-[#F9F9F9] p-8 lg:p-16 flex flex-col justify-between h-[700px] transition-colors hover:bg-white overflow-hidden cursor-pointer"
            >
              {/* Top info */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <span className="text-[10px] font-black text-gray-300 block mb-2">
                    {expert.id}
                  </span>
                  <h3 className="text-4xl heading-font italic tracking-tight uppercase">
                    {expert.name}
                  </h3>
                  <p className="text-[11px] font-black uppercase tracking-widest mt-2">
                    {expert.specialty}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <ArrowUpRight size={20} />
                </div>
              </div>

              {/* Center image */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src={expert.img}
                  className="w-[60%] h-[50%] object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out shadow-2xl"
                  alt={expert.name}
                />
              </div>

              {/* Bottom info */}
              <div className="z-10 flex justify-between items-end">
                <p className="max-w-[200px] text-[11px] text-gray-400 font-bold leading-relaxed uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {expert.desc}
                </p>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <Globe size={10} className="text-[#FF4D8D]" />
                    <span className="text-[9px] font-black tracking-widest text-[#FF4D8D] uppercase">
                      {expert.tag}
                    </span>
                  </div>
                  <button className="text-2xl heading-font hover:italic transition-all uppercase">
                    Book Session — {expert.rate}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Quote Section */}
        <section className="py-32 text-center">
          <h4 className="text-[11px] font-black tracking-[0.5em] text-gray-300 mb-8 uppercase">
            Intelligence meets Artistry
          </h4>
          <div className="inline-block relative">
            <p className="text-4xl lg:text-5xl heading-font italic tracking-tight leading-tight max-w-2xl mx-auto uppercase">
              &ldquo;Your skeletal structure is the canvas,
              <br />
              Seoul is the palette.&rdquo;
            </p>
            <div className="absolute -top-6 -right-12 w-24 h-24 bg-pink-100/50 rounded-full blur-3xl" />
          </div>
        </section>
      </motion.div>
    );
  }

  /* ── Chat Screen (Live Translation Messenger) ──── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-10rem)]"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedExpert(null)}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            Back
          </button>
          <div className="w-px h-6 bg-gray-100" />
          <div>
            <h3 className="text-lg font-black heading-font italic uppercase">{selectedExpert.name}</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              {selectedExpert.specialty}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#F9F9F9] rounded-full border border-gray-100">
          <Languages size={14} className="text-[#FF4D8D]" />
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
            Live Translation Active
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} onAddToCart={handleAddToCart} />
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-6 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message in any language..."
            className="flex-1 bg-[#F9F9F9] border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-[#FF4D8D] transition-colors disabled:opacity-20 cursor-pointer"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-[9px] text-gray-300 font-bold text-center mt-3 uppercase tracking-widest">
          Messages are auto-translated between Korean and your language
        </p>
      </div>
    </motion.div>
  );
};

export default ExpertView;
