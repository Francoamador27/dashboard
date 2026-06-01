import { useState } from "react";
import TablaPrecios from "./TablaPrecios";
import { motion, AnimatePresence } from "framer-motion";
import { Tag } from 'lucide-react';

const Popup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);

  return (
    <div>
<button
  onClick={openPopup}
  className="bg-white text-red-600 hover:bg-red-100 px-6 py-3 cursor-pointer rounded-md font-semibold shadow-md transition  flex items-center gap-2"
>
  <Tag className="w-5 h-5" />
  Ver precios
</button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-lg relative max-w-lg w-full"
            >
              <button
                onClick={closePopup}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <TablaPrecios />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popup;
