import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const LegalModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[12px] flex flex-col shadow-none"
        >
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-100 shadow-none hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto text-gray-100 space-y-4 leading-relaxed [&_p]:text-gray-100 [&_li]:text-gray-100">
            {children}
          </div>
          <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-gray-100 shadow-none transition-colors hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const plainFooterButtonStyle = {
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    padding: 0,
    margin: 0,
    transform: 'none',
  };

  return (
    <footer
      className="mt-auto border-t border-white/10 bg-white/5 py-12 text-gray-100 backdrop-blur-[12px]"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'rgba(255, 255, 255, 0.05)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Column 1: Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 tracking-tight">
              AikoKidzTV
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-100/85">
              Empowering the next generation through AI-driven education and creativity. 
              Building a future where technology meets human potential.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 uppercase text-sm tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#hero" className="text-gray-100 hover:text-accent transition-colors">Home</a></li>
              <li>
                <Link to="/story" className="font-semibold text-gray-100 hover:text-accent transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-gray-100 hover:text-accent transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/blender-credit" className="text-gray-100 hover:text-accent transition-colors">
                  Blender Studio Credit
                </Link>
              </li>
              <li><a href="#ai-studio" className="text-gray-100 hover:text-accent transition-colors">AI Studio</a></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="font-semibold mb-4 uppercase text-sm tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => openModal('privacy')}
                  className="text-left text-gray-100 no-underline hover:text-accent transition-colors"
                  style={plainFooterButtonStyle}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal('terms')}
                  className="text-left text-gray-100 no-underline hover:text-accent transition-colors"
                  style={plainFooterButtonStyle}
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal('refund')}
                  className="text-left text-gray-100 no-underline hover:text-accent transition-colors"
                  style={plainFooterButtonStyle}
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal('pricing')}
                  className="text-left text-gray-100 no-underline hover:text-accent transition-colors"
                  style={plainFooterButtonStyle}
                >
                  Pricing & Gem Economy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-semibold mb-4 uppercase text-sm tracking-wider">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <button
                  onClick={() => openModal('contact')}
                  className="text-left text-gray-100 no-underline hover:text-accent transition-colors"
                  style={plainFooterButtonStyle}
                >
                  support@aikokidztv.com
                </button>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-1" />
                <span className="hover:text-accent transition-colors">Gohana, Haryana, India</span>
              </li>
            </ul>
          </div>

          {/* Column 5: Connect */}
          <div>
            <h4 className="font-semibold mb-4 uppercase text-sm tracking-wider">Connect</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.youtube.com/@AikoKidzTV"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 shadow-none transition hover:-translate-y-0.5 hover:bg-red-500/15"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-red-600" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/aikokidztv"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 shadow-none transition hover:-translate-y-0.5 hover:bg-pink-500/15"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-pink-600" aria-hidden="true">
                  <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm8.9 1.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
                </svg>
              </a>
            </div>
            <p className="mt-3 text-xs text-gray-100/80">
              Follow our journey and upcoming launches.
            </p>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-xs text-gray-100/80">
          <p>&copy; {new Date().getFullYear()} AikoKidzTV. All rights reserved.</p>
          <p className="mt-2 text-[11px] font-semibold text-red-300">
            Ad-Free Website. NO REFUNDS under any circumstances. If an accidental purchase occurs, email a screenshot immediately. Missing gems issues will be resolved within 5 business days. Additional charges apply for disputes.
          </p>
          <p className="mt-2 text-[11px] font-bold text-amber-200">
            Kids Policy: Parents/guardians must supervise all purchases and account activity. This platform is designed for child-safe, respectful, educational use only.
          </p>
        </div>
      </div>

      {/* Modals */}
      
      {/* Privacy Policy */}
      <LegalModal 
        isOpen={activeModal === 'privacy'} 
        onClose={closeModal} 
        title="Privacy Policy"
      >
        <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
        <p>
          At AikoKidzTV, we value your privacy. This Privacy Policy outlines how we handle your data.
        </p>
        <h4 className="text-white font-bold mt-4">1. Information Collection</h4>
        <p>
          We collect minimal personal information, primarily your email address when you sign up or contact us. 
          We use third-party services like Google AdSense which may use cookies to serve ads based on your prior visits to our website or other websites.
        </p>
        <h4 className="text-white font-bold mt-4">2. Use of Information</h4>
        <p>
          Your information is used solely to provide our services, improve user experience, and communicate with you regarding updates or support.
        </p>
        <h4 className="text-white font-bold mt-4">3. Data Security</h4>
        <p>
          We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
        </p>
        <h4 className="text-white font-bold mt-4">4. Third-Party Links</h4>
        <p>
          Our website may contain links to external sites. We are not responsible for the privacy practices of these sites.
        </p>
      </LegalModal>

      {/* Terms of Service */}
      <LegalModal 
        isOpen={activeModal === 'terms'} 
        onClose={closeModal} 
        title="Terms of Service"
      >
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        <p>
          Welcome to AikoKidzTV. By accessing our website, you agree to these Terms of Service.
        </p>
        <h4 className="text-white font-bold mt-4">1. Acceptance of Terms</h4>
        <p>
          By using our services, you agree to comply with and be bound by these terms. If you do not agree, please do not use our services.
        </p>
        <h4 className="text-white font-bold mt-4">2. User Conduct</h4>
        <p>
          You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our services.
        </p>
        <h4 className="text-white font-bold mt-4">3. Intellectual Property</h4>
        <p>
          All content, including text, graphics, logos, and software, is the property of AikoKidzTV and is protected by copyright laws.
        </p>
        <h4 className="text-white font-bold mt-4">4. Disclaimer</h4>
        <p>
          Our services are provided "as is" without any warranties, express or implied.
        </p>
      </LegalModal>

      {/* Refund Policy */}
      <LegalModal 
        isOpen={activeModal === 'refund'} 
        onClose={closeModal} 
        title="Refund Policy"
      >
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
          <p className="font-bold text-red-400 mb-2">IMPORTANT NOTICE:</p>
          <p>
            <strong>Strict Policy:</strong> All payments and Gem purchases are final. Once a transaction is complete, it cannot be retreated or refunded under any circumstances.
          </p>
        </div>
        <p className="mt-4 text-sm text-gray-100/80">
          By completing a purchase, you acknowledge and agree to this policy. If you have technical issues accessing your content, please contact our support team immediately.
        </p>
      </LegalModal>

      {/* Pricing & Gem Economy */}
      <LegalModal 
        isOpen={activeModal === 'pricing'} 
        onClose={closeModal} 
        title="Pricing & Gem Economy"
      >
        <ul className="list-disc pl-5 space-y-3 text-gray-100">
          <li>
            <strong className="text-white">Story &amp; Poem Limits:</strong>{' '}
            Session limits depend on your active pack. Basic packs offer 2, 5, or 8 sessions every 3 days. VIP Pass holders get 15 daily sessions, and School/Educator accounts get 120 daily sessions.
          </li>
          <li>
            <strong className="text-white">Magic Art:</strong>{' '}
            Standard access is 80 Gems for 10 uses. VIP Pass gives 150 uses for 120 Gems. Free for registered Schools &amp; Educators.
          </li>
          <li>
            <strong className="text-white">Learning Zone:</strong>{' '}
            Colors &amp; Shapes permanently unlocks for 120 Gems. Animal Safari permanently unlocks for 150 Gems.
          </li>
        </ul>
      </LegalModal>

      {/* Contact Us */}
      <LegalModal 
        isOpen={activeModal === 'contact'} 
        onClose={closeModal} 
        title="Contact Us"
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-100 uppercase">Support Email</label>
            <a href="mailto:support@aikokidztv.com" className="text-xl text-accent hover:underline font-mono">
              support@aikokidztv.com
            </a>
          </div>
          
          <div className="flex flex-col gap-2">
             <label className="text-sm font-bold text-gray-100 uppercase">Address</label>
             <p className="text-lg">Gohana, Haryana, India</p>
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10 mt-4 shadow-none backdrop-blur-[12px]">
            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span> Note to Users
            </h4>
            <p className="text-gray-100/85 italic leading-relaxed">
              "Please Note: We are a founder-led startup. As an independent team, we personally review every query to ensure the best support. 
              Please allow 24-48 hours for a response. We appreciate your patience and support for indie developers."
            </p>
          </div>
        </div>
      </LegalModal>

    </footer>
  );
};

export default Footer;
