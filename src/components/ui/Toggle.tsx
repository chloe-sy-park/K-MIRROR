import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

const Toggle = ({ checked, onChange }: ToggleProps) => (
  <button
    onClick={onChange}
    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none flex items-center ${checked ? 'bg-[#FF4D8D]' : 'bg-gray-200'}`}
  >
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`w-4 h-4 bg-white rounded-full shadow-sm ${checked ? 'ml-auto' : 'ml-0'}`}
    />
  </button>
);

export default Toggle;
