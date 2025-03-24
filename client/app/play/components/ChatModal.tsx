import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useTheme } from '../../components/ThemeProvider';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  text: string;
  sender: 'X' | 'O';
  timestamp: string;
}

const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello!", sender: "X", timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) },
    { text: "Hi there!", sender: "O", timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [currentPlayer] = useState<"X" | "O">("X");
  const messagesEndRef = useRef<HTMLDivElement>(null); 

  const getModalStyles = () => {
    if (theme === 'vanilla') {
      return {
        className: "bg-gradient-to-br from-orange-200 to-yellow-300 dark:from-[#0a192f] dark:to-[#112240] text-gray-900 dark:text-gray-100",
        style: {},
        button: {
          className: "bg-orange-500 hover:bg-orange-600 dark:bg-red-800 dark:hover:bg-red-700 text-white",
          style: {},
        },
        input: {
          className: "text-black dark:text-black bg-opacity-50 border border-orange-400 dark:border-red-700",
          style: {},
        },
        xMessage: {
          className: "bg-blue-600 text-white",
          style: {},
        },
        oMessage: {
          className: "bg-red-600 text-white",
          style: {},
        },
        closeIcon: {
          className: "text-gray-900 dark:text-gray-100 hover:text-orange-600 dark:hover:text-red-500",
          style: {},
        },
      };
    }

    return {
      className: "text-foreground",
      style: {
        background: 'var(--background)',
        color: 'var(--foreground)',
      },
      button: {
        className: "bg-[var(--board-bg)] hover:bg-[var(--square-bg)] text-[var(--foreground)] border border-[var(--square-border)]",
        style: {},
      },
      input: {
        className: "text-[var(--foreground)] border border-[var(--square-border)]",
        style: {
          background: 'var(--background)',
        },
      },
      xMessage: {
        className: "bg-blue-400 text-white",
        style: {},
      },
      oMessage: {
        className: "bg-red-300 text-white",
        style: {},
      },
      closeIcon: {
        className: "text-[var(--foreground)] hover:text-red-500",
        style: {},
      },
    };
  };

  const styles = getModalStyles();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      text: newMessage,
      sender: currentPlayer,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 300, opacity: isOpen ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`fixed top-1/4 right-4 lg:w-[450px] lg:h-[550px] md:w-[400px] md:h-[500px] w-[300px] h-[400px] ${styles.className} rounded-3xl p-4 flex flex-col shadow-lg z-50`}
      style={styles.style}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Chat</h2>
        <motion.button
          onClick={onClose}
          className={`text-2xl font-bold ${styles.closeIcon.className}`}
          style={styles.closeIcon.style}
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>
      </div>

      <div
        className="flex-1 overflow-y-auto mb-3 space-y-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`flex flex-col ${
              message.sender === "X" ? "items-start" : "items-end"
            }`}
          >
            <div
              className={`relative max-w-[70%] p-2 rounded-2xl ${
                message.sender === "X"
                  ? styles.xMessage.className
                  : styles.oMessage.className
              } ${
                message.sender === "X"
                  ? "rounded-bl-none"
                  : "rounded-br-none"
              }`}
              style={
                message.sender === "X" ? styles.xMessage.style : styles.oMessage.style
              }
            >
              <div
                className={`absolute bottom-0 w-3 h-3 ${
                  message.sender === "X"
                    ? "left-[-6px] rounded-bl-full bg-blue-600"
                    : "right-[-6px] rounded-br-full bg-red-600"
                }`}
              />
              <p className="text-sm">
                <strong>{message.sender}:</strong> {message.text}
              </p>
            </div>
            <span
              className={`text-xs opacity-70 mt-1 ${
                message.sender === "X" ? "ml-2" : "mr-2"
              }`}
            >
              {message.timestamp}
            </span>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <motion.input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          className={`flex-1 p-2 rounded-lg ${styles.input.className}`}
          style={styles.input.style}
        />
        <motion.button
          onClick={handleSendMessage}
          className={`px-3 py-2 rounded ${styles.button.className}`}
          style={styles.button.style}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChatModal;