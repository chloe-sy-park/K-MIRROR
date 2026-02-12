import * as m from 'framer-motion/m';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

const Toggle = ({ checked, onChange, label }: ToggleProps) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(); } }}
    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#FF4D8D] focus-visible:ring-offset-2 outline-none flex items-center ${checked ? 'bg-[#FF4D8D]' : 'bg-gray-200'}`}
  >
    <m.div
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`w-4 h-4 bg-white rounded-full shadow-sm ${checked ? 'ml-auto' : 'ml-0'}`}
    />
  </button>
);

export default Toggle;
