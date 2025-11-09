import { AnimatePresence, motion } from "framer-motion";

interface MailboxPopupProps {
  show: boolean;
  onClickOutside?: () => void;
}

export default function MailboxPopup({ show }: MailboxPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="
            absolute
            top-11
            right-0
            w-80
            bg-white
            rounded-2xl
            shadow-[0_4px_20px_rgba(0,0,0,0.08)]
            border
            border-gray-100
            py-4
            px-5
            z-50
          "
        >
          {/* Pointer Arrow */}
          <div className="absolute -top-2 right-6 w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100 shadow-sm" />

          <h3 className="text-lg font-semibold text-center mb-3">Inbox</h3>

          <ul className="divide-y divide-gray-100">
            <li className="py-3 text-center">
              <p className="text-sm font-medium text-gray-800">Project Update</p>
              <p className="text-xs text-gray-500">New CSF results are available.</p>
            </li>
            <li className="py-3 text-center">
              <p className="text-sm font-medium text-gray-800">Reminder</p>
              <p className="text-xs text-gray-500">Team sync tomorrow at 10 AM.</p>
            </li>
          </ul>

          <div className="pt-3 border-t border-gray-100 mt-3">
            <p className="text-center text-blue-600 hover:underline cursor-pointer text-sm font-medium">
              View All
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
