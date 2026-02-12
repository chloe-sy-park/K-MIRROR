import { useNavigate } from 'react-router-dom';
import { Globe, ShoppingBag, Heart } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="py-20 border-t border-gray-50 text-center bg-white">
      <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.7em] mb-6">K-MIRROR Neural Beauty Intelligence</p>
      <div className="flex justify-center gap-10">
        <button onClick={() => navigate('/methodology')} aria-label="About K-MIRROR" className="text-gray-300 hover:text-black transition-colors">
          <Globe size={18} />
        </button>
        <button onClick={() => navigate('/shop')} aria-label="Browse shop" className="text-gray-300 hover:text-black transition-colors">
          <ShoppingBag size={18} />
        </button>
        <button onClick={() => navigate('/muse')} aria-label="Muse board" className="text-gray-300 hover:text-[#FF4D8D] transition-colors">
          <Heart size={18} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
