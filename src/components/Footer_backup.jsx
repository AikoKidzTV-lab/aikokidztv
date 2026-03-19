import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MapPin, Gem } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerPanelClass =
  'rounded-[2rem] border border-white/75 bg-white/62 shadow-[0_20px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl';

const footerLinkClass =
  'flex w-full items-start justify-between gap-3 rounded-2xl border border-white/75 bg-white/58 px-3.5 py-3 text-left text-sm font-bold text-slate-900 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-200 hover:bg-white/66';

const footerInfoCardClass =
  'rounded-2xl border border-white/75 bg-white/52 px-3.5 py-3 text-sm text-slate-800 shadow-[0_10px_28px_rgba(15,23,42,0.07)] backdrop-blur-xl';

const economyGuideItems = [
  {
    emoji: '🎯',
    title: 'Daily Quests & Free Gems',
    description: (
      <>
        Log in every day to open Aiko&apos;s Daily Magic Chest and earn free Purple Gems (
        <Gem size={13} className="text-purple-500" />
        )! Complete fun daily habits to earn even more.
      </>
    ),
  },
  {
    emoji: '🌈',
    title: 'Standard vs. Premium Gems',
    description: (
      <>
        Use Purple Gems (<Gem size={13} className="text-purple-500" />) for basic activities. Convert them at the
        Bank or get Combo Packs to earn Premium Rainbow Gems (🌈)!
      </>
    ),
  },
  {
    emoji: '🎁',
    title: 'Mega Vault Packs',
    description:
      'Use your Rainbow Gems to unlock Mega Vault Packs permanently! Each pack is a one-time unlock packed with 250 premium, ad-free questions (like Deep Space, Dino Secrets, etc.).',
  },
  {
    emoji: '🚀',
    title: 'Combo Packs & Support',
    description:
      'Want to unlock things faster? Our Combo Packs give you a huge boost of both Purple and Rainbow gems while supporting our educational platform!',
  },
];

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
          className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative flex max-h-[80vh] w-full max-w-2xl flex-col ${footerPanelClass}`}
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/45 px-8 py-6 sm:px-10">
            <h3 className="text-xl font-black text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full border border-white/80 bg-white/70 p-2 text-slate-700 shadow-sm transition-colors hover:bg-white"
            >
              <X size={20} className="text-slate-700" />
            </button>
          </div>
          <div className="overflow-y-auto px-8 py-6 text-left text-slate-800 sm:px-10 [&_li]:text-slate-800 [&_p]:text-slate-800">
            {children}
          </div>
          <div className="flex justify-end border-t border-slate-200/70 bg-white/45 px-8 py-4 sm:px-10">
            <button
              onClick={onClose}
              className="rounded-lg border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-white"
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

  return (
    <footer className="mt-auto py-12 text-slate-900">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className={`${footerPanelClass} p-6 sm:p-8 lg:p-10`}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:pr-4">
              <div className="inline-flex rounded-full border border-white/80 bg-white/62 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur-xl">
                AikoKidzTV
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-900">AikoKidzTV</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                Empowering the next generation through AI-driven education and creativity. Building a future where
                technology meets human potential.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#hero" className={footerLinkClass}>
                    <span>Home</span>
                  </a>
                </li>
                <li>
                  <Link to="/story" className={footerLinkClass}>
                    <span>Our Story</span>
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className={footerLinkClass}>
                    <span>Projects</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blender-credit" className={footerLinkClass}>
                    <span>Blender Studio Credit</span>
                  </Link>
                </li>
                <li>
                  <a href="#ai-studio" className={footerLinkClass}>
                    <span>AI Studio</span>
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => openModal('privacy')} className={footerLinkClass} type="button">
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('terms')} className={footerLinkClass} type="button">
                    <span>Terms of Service</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('refund')} className={footerLinkClass} type="button">
                    <span>Refund Policy</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('pricing')} className={footerLinkClass} type="button">
                    <span>Pricing &amp; Gem Economy</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">Contact Us</h4>
              <div className="space-y-3">
                <button onClick={() => openModal('contact')} className={footerLinkClass} type="button">
                  <span className="flex items-center gap-2">
                    <Mail size={16} className="text-slate-500" />
                    <span>support@aikokidztv.com</span>
                  </span>
                </button>
                <div className={footerInfoCardClass}>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-slate-500" />
                    <span className="font-semibold text-slate-800">Gohana, Haryana, India</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-600">Connect</h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.youtube.com/@AikoKidzTV"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-white/75 bg-white/58 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-200 hover:bg-white/66"
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
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-white/75 bg-white/58 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors duration-200 hover:bg-white/66"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-pink-600" aria-hidden="true">
                    <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.9A3.9 3.9 0 0 0 3.9 7.8v8.4a3.9 3.9 0 0 0 3.9 3.9h8.4a3.9 3.9 0 0 0 3.9-3.9V7.8a3.9 3.9 0 0 0-3.9-3.9H7.8Zm8.9 1.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
                  </svg>
                </a>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-700">Follow our journey and upcoming launches.</p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/75 bg-gradient-to-br from-sky-50/85 via-violet-50/80 to-amber-50/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.1)] sm:p-6">
            <div className="mb-5 flex flex-col gap-2 text-left">
              <p className="inline-flex w-fit rounded-full border border-white/85 bg-white/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-700">
                Game Economy Guide
              </p>
              <h4 className="text-xl font-black text-slate-900">🌟 How to Play &amp; Earn</h4>
              <p className="text-sm font-semibold leading-relaxed text-slate-700">
                A quick and friendly guide for kids and parents to understand gems, packs, and smart progress.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {economyGuideItems.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-white/85 bg-white/72 p-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                >
                  <h5 className="text-base font-black text-slate-900">
                    <span className="mr-2" aria-hidden="true">
                      {item.emoji}
                    </span>
                    {item.title}
                  </h5>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-white/70 pt-8 text-center">
            <div className="mx-auto max-w-5xl space-y-3">
              <p className="text-xs font-bold text-slate-700">
                &copy; {new Date().getFullYear()} AikoKidzTV. All rights reserved.
              </p>
              <div className={`${footerInfoCardClass} text-[11px] font-semibold text-red-700`}>
                Ad-Free Website. NO REFUNDS under any circumstances. If an accidental purchase occurs, email a
                screenshot immediately. Missing gems issues will be resolved within 5 business days. Additional
                charges apply for disputes.
              </div>
              <div className={`${footerInfoCardClass} text-[11px] font-bold text-amber-800`}>
                Kids Policy: Parents/guardians must supervise all purchases and account activity. This platform is
                designed for child-safe, respectful, educational use only.
              </div>
            </div>
          </div>
        </div>
      </div>

      <LegalModal isOpen={activeModal === 'privacy'} onClose={closeModal} title="Privacy Policy">
        <p><strong>Effective Date:</strong> {new Date().toLocaleDateString()}</p>
        <p>
          At AikoKidzTV, we value your privacy. This Privacy Policy outlines how we handle your data.
        </p>
        <h4 className="mt-4 font-black text-slate-900">1. Information Collection</h4>
        <p>
          We collect minimal personal information, primarily your email address when you sign up or contact us. We
          use third-party services like Google AdSense which may use cookies to serve ads based on your prior visits
          to our website or other websites.
        </p>
        <h4 className="mt-4 font-black text-slate-900">2. Use of Information</h4>
        <p>
          Your information is used solely to provide our services, improve user experience, and communicate with you
          regarding updates or support.
        </p>
        <h4 className="mt-4 font-black text-slate-900">3. Data Security</h4>
        <p>
          We implement industry-standard security measures to protect your data. However, no method of transmission
          over the internet is 100% secure.
        </p>
        <h4 className="mt-4 font-black text-slate-900">4. Third-Party Links</h4>
        <p>
          Our website may contain links to external sites. We are not responsible for the privacy practices of these
          sites.
        </p>
      </LegalModal>

      <LegalModal isOpen={activeModal === 'terms'} onClose={closeModal} title="Terms of Service">
        <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
        <p>
          Welcome to AikoKidzTV. By accessing our website, you agree to these Terms of Service.
        </p>
        <h4 className="mt-4 font-black text-slate-900">1. Acceptance of Terms</h4>
        <p>
          By using our services, you agree to comply with and be bound by these terms. If you do not agree, please do
          not use our services.
        </p>
        <h4 className="mt-4 font-black text-slate-900">2. User Conduct</h4>
        <p>
          You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or
          impair our services.
        </p>
        <h4 className="mt-4 font-black text-slate-900">3. Intellectual Property</h4>
        <p>
          All content, including text, graphics, logos, and software, is the property of AikoKidzTV and is protected
          by copyright laws.
        </p>
        <h4 className="mt-4 font-black text-slate-900">4. Disclaimer</h4>
        <p>Our services are provided &quot;as is&quot; without any warranties, express or implied.</p>
      </LegalModal>

      <LegalModal isOpen={activeModal === 'refund'} onClose={closeModal} title="Refund Policy">
        <div className="rounded-xl border border-red-200 bg-red-50/90 p-4">
          <p className="mb-2 font-black text-red-700">IMPORTANT NOTICE:</p>
          <p className="text-red-900">
            <strong>Strict Policy:</strong> All payments and Gem purchases are final. Once a transaction is complete,
            it cannot be retreated or refunded under any circumstances.
          </p>
        </div>
        <p className="mt-4 text-sm text-slate-700">
          By completing a purchase, you acknowledge and agree to this policy. If you have technical issues accessing
          your content, please contact our support team immediately.
        </p>
      </LegalModal>

      <LegalModal isOpen={activeModal === 'pricing'} onClose={closeModal} title="Pricing & Gem Economy">
        <ul className="list-disc space-y-3 pl-5 text-slate-800">
          <li>
            <strong className="text-slate-900">Story &amp; Poem Limits:</strong> Session limits depend on your
            active pack. Basic packs offer 2, 5, or 8 sessions every 3 days. VIP Pass holders get 15 daily
            sessions, and School/Educator accounts get 120 daily sessions.
          </li>
          <li>
            <strong className="text-slate-900">Magic Art:</strong> Standard access is 80 Gems for 10 uses. VIP Pass
            gives 150 uses for 120 Gems. Free for registered Schools &amp; Educators.
          </li>
          <li>
            <strong className="text-slate-900">Learning Zone:</strong> Colors &amp; Shapes permanently unlocks for
            120 Gems. Animal Safari permanently unlocks for 150 Gems.
          </li>
        </ul>
      </LegalModal>

      <LegalModal isOpen={activeModal === 'contact'} onClose={closeModal} title="Contact Us">
        <div className="space-y-6">
          <div className={footerInfoCardClass}>
            <label className="text-sm font-black uppercase text-slate-600">Support Email</label>
            <a href="mailto:support@aikokidztv.com" className="mt-2 block text-xl font-mono font-bold text-slate-900 hover:underline">
              support@aikokidztv.com
            </a>
          </div>

          <div className={footerInfoCardClass}>
            <label className="text-sm font-black uppercase text-slate-600">Address</label>
            <p className="mt-2 text-lg font-semibold text-slate-900">Gohana, Haryana, India</p>
          </div>

          <div className={`${footerInfoCardClass} mt-4`}>
            <h4 className="mb-2 flex items-center gap-2 font-black text-slate-900">
              <span className="h-2 w-2 rounded-full bg-cyan-500" /> Note to Users
            </h4>
            <p className="leading-relaxed text-slate-700">
              &quot;Please Note: We are a founder-led startup. As an independent team, we personally review every query
              to ensure the best support. Please allow 24-48 hours for a response. We appreciate your patience and
              support for indie developers.&quot;
            </p>
          </div>
        </div>
      </LegalModal>
    </footer>
  );
};

export default Footer;
