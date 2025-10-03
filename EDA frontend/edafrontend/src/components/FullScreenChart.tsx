import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FullscreenChartProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function FullscreenChart({ isOpen, onClose, title, children }: FullscreenChartProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center 
                     bg-black/40 backdrop-blur-md" 
          // glassmorphism: semi-dark + blur
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl 
                       border border-white/40 w-[90%] h-[90%] flex flex-col"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="flex justify-between items-center border-b border-gray-300/50 pb-3 mb-4">
              {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-red-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Chart area */}
            <div className="flex-1 overflow-auto p-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
