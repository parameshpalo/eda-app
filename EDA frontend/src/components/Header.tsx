import { useEffect, useRef, useState } from "react";
import MailboxPopup from "./MailboxPopup";

function IconButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
}) {
  return (
    <button
      className={`p-2 rounded hover:bg-gray-100 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface HeaderProps {
  onMenuToggle: () => void;
  onLogout: () => void;
}

export default function Header({ onMenuToggle, onLogout }: HeaderProps) {
  const [showMailbox, setShowMailbox] = useState(false);
  const mailboxRef = useRef<HTMLDivElement>(null);


  // Close mailbox when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mailboxRef.current &&
        !mailboxRef.current.contains(event.target as Node)
      ) {
        setShowMailbox(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mailBoxToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowMailbox((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b z-50">
      <div className="flex items-center justify-between px-6 py-3 relative">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <IconButton onClick={onMenuToggle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </IconButton>

          <img
            src="/logo-BlQOt2VI.svg"
            alt="Quant Matrix AI"
            className="h-8 w-auto"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6 relative">
          {/* Project Name */}
          <div className="flex items-center space-x-2 bg-amber-50 text-gray-800 px-3 py-1 rounded-full border hover:bg-amber-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>

              <span className="text-sm cursor-text">
                Project Name
              </span>
          </div>

          {/* Mail */}
          <div className="relative" ref={mailboxRef}>
            <IconButton
              className="text-gray-600 hover:text-gray-800"
              onClick={mailBoxToggle}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26c.7.47 1.62.47 2.32 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </IconButton>

            {/* Mailbox Popup */}
            <MailboxPopup show={showMailbox} />
          </div>

          {/* Notifications */}
          <div className="relative">
            <IconButton className="text-gray-600 hover:text-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405M19 13V8a7 7 0 10-14 0v5L3 17h5m4 0v1a3 3 0 006 0v-1m-6 0h6"
                />
              </svg>
            </IconButton>
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </div>

          {/* Profile */}
          <div className="relative group">
            <img
              src="/gubura.png"
              alt="User"
              className="h-8 w-8 rounded-full object-cover border cursor-pointer"
            />
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
