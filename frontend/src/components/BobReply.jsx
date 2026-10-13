/**
 * Bob Auto-Reply Component
 * Quantum Telecom Simulator
 */

const bobReplies = [
  "Hi Alice! Nice to hear from you! 👋",
  "I received your message securely! 🔐",
  "Quantum cryptography is amazing! ⚛️",
  "BSNL is leading the way! 🇮🇳",
  "🔐 Secure communication established!",
  "Message received and decrypted! ✅",
  "The quantum channel is secure! 🛡️",
  "This is the future of telecom! 🚀",
  "Your message was encrypted perfectly! 💯",
  "Bob here - all systems secure! 📡",
];

export const getBobReply = () => {
  return bobReplies[Math.floor(Math.random() * bobReplies.length)];
};

export const simulateBobReply = (setMessages) => {
  const reply = getBobReply();
  setTimeout(() => {
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: 'Bob',
      message: reply,
      timestamp: new Date().toLocaleTimeString(),
      encrypted: true
    }]);
  }, 1500 + Math.random() * 1000);
};