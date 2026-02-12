import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import { X } from 'lucide-react';

interface ErrorToastProps {
  message: string | null;
  onDismiss: () => void;
}

const ErrorToast = ({ message, onDismiss }: ErrorToastProps) => {
  return (
    <AnimatePresence>
      {message && (
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] max-w-md w-full mx-4"
        >
          <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Error</p>
              <p className="text-xs text-red-600 font-medium">{message}</p>
            </div>
            <button onClick={onDismiss} className="p-1 text-red-300 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;
