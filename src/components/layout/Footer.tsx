import { Globe, ShoppingBag, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-20 border-t border-gray-50 text-center bg-white">
      <p className="text-[10px] font-black text-gray-200 uppercase tracking-[0.7em] mb-6 uppercase">K-MIRROR Neural Beauty Intelligence</p>
      <div className="flex justify-center gap-10">
        <Globe size={18} className="text-gray-300 hover:text-black transition-colors cursor-pointer" />
        <ShoppingBag size={18} className="text-gray-300 hover:text-black transition-colors cursor-pointer" />
        <Heart size={18} className="text-gray-300 hover:text-[#FF4D8D] transition-colors cursor-pointer" />
      </div>
    </footer>
  );
};

export default Footer;
