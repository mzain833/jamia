// import { createContext, useContext, useEffect, useState } from 'react';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
// import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from 'react-router-dom';

import { api, mediaAssetUrl } from './api.js';
import MediaManager from './MediaManager.jsx';
import './gallery-fix.css';

const LanguageContext = createContext({ language: 'en', setLanguage: () => {} });
function useLanguage() { return useContext(LanguageContext); }
const tx = (language, english, urdu) => language === 'ur' ? urdu : english;

const JAMIA = {
  name: 'Jamia-tur-Raza Ghousia Mehria',
  nameUrdu: 'جامعۃ الرضا غوثیہ مہریہ',
  principal: 'Qari Ali Akhtar Awan Qadri',
  principalUrdu: 'قاری علی اختر اعوان قادری',
  establishedYear: 2025,
  phone: '+92 310 1582018',
  phoneE164: '+923101582018',
  whatsapp: 'https://wa.me/923101582018',
  email: 'razajamiatur918@gmail.com',
  address: 'Street 31-A, Jamilabad, near Kareemi General Store, Taxila, Rawalpindi District, Pakistan',
  addressUrdu: 'گلی نمبر 31-A، جمیل آباد، کریمی جنرل اسٹور کے قریب، ٹیکسلا، ضلع راولپنڈی، پاکستان',
  mapUrl: 'https://maps.app.goo.gl/rTft91KxQQDWvgxw6',
  admissions: 'year-round',
  hostel: 'Hostel accommodation is available for boys; confirm availability, rules, and charges with the office.'
};
const seedPrograms = [
  { _id: 'jamia-hifz', slug: 'hifz-ul-quran', title: 'Hifz-ul-Qur’an', titleUrdu: 'حفظ القرآن', category: 'Qur’an memorisation', categoryUrdu: 'حفظِ قرآن', description: 'A guided pathway for students who wish to memorise the Holy Qur’an. Contact the Jamia to confirm placement, timetable, and current admission requirements.', descriptionUrdu: 'حفظِ قرآن کے خواہش مند طلبہ کے لیے رہنمائی پر مبنی تعلیمی پروگرام۔ جماعت، اوقات اور داخلے کی موجودہ شرائط کے لیے جامعہ سے رابطہ کریں۔', duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true },
  { _id: 'jamia-nazra', slug: 'nazra-quran', title: 'Nazra Qur’an', titleUrdu: 'ناظرہ قرآن', category: 'Qur’an reading', categoryUrdu: 'قرآن خوانی', description: 'Guided Qur’an reading for learners. Ask the Jamia about suitable class placement, timings, and the current admission process.', descriptionUrdu: 'قرآنِ کریم پڑھنے کے لیے رہنمائی پر مبنی تعلیم۔ مناسب جماعت، اوقات اور داخلے کے موجودہ طریقۂ کار کے لیے جامعہ سے معلومات لیں۔', duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true },
  { _id: 'jamia-tajweed', slug: 'tajweed', title: 'Tajweed', titleUrdu: 'تجوید', category: 'Correct recitation', categoryUrdu: 'درست تلاوت', description: 'Study the foundations of correct Qur’anic pronunciation and recitation. The office can confirm the current syllabus and class schedule.', descriptionUrdu: 'قرآنِ کریم کی درست ادائیگی اور تلاوت کے بنیادی اصولوں کا مطالعہ۔ موجودہ نصاب اور اوقات کی تصدیق کے لیے دفتر سے رابطہ کریں۔', duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true },
  { _id: 'jamia-teaching', slug: 'teaching-course', title: 'Teaching Program', titleUrdu: 'تدریسی پروگرام', category: 'Teaching practice', categoryUrdu: 'تدریسی مہارتیں', description: 'A learning programme focused on teaching skills. Contact the Jamia to confirm the current content and availability.', descriptionUrdu: 'تدریسی مہارتوں پر مبنی تعلیمی پروگرام۔ موجودہ تفصیلات اور دستیابی کے لیے جامعہ سے رابطہ کریں۔', duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true },
  { _id: 'jamia-dars-e-nizami', slug: 'dars-e-nizami', title: 'Dars-e-Nizami', titleUrdu: 'درسِ نظامی', category: 'Classical Islamic studies', categoryUrdu: 'درسِ نظامی', description: 'A pathway in classical Islamic learning. Contact the Jamia to confirm the current curriculum, stages, timetable, and eligibility.', descriptionUrdu: 'درسِ نظامی کے تحت روایتی اسلامی تعلیم کا پروگرام۔ موجودہ نصاب، درجات، اوقات اور اہلیت کی تصدیق کے لیے جامعہ سے رابطہ کریں۔', duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true },
  { _id: 'jamia-qirat', slug: 'qirat', title: 'Qira’at', titleUrdu: 'قراءت', category: 'Qur’anic recitation', categoryUrdu: 'تلاوتِ قرآن', description: 'A learning pathway focused on Qur’anic recitation. Ask the office to confirm the teaching approach, class level, and current schedule.', descriptionUrdu: 'قرآنِ کریم کی قراءت پر توجہ دینے والا تعلیمی پروگرام۔ تدریسی طریقۂ کار، جماعت اور اوقات کی تصدیق کے لیے دفتر سے رابطہ کریں۔', duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true },
  { _id: 'jamia-islamic-studies', slug: 'islamic-studies', title: 'Islamic Studies', titleUrdu: 'اسلامی علوم', category: 'Foundational Islamic knowledge', categoryUrdu: 'بنیادی اسلامی تعلیم', description: 'Explore foundational Islamic knowledge through the subjects and level offered by the Jamia. Contact the office for the current syllabus and class placement.', descriptionUrdu: 'جامعہ میں پڑھائے جانے والے مضامین اور درجے کے مطابق بنیادی اسلامی علوم کا مطالعہ۔ موجودہ نصاب اور جماعت کی معلومات کے لیے دفتر سے رابطہ کریں۔', duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true }
];
const seedNotices = [{ _id: 'jamia-admissions-open', slug: 'admissions-open-year-round', title: 'Admissions are open throughout the year', titleUrdu: 'داخلے سال بھر کھلے ہیں', category: 'Admissions', categoryUrdu: 'داخلہ', excerpt: 'Contact the Jamia to confirm current programme availability, age or class eligibility, required documents, and the process before visiting.', excerptUrdu: 'پروگرام کی موجودہ دستیابی، عمر یا جماعت کی اہلیت، ضروری دستاویزات اور آنے سے پہلے داخلے کے طریقۂ کار کی تصدیق کے لیے جامعہ سے رابطہ کریں۔', publishedAt: new Date().toISOString() }];
const jamiaEventPhotos = [
  { src: '/images/events/event-01.webp', title: 'Moments from Jamia events', titleUrdu: 'جامعہ کی تقریبات کے مناظر', note: 'Photograph shared by the Jamia', noteUrdu: 'جامعہ کی فراہم کردہ تصویر', alt: 'Students gathered at a Jamia event', altUrdu: 'جامعہ کی تقریب میں شریک طلبہ' },
  { src: '/images/events/event-02.webp', title: 'Learning & guidance', titleUrdu: 'تعلیم اور رہنمائی', note: 'A moment from a gathering', noteUrdu: 'ایک اجتماع کا منظر', alt: 'Teacher and students during an institutional gathering', altUrdu: 'ادارے کے اجتماع میں استاد اور طلبہ' },
  { src: '/images/events/event-03.webp', title: 'Student recognition', titleUrdu: 'طلبہ کی حوصلہ افزائی', note: 'An event photograph', noteUrdu: 'تقریب کی تصویر', alt: 'Student at an event arranged by the Jamia', altUrdu: 'جامعہ کے زیرِ اہتمام تقریب میں طالب علم' },
  { src: '/images/events/event-04.webp', title: 'Community moments', titleUrdu: 'اجتماعی لمحات', note: 'Memories from a Jamia event', noteUrdu: 'جامعہ کی تقریب کی یادیں', alt: 'Group photograph from a Jamia event', altUrdu: 'جامعہ کی تقریب کی اجتماعی تصویر' },
  { src: '/images/events/event-05.webp', title: 'Celebrating achievement', titleUrdu: 'کامیابی کی خوشی', note: 'Student event gallery', noteUrdu: 'طلبہ کی تقریب کی جھلک', alt: 'Students attending an event', altUrdu: 'تقریب میں شریک طلبہ' }
];

const legacyProgramSlugs = ['quran-studies', 'arabic-language'];
function usablePrograms(items) {
  return (items || []).filter(item => !legacyProgramSlugs.includes(item.slug) && !['Qur’an Studies', 'Arabic Language'].includes(item.title));
}
function mergePrograms(items) {
  const merged = new Map(seedPrograms.map(item => [item.slug, item]));
  usablePrograms(items).forEach(item => merged.set(item.slug || item.title, item));
  return [...merged.values()];
}
function Brand({ compact = false }) {
  const { language } = useLanguage();
  return <Link className={`brand${compact ? ' brand-compact' : ''}`} to="/" aria-label={tx(language, 'Jamia-tur-Raza Ghousia Mehria home', 'جامعۃ الرضا غوثیہ مہریہ — صفحۂ اول')}>
    <span className="brand-mark"><img src="/images/jamia-logo-mark.webp" alt="" width="48" height="48" /></span>
    <span className="brand-text"><b><span>Jamia-tur-Raza</span><span>Ghousia Mehria</span></b><small>{language === 'ur' ? 'جامعۃ الرضا غوثیہ مہریہ' : 'ISLAMIC EDUCATION · CHARACTER'}</small></span>
  </Link>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  useEffect(() => setOpen(false), [location.pathname]);
  return <header className="site-header"><div className="container nav-wrap"><Brand />
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={tx(language, 'Toggle navigation', 'مینو کھولیں یا بند کریں')} aria-expanded={open}>{open ? '×' : '☰'}</button>
    <nav className={open ? 'nav-links is-open' : 'nav-links'} aria-label={tx(language, 'Main navigation', 'مرکزی مینو')}>
      <NavLink to="/" end>{tx(language, 'Home', 'صفحۂ اول')}</NavLink><NavLink to="/about">{tx(language, 'About', 'تعارف')}</NavLink><NavLink to="/programs">{tx(language, 'Programs', 'تعلیمی پروگرام')}</NavLink><NavLink to="/gallery">{tx(language, 'Gallery', 'تصویری جھلک')}</NavLink><NavLink to="/admissions">{tx(language, 'Admissions', 'داخلہ')}</NavLink><NavLink to="/contact">{tx(language, 'Contact', 'رابطہ')}</NavLink>
      <button type="button" className="language-toggle" onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')} aria-label={tx(language, 'Switch to Urdu', 'انگریزی میں تبدیل کریں')}>{language === 'en' ? 'اردو' : 'English'} <span aria-hidden="true">↗</span></button>
      <Link to="/contact" className="nav-cta">{tx(language, 'Enquire now', 'رہنمائی حاصل کریں')} <span>↗</span></Link>
    </nav></div></header>;
}
function Footer() {
  const { language } = useLanguage();
  return <footer className="footer"><div className="container footer-grid">
    <div className="footer-brand-col"><Brand /><p className="footer-copy">{tx(language, 'Established in 2025, Jamia-tur-Raza Ghousia Mehria offers Islamic learning pathways in Taxila, Pakistan.', 'جامعۃ الرضا غوثیہ مہریہ 2025 میں قائم ہوئی۔ یہ ٹیکسلا، پاکستان میں اسلامی تعلیم کے پروگرام پیش کرتی ہے۔')}</p></div>
    <div><h4>{tx(language, 'Explore', 'مزید دیکھیے')}</h4><Link to="/about">{tx(language, 'About the Jamia', 'جامعہ کا تعارف')}</Link><Link to="/programs">{tx(language, 'Learning programmes', 'تعلیمی پروگرام')}</Link><Link to="/admissions">{tx(language, 'Admissions', 'داخلہ')}</Link><Link to="/privacy">{tx(language, 'Privacy', 'رازداری')}</Link></div>
    <div className="footer-contact"><h4>{tx(language, 'Get in touch', 'رابطہ کریں')}</h4><a href={`tel:${JAMIA.phoneE164}`} dir="ltr">{JAMIA.phone}</a><a href={`mailto:${JAMIA.email}`}>{JAMIA.email}</a><p>{tx(language, JAMIA.address, JAMIA.addressUrdu)}</p><a className="footer-link" href={JAMIA.whatsapp} target="_blank" rel="noreferrer">{tx(language, 'WhatsApp the Jamia', 'جامعہ کو واٹس ایپ کریں')} ↗</a><a className="footer-link" href={JAMIA.mapUrl} target="_blank" rel="noreferrer">{tx(language, 'Open location in Maps', 'نقشے پر مقام دیکھیں')} ↗</a><Link to="/contact" className="footer-link">{tx(language, 'Send an enquiry', 'سوال بھیجیں')} ↗</Link><Link to="/admin/login" className="admin-link">{tx(language, 'Staff sign in', 'انتظامیہ لاگ اِن')}</Link></div>
  </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Jamia-tur-Raza Ghousia Mehria · Est. 2025</span><span>{tx(language, 'Made for learning. Built with care.', 'تعلیم کے لیے، توجہ اور احتیاط کے ساتھ۔')}</span></div></footer>;
}
function WhatsAppFloat() {
  const { language } = useLanguage();
  return <a className="whatsapp-float" href={JAMIA.whatsapp} target="_blank" rel="noreferrer" aria-label={tx(language, 'Contact Jamia on WhatsApp', 'جامعہ سے واٹس ایپ پر رابطہ کریں')}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.53 0 .18 5.34.18 11.92c0 2.1.55 4.15 1.6 5.95L.08 24l6.27-1.64a11.94 11.94 0 0 0 5.74 1.46h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.18-1.24-6.17-3.5-8.42ZM12.1 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.85 9.85 0 0 1-1.52-5.26c0-5.48 4.46-9.94 9.94-9.94a9.88 9.88 0 0 1 7.03 2.92 9.88 9.88 0 0 1 2.91 7.04c0 5.48-4.46 9.94-9.94 9.94Zm5.45-7.44c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.41-1.49-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg><span>{tx(language, 'WhatsApp', 'واٹس ایپ')}</span></a>;
}
function PageShell({ children }) {
  const { language } = useLanguage();
  const location = useLocation();
  useEffect(() => {
    const pages = {
      '/': { en: ['Jamia-tur-Raza Ghousia Mehria | Islamic Education in Taxila', 'Established in 2025 in Jamilabad, Taxila. Explore Hifz, Nazra, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at and Islamic Studies. Admissions open throughout the year.'], ur: ['جامعۃ الرضا غوثیہ مہریہ | ٹیکسلا', 'جامعۃ الرضا غوثیہ مہریہ، جمیل آباد ٹیکسلا۔ حفظ، ناظرہ، تجوید، تدریسی پروگرام، درسِ نظامی، قراءت اور اسلامی علوم؛ داخلے سال بھر کھلے ہیں۔'] },
      '/about': { en: ['About the Jamia | Jamia-tur-Raza Ghousia Mehria', 'Learn about Jamia-tur-Raza Ghousia Mehria, established in 2025 in Jamilabad, Taxila, led by Owner & Principal Qari Ali Akhtar Awan Qadri.'], ur: ['جامعہ کا تعارف | جامعۃ الرضا غوثیہ مہریہ', 'جامعۃ الرضا غوثیہ مہریہ کا تعارف، قیام 2025، جمیل آباد ٹیکسلا۔ مالک و پرنسپل قاری علی اختر اعوان قادری۔'] },
      '/programs': { en: ['Programmes | Jamia-tur-Raza Ghousia Mehria', 'Explore Hifz-ul-Qur’an, Nazra Qur’an, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at and Islamic Studies. Confirm schedules and eligibility with the office.'], ur: ['تعلیمی پروگرام | جامعۃ الرضا غوثیہ مہریہ', 'حفظ القرآن، ناظرہ قرآن، تجوید، تدریسی پروگرام، درسِ نظامی، قراءت اور اسلامی علوم کے بارے میں معلومات حاصل کریں۔'] },
      '/gallery': { en: ['Events Gallery | Jamia-tur-Raza Ghousia Mehria', 'View event photographs supplied for Jamia-tur-Raza Ghousia Mehria in Taxila, Pakistan.'], ur: ['تقریبات کی تصاویر | جامعۃ الرضا غوثیہ مہریہ', 'جامعۃ الرضا غوثیہ مہریہ کی فراہم کردہ تقریبات کی تصاویر دیکھیے۔'] },
      '/admissions': { en: ['Admissions | Jamia-tur-Raza Ghousia Mehria', 'Admissions are open throughout the year. Prepare the student’s B-Form and a copy of the father’s CNIC, and contact the Jamia to confirm details. Boys’ hostel available.'], ur: ['داخلہ | جامعۃ الرضا غوثیہ مہریہ', 'داخلے سال بھر کھلے ہیں۔ طالب علم کا ب فارم اور والد کے شناختی کارڈ کی کاپی تیار رکھیں۔ لڑکوں کے لیے ہاسٹل کی سہولت موجود ہے۔'] },
      '/contact': { en: ['Contact | Jamia-tur-Raza Ghousia Mehria', 'Contact Jamia-tur-Raza Ghousia Mehria in Jamilabad, Taxila by phone, WhatsApp or email for programme and admissions information.'], ur: ['رابطہ | جامعۃ الرضا غوثیہ مہریہ', 'تعلیمی پروگراموں اور داخلے کی معلومات کے لیے جمیل آباد، ٹیکسلا میں جامعۃ الرضا غوثیہ مہریہ سے رابطہ کریں۔'] },
      '/privacy': { en: ['Privacy Notice | Jamia-tur-Raza Ghousia Mehria', 'How Jamia-tur-Raza Ghousia Mehria handles contact enquiries and basic site preferences.'], ur: ['رازداری کا نوٹس | جامعۃ الرضا غوثیہ مہریہ', 'جامعہ رابطہ فارم کی معلومات اور ویب سائٹ کی بنیادی ترجیحات کو کیسے سنبھالتی ہے۔'] }
    };
    const copy = pages[location.pathname] || { en: ['Page not found | Jamia-tur-Raza Ghousia Mehria', 'The page could not be found. Visit the Jamia website homepage.'], ur: ['صفحہ دستیاب نہیں | جامعۃ الرضا غوثیہ مہریہ', 'یہ صفحہ دستیاب نہیں۔ جامعہ کے مرکزی صفحے پر واپس جائیں۔'] };
    const [title, description] = copy[language] || copy.en;
    document.title = title;
    const setMeta = (selector, value) => { const el = document.querySelector(selector); if (el) el.setAttribute('content', value); };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
  }, [language, location.pathname]);
  return <><Header />{children}<Footer /><WhatsAppFloat /></>;
}
function Eyebrow({ children }) { return <div className="eyebrow"><span className="eyebrow-line" />{children}</div>; }
// function StockImage({ src, alt, fallbackSrc = '/images/visual-placeholder.svg', ...props }) { const [failed, setFailed] = useState(false); useEffect(() => setFailed(false), [src]); return <img {...props} src={failed ? fallbackSrc : src} alt={alt} onError={event => { if (!failed) setFailed(true); else event.currentTarget.style.display = 'none'; }} />; }

function StockImage({
  src,
  alt,
  fallbackSrc = '/images/visual-placeholder.svg',
  fetchPriority,
  ...props
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <img
      {...props}
      fetchpriority={fetchPriority}
      src={failed ? fallbackSrc : src}
      alt={alt}
      onError={(event) => {
        if (!failed) {
          setFailed(true);
        } else {
          event.currentTarget.style.display = 'none';
        }
      }}
    />
  );
}

function SectionHeading({ eyebrow, title, text, centered = false }) { return <div className={centered ? 'section-heading centered' : 'section-heading'}>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h2>{title}</h2>{text && <p>{text}</p>}</div>; }

function ProgramCard({ program, index = 0 }) {
  const { language } = useLanguage();

  
  
  
const coursePhotos = {
  "hifz-ul-quran": "/images/programs/hifz.webp",
  "nazra-quran": "/images/programs/nazra.webp",
  tajweed: "/images/programs/tajweed.webp",
  "teaching-course": "/images/programs/teaching.webp",
  "dars-e-nizami": "/images/programs/dars-e-nizami.webp",
  qirat: "/images/programs/qirat.webp",
  "islamic-studies": "/images/programs/islamic-studies.webp",
};


  const courseKey = `${program.slug || ""} ${program.title || ""}`.toLowerCase();

  const localArt = courseKey.includes("hifz")
    ? "/images/program-hifz.svg"
    : courseKey.includes("nazra")
    ? "/images/program-nazra.svg"
    : courseKey.includes("tajweed")
    ? "/images/program-tajweed.svg"
    : courseKey.includes("teaching")
    ? "/images/program-teaching.svg"
    : courseKey.includes("dars")
    ? "/images/program-dars-e-nizami.svg"
    : courseKey.includes("qirat") || courseKey.includes("qira’at")
    ? "/images/program-qirat.svg"
    : courseKey.includes("islamic-studies") ||
      courseKey.includes("islamic studies")
    ? "/images/program-islamic-studies.svg"
    : "/images/visual-placeholder.svg";

  const imageFor = program.imageUrl
    ? mediaAssetUrl(program.imageUrl)
    : coursePhotos[program.slug] || coursePhotos["hifz-ul-quran"];

  const urdu = language === "ur";

  const translations = {
    "Hifz-ul-Qur’an": {
      title: "حفظ القرآن",
      description: "حفظِ قرآن کے لیے رہنمائی پر مبنی تعلیمی پروگرام۔",
    },
    "Nazra Qur’an": {
      title: "ناظرہ قرآن",
      description: "قرآنِ کریم پڑھنے اور درست ادائیگی کی تعلیم۔",
    },
    Tajweed: {
      title: "تجوید",
      description: "قرآنِ کریم کی درست ادائیگی اور تلاوت کے اصول۔",
    },
    "Teaching Program": {
      title: 'تدریسی پروگرام',
      description: 'تدریسی مہارتوں پر مبنی کورس۔',
    },
    "Dars-e-Nizami": {
      title: "درسِ نظامی",
      description: "روایتی اسلامی علوم کا تعلیمی پروگرام۔",
    },
    "Qira’at": {
      title: "قراءت",
      description: "قرآنِ کریم کی قراءت پر توجہ دینے والا پروگرام۔",
    },
    "Islamic Studies": {
      title: "اسلامی علوم",
      description: "بنیادی اسلامی تعلیم اور علمی رہنمائی۔",
    },
  };

  const local = translations[program.title] || {};
  const title = urdu
    ? program.titleUrdu || local.title || program.title
    : program.title;

  const description = urdu
    ? program.descriptionUrdu || local.description || program.description
    : program.description;

  const duration = urdu
    ? program.durationUrdu || "دفتر سے معلوم کریں"
    : program.duration || "Confirm with the office";

  const sample = Boolean(program.isSample) ||
    legacyProgramSlugs.includes(program.slug);

  return (
    <article className="program-card">
      <div className="program-image-wrap">
        <StockImage
          className="program-image"
          loading="lazy"
          src={imageFor}
          fallbackSrc={localArt}
          alt={`${title} programme`}
        />

        <span className="program-image-shade" aria-hidden="true" />

        <span className="program-image-badge" aria-hidden="true">
          <svg
            className="program-book-icon"
            viewBox="0 0 32 32"
            focusable="false"
          >
            <path d="M16 9.5c-3-2.2-6.1-2.7-11-2.7v17c4.6 0 8 .7 11 3 3-2.3 6.4-3 11-3v-17c-4.9 0-8 .5-11 2.7Z" />
            <path d="M16 9.5v17.3M8 11.3c2.4 0 4.2.3 5.7 1.1M20 12.4c1.5-.8 3.3-1.1 5.7-1.1M8 15.6c2.4 0 4.2.3 5.7 1.1M20 16.7c1.5-.8 3.3-1.1 5.7-1.1" />
          </svg>
        </span>
      </div>

      <div className="program-card-body">
        <div className="program-number-row" aria-hidden="true">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <i />
        </div>

        {sample && (
          <span className="sample-tag">
            {urdu ? "نمونہ" : "Example · verify before use"}
          </span>
        )}

        <h3>{title}</h3>
        <p>{description}</p>

        <div className="program-card-footer">
          <div className="program-meta">
            <span className="program-meta-icon" aria-hidden="true">
              ◉
            </span>

            <span className="program-meta-copy">
              <strong>
                {urdu ? "جامعہ کے دفتر سے معلوم کریں" : "Ask the Jamia office"}
              </strong>
              <small>{duration}</small>
            </span>
          </div>

          <Link
  to={program.slug ? `/programs/${program.slug}` : '/contact'}
  className="program-learn-link"
>
  {tx(language, 'Learn More', 'مزید جانیں')}
  <span aria-hidden="true">→</span>
</Link>
        </div>
      </div>
    </article>
  );
}


function NoticeCard({ notice }) {
  const { language } = useLanguage();
  const date = new Date(notice.publishedAt || notice.createdAt || Date.now());
  const sample = ['admissions-information', 'office-announcements'].includes(notice.slug) || ['Admissions information', 'Office announcements'].includes(notice.title);
  const displayTitle = language === 'ur' ? (notice.titleUrdu || (notice.title === 'Admissions information' ? 'داخلے سے متعلق معلومات' : notice.title === 'Office announcements' ? 'دفتری اعلانات' : notice.title)) : notice.title;
  const displayExcerpt = language === 'ur' ? (notice.excerptUrdu || (notice.title === 'Admissions information' ? 'تازہ داخلوں، اہلیت اور ضروری دستاویزات کے لیے دفتر سے براہِ راست تصدیق کریں۔' : notice.title === 'Office announcements' ? 'ادارے کے مستند اعلانات یہاں شائع کیے جائیں گے۔' : notice.excerpt)) : notice.excerpt;
  return <article className="notice-card"><div className="notice-date"><span>{date.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en', { day: '2-digit' })}</span><small>{date.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en', { month: 'short', year: 'numeric' })}</small></div><div className="notice-content">{sample && <span className="sample-tag">{tx(language, 'Sample notice · replace before launch', 'نمونہ اعلان · اشاعت سے پہلے تبدیل کریں')}</span>}<span className="notice-tag">{language === 'ur' ? (notice.categoryUrdu || (notice.category === 'Admissions' ? 'داخلہ' : notice.category === 'Announcement' ? 'اعلان' : notice.category || 'اطلاع')) : (notice.category || 'Notice')}</span><h3>{displayTitle}</h3><p>{displayExcerpt}</p></div></article>;
}
function PrincipalSection() {
  const { language } = useLanguage();
  const ur = language === 'ur';
  return <section className="leader-section section-pad"><div className="container leader-grid"><figure className="leader-portrait"><img src="/images/qari-ali-akhtar-awan.webp" alt={tx(language, 'Portrait of Qari Ali Akhtar Awan Qadri, Owner and Principal', 'قاری علی اختر اعوان قادری، مہتمم و پرنسپل کی تصویر')} loading="lazy"/><span className="portrait-corner portrait-corner-a"/><span className="portrait-corner portrait-corner-b"/><figcaption>{tx(language, 'OWNER & PRINCIPAL', 'مہتمم و پرنسپل')}</figcaption></figure><div className="leader-copy"><Eyebrow>{tx(language, 'MEET THE PRINCIPAL', 'پرنسپل کا تعارف')}</Eyebrow><h2>{ur ? <>قاری علی اختر<br/><em>اعوان قادری</em></> : <>Qari Ali Akhtar<br/><em>Awan Qadri</em></>}</h2><p className="leader-role">{tx(language, 'Owner & Principal · Jamia-tur-Raza Ghousia Mehria', 'مہتمم و پرنسپل · جامعۃ الرضا غوثیہ مہریہ')}</p><p>{tx(language, 'Established in 2025, the Jamia supports Islamic learning through Hifz, Nazra, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at, and Islamic Studies. Contact the office for current schedules, eligibility, and admission guidance.', 'جامعہ الرضا غوثیہ مہریہ 2025 میں قائم ہوئی۔ یہاں حفظ، ناظرہ، تجوید، تدریسی پروگرام، درسِ نظامی، قراءت اور اسلامی علوم کے پروگرام پیش کیے جاتے ہیں۔ اوقات، اہلیت اور داخلے کی رہنمائی کے لیے دفتر سے رابطہ کریں۔')}</p><div className="leader-actions"><a className="button button-dark" href={JAMIA.whatsapp} target="_blank" rel="noreferrer">{tx(language, 'Contact on WhatsApp', 'واٹس ایپ پر رابطہ')} <span>↗</span></a><a className="leader-email" href={`mailto:${JAMIA.email}`}>{JAMIA.email} <span>↗</span></a></div><div className="leader-signature"><span className="signature-line"/><span>{tx(language, 'A direct line to the Jamia office', 'جامعہ کے دفتر سے براہِ راست رابطہ')}</span></div></div></div></section>;
}

function GalleryCard({ photo }) {
  const { language } = useLanguage();
  const imgRef = useRef(null);
  const [portrait, setPortrait] = useState(false);

  const detectShape = () => {
    const img = imgRef.current;
    if (img && img.naturalWidth && img.naturalHeight) {
      setPortrait(img.naturalHeight > img.naturalWidth * 1.05);
    }
  };

  useEffect(detectShape, [photo.src]);

  const safeSrc = String(photo.src).replace(/"/g, '%22');

  return (
    <figure
      className={`gallery-card${portrait ? ' is-portrait' : ''}`}
      style={{ '--photo': `url("${safeSrc}")` }}
    >
      <img
        ref={imgRef}
        src={photo.src}
        alt={tx(language, photo.alt, photo.altUrdu)}
        loading="lazy"
        decoding="async"
        width="1200"
        height="900"
        onLoad={detectShape}
      />
      <figcaption>
        <b>{tx(language, photo.title, photo.titleUrdu)}</b>
        <span>{tx(language, photo.note, photo.noteUrdu)}</span>
      </figcaption>
    </figure>
  );
}

function EventGalleryGrid({ limit = 5 }) {
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  useEffect(() => {
    let alive = true;
    api('/media/public').then(({ assets = [] }) => {
      if (!alive) return;
      setUploadedPhotos(assets.filter(item => ['gallery', 'event'].includes(item.target)).map(item => ({
        src: mediaAssetUrl(item.url), title: item.title, titleUrdu: item.title,
        note: 'Shared by the Jamia', noteUrdu: 'جامعہ کی فراہم کردہ تصویر',
        alt: item.altText || item.title, altUrdu: item.altText || item.title
      })));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const photos = [...uploadedPhotos, ...jamiaEventPhotos];
  return (
    <div className="gallery-grid">
      {photos.slice(0, limit).map((photo, index) => (
        <GalleryCard key={`${photo.src}-${index}`} photo={photo} />
      ))}
    </div>
  );
}


function Gallery() {
  const { language } = useLanguage();
  const ur = language === 'ur';
  return <PageShell><main id="main-content"><SubHero eyebrow={tx(language, 'EVENT PHOTOGRAPHS', 'تقریبات کی تصاویر')} title={ur ? <>جامعہ کے <em>یادگار لمحات۔</em></> : <>Moments from our <em>community.</em></>} text={tx(language, 'A curated collection of photographs supplied with the Jamia’s event assets. For admission details or programme information, please contact the office.', 'جامعہ کی فراہم کردہ تقریبات کی تصاویر کا منتخب مجموعہ۔ داخلے یا تعلیمی پروگراموں کی معلومات کے لیے دفتر سے رابطہ کریں۔')}/><section className="gallery-section section-pad"><div className="container"><div className="gallery-page-note"><span className="gallery-note-mark">✦</span><div><b>{tx(language, 'Photographs provided by the Jamia', 'جامعہ کی فراہم کردہ تصاویر')}</b><p>{tx(language, 'The gallery shows event moments shared for this website. It does not imply that every photograph depicts the campus or a specific course.', 'اس گیلری میں ویب سائٹ کے لیے فراہم کردہ تقریبات کے مناظر ہیں۔ ہر تصویر کو کیمپس یا کسی مخصوص کورس کی تصویر نہ سمجھا جائے۔')}</p></div></div><EventGalleryGrid limit={60}/><div className="callout-strip gap-top"><div><Eyebrow>{tx(language, 'ADMISSIONS OPEN', 'داخلے کھلے ہیں')}</Eyebrow><h2>{tx(language, 'Ready to ask about a programme?', 'کسی پروگرام کے بارے میں پوچھنا چاہتے ہیں؟')}</h2></div><Link to="/admissions" className="button button-dark">{tx(language, 'Admission information', 'داخلے کی معلومات')} <span>↗</span></Link></div></div></section></main></PageShell>;
}

function Home() {
  const { language } = useLanguage();
  const [programs, setPrograms] = useState(seedPrograms);
  const [notices, setNotices] = useState(seedNotices);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [apiDown, setApiDown] = useState(false);
  useEffect(() => {
    let alive = true;
    Promise.allSettled([api('/programs'), api('/notices'), api('/media/public')]).then(results => {
      if (!alive) return;
      const [p, n, m] = results;
      if (p.status === 'fulfilled') setPrograms(mergePrograms(p.value.programs));
      if (n.status === 'fulfilled') setNotices((n.value.notices || []).filter(item => !['admissions-information', 'office-announcements'].includes(item.slug)));
      if (m.status === 'fulfilled') setMediaAssets(m.value.assets || []);
      setApiDown(results.slice(0, 2).some(r => r.status === 'rejected'));
    });
    return () => { alive = false; };
  }, []);
  const ur = language === 'ur';
  const homepageBanner = mediaAssets.find(item => item.target === 'homepage');
  const courseImage = slug => mediaAssets.find(item => item.target === 'course' && item.targetSlug === slug)?.url;
  return <PageShell><main id="main-content">
    <section className="hero"><div className="hero-pattern" aria-hidden="true" /><div className="container hero-grid">
      <div className="hero-copy"><Eyebrow>{tx(language, 'LEARNING · FAITH · CHARACTER', 'تعلیم · ایمان · کردار')}</Eyebrow>
        <p className="hero-kicker">{tx(language, 'JAMIA-TUR-RAZA GHOUSIA MEHRIA(Trust)', 'جامعۃ الرضا غوثیہ مہریہ')}</p>
        <h1>{ur ? <>علم کی روشنی،<br/><em>کردار کی مضبوطی۔</em></> : <>Knowledge that <em>guides.</em><br/>Character that lasts.</>}</h1>
        <p className="hero-lead">{tx(language, 'Established in 2025 in Jamilabad, Taxila, the Jamia offers Hifz, Nazra, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at, and Islamic Studies. Admissions are open throughout the year; contact the office to confirm current arrangements.', 'جامعہ الرضا غوثیہ مہریہ 2025 میں جمیل آباد، ٹیکسلا میں قائم ہوئی۔ یہاں حفظ، ناظرہ، تجوید، تدریسی پروگرام، درسِ نظامی، قراءت اور اسلامی علوم کے پروگرام پیش کیے جاتے ہیں۔ داخلے سال بھر کھلے ہیں؛ موجودہ معلومات کے لیے دفتر سے رابطہ کریں۔')}</p>
        <div className="hero-actions"><Link to="/programs" className="button button-light">{tx(language, 'Explore programmes', 'تعلیمی پروگرام دیکھیں')} <span>↗</span></Link><a href={JAMIA.whatsapp} target="_blank" rel="noreferrer" className="button button-outline">{tx(language, 'WhatsApp us', 'واٹس ایپ کریں')}</a></div>
        <div className="hero-note"><span className="note-check">✓</span><span>{tx(language, 'Contact the office for current timings and admissions', 'داخلے اور اوقات کے لیے دفتر سے رابطہ کریں')}</span></div>
      </div>
      <figure className="hero-visual"><div className="hero-image-wrap"><StockImage src={homepageBanner ? mediaAssetUrl(homepageBanner.url) : "/images/events/event-01.webp"} alt={tx(language, 'Students gathered at a Jamia event, in a photograph supplied by the institution', 'جامعہ کی فراہم کردہ تصویر میں تقریب کے دوران شریک طلبہ')} fallbackSrc="/images/events/event-01.webp" fetchPriority="high"/><div className="hero-image-wash"/><div className="hero-photo-label"><span className="label-dot"/>{tx(language, 'MOMENTS FROM JAMIA EVENTS', 'جامعہ کی تقریبات کے مناظر')}</div></div><figcaption>{tx(language, 'Photograph supplied by the Jamia · part of its event gallery', 'جامعہ کی فراہم کردہ تصویر · تقریبات کی تصویری جھلک')}</figcaption><div className="hero-stamp"><img src="/images/jamia-logo-mark.webp" alt=""/><span><b>{tx(language, 'Learn with purpose', 'مقصد کے ساتھ سیکھیں')}</b><small>{tx(language, 'Grow through knowledge', 'علم کے ذریعے آگے بڑھیں')}</small></span></div></figure>
    </div><div className="container hero-bottom"><span>{tx(language, 'ISLAMIC LEARNING', 'اسلامی تعلیم')}</span><span className="hero-bottom-rule"/><span>{tx(language, 'VALUES · KNOWLEDGE · SERVICE', 'اقدار · علم · خدمت')} ↘</span></div></section>

    <section className="intro-section section-pad"><div className="container intro-grid"><div className="intro-aside"><div className="intro-number">01 <span>/ {tx(language, 'OUR PURPOSE', 'ہمارا مقصد')}</span></div><div className="vertical-word">{tx(language, 'LEARN · REFLECT · SERVE', 'سیکھیں · غور کریں · خدمت کریں')}</div></div><div className="intro-main"><Eyebrow>{tx(language, 'WELCOME TO THE JAMIA', 'جامعہ میں خوش آمدید')}</Eyebrow><h2>{ur ? <>مستحکم بنیاد،<br/><em>روشن مستقبل۔</em></> : <>A stronger foundation<br/>for a <em>brighter future.</em></>}</h2><p>{tx(language, 'Established in 2025, Jamia-tur-Raza Ghousia Mehria is an Islamic educational institution in Jamilabad, Taxila, Pakistan. Its programmes include Hifz, Nazra, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at, and Islamic Studies, with current schedules and eligibility confirmed directly by the Jamia.', 'جامعۃ الرضا غوثیہ مہریہ 2025 میں جمیل آباد، ٹیکسلا، پاکستان میں قائم ہوئی۔ یہاں حفظ، ناظرہ، تجوید، تدریسی پروگرام، درسِ نظامی، قراءت اور اسلامی علوم کے پروگرام پیش کیے جاتے ہیں۔ موجودہ اوقات اور اہلیت کی تصدیق جامعہ سے براہِ راست کی جا سکتی ہے۔')}</p><div className="intro-links"><Link to="/about" className="text-link">{tx(language, 'Learn about us', 'ہمارے بارے میں')} <span>↗</span></Link><span className="intro-divider"/><Link to="/admissions" className="text-link">{tx(language, 'Admission guidance', 'داخلے کی رہنمائی')} <span>↗</span></Link></div></div></div></section>

    <section className="program-section section-pad"><div className="container"><div className="section-head-row"><SectionHeading eyebrow={tx(language, 'LEARNING PATHWAYS', 'تعلیمی پروگرام')} title={ur ? <>علم کی طرف اپنا <em>راستہ چنیں۔</em></> : <>Find your path to <em>knowledge.</em></>} text={tx(language, 'Explore the seven programme areas shared by the institution. Contact the office to confirm current availability, timings, curriculum, and admission requirements.', 'ادارے کی فراہم کردہ سات تعلیمی شعبوں کے بارے میں معلومات دیکھیں۔ دستیابی، اوقات، نصاب اور داخلے کی شرائط کے لیے دفتر سے رابطہ کریں۔')}/><Link to="/programs" className="button button-dark desktop-only">{tx(language, 'All programmes', 'تمام پروگرام')} <span>↗</span></Link></div>{apiDown && <div className="inline-notice">{tx(language, 'The live content service is unavailable. Built-in programme information is still visible; start the backend and check the database connection to enable online management.', 'لائیو مواد دستیاب نہیں، اس لیے ویب سائٹ میں شامل پروگرام کی معلومات دکھائی جا رہی ہیں۔ بیک اینڈ اور ڈیٹا بیس کا رابطہ چیک کریں۔')}</div>}<div className="program-grid">{programs.slice(0,6).map((p,i)=><ProgramCard key={p._id || p.slug || p.title} program={{...p,imageUrl:courseImage(p.slug)}} index={i}/>)}</div><Link to="/programs" className="button button-dark mobile-only">{tx(language, 'Explore all programmes', 'تمام پروگرام دیکھیں')} <span>↗</span></Link></div></section>

    <section className="admissions-highlight"><div className="container admissions-highlight-grid"><div className="established-seal"><span>EST.</span><b>2025</b><small>{tx(language, 'TAXILA · PAKISTAN', 'ٹیکسلا · پاکستان')}</small></div><div className="admissions-highlight-copy"><Eyebrow>{tx(language, 'ADMISSIONS OPEN · YEAR-ROUND', 'داخلے کھلے ہیں · سال بھر')}</Eyebrow><h2>{ur ? <>داخلے سال بھر <em>کھلے ہیں۔</em></> : <>Admissions are open <em>throughout the year.</em></>}</h2><p>{tx(language, 'Prepare the student’s B-Form and a copy of the father’s CNIC. A boys’ hostel is available; contact the office to confirm current places, class eligibility, and arrangements.', 'طالب علم کا ب فارم اور والد کے شناختی کارڈ کی کاپی تیار رکھیں۔ لڑکوں کے لیے ہاسٹل موجود ہے؛ جگہ، اہلیت اور دیگر انتظامات کی تصدیق کے لیے دفتر سے رابطہ کریں۔')}</p><div className="admission-pills"><span>{tx(language, 'Student B-Form', 'طالب علم کا ب فارم')}</span><span>{tx(language, 'Father’s CNIC copy', 'والد کے شناختی کارڈ کی کاپی')}</span><span>{tx(language, 'Boys’ hostel available', 'لڑکوں کے لیے ہاسٹل')}</span></div></div><div className="admissions-highlight-action"><Link to="/admissions" className="button button-dark">{tx(language, 'Admission details', 'داخلے کی تفصیلات')} <span>↗</span></Link><a href={JAMIA.whatsapp} target="_blank" rel="noreferrer" className="text-link">{tx(language, 'Ask on WhatsApp', 'واٹس ایپ پر پوچھیں')} ↗</a></div></div></section>

    <section className="values-section section-pad"><div className="container values-grid"><div className="values-copy"><Eyebrow>{tx(language, 'WHAT MATTERS HERE', 'ہماری ترجیحات')}</Eyebrow><h2>{ur ? <>تعلیم صرف <em>معلومات نہیں۔</em></> : <>Education is more than <em>information.</em></>}</h2><p>{tx(language, 'It can help us think carefully, act with compassion, and contribute positively to our communities.', 'تعلیم بہتر سوچ، ہمدردانہ رویّے اور معاشرے کے لیے مثبت کردار ادا کرنے میں مدد دیتی ہے۔')}</p><Link to="/about" className="button button-light">{tx(language, 'Our approach', 'ہمارا طریقۂ کار')} <span>↗</span></Link></div><div className="values-list"><div className="value-row"><span className="value-index">01</span><div><h3>{tx(language, 'Knowledge', 'علم')}</h3><p>{tx(language, 'Learn with curiosity, care, and a commitment to understanding.', 'جستجو، توجہ اور سمجھ بوجھ کے ساتھ سیکھیں۔')}</p></div><span className="value-mark">✧</span></div><div className="value-row"><span className="value-index">02</span><div><h3>{tx(language, 'Character', 'کردار')}</h3><p>{tx(language, 'Make respect, integrity, and responsibility part of everyday life.', 'احترام، دیانت اور ذمہ داری کو روزمرہ زندگی کا حصہ بنائیں۔')}</p></div><span className="value-mark">✧</span></div><div className="value-row"><span className="value-index">03</span><div><h3>{tx(language, 'Community', 'معاشرہ')}</h3><p>{tx(language, 'Use what you learn to support others and do meaningful work.', 'اپنے علم کو دوسروں کی مدد اور بامقصد کام کے لیے استعمال کریں۔')}</p></div><span className="value-mark">✧</span></div></div></div></section>

    <PrincipalSection />

    <section className="gallery-section section-pad"><div className="container"><div className="section-head-row"><SectionHeading eyebrow={tx(language, 'EVENT PHOTOGRAPHS', 'تقریبات کی تصاویر')} title={ur ? <>جامعہ کی تقریبات کے <em>یادگار لمحات۔</em></> : <>Moments from our <em>community.</em></>} text={tx(language, 'Photographs supplied with the Jamia’s event assets. Select Gallery to see the full collection.', 'جامعہ کی فراہم کردہ تقریبات کی تصاویر۔ مکمل مجموعہ دیکھنے کے لیے تصویری جھلک منتخب کریں۔')}/><Link to="/gallery" className="button button-dark desktop-only">{tx(language, 'View gallery', 'تصویری جھلک دیکھیں')} <span>↗</span></Link></div><EventGalleryGrid limit={6}/><Link to="/gallery" className="button button-dark mobile-only">{tx(language, 'View all event photos', 'تمام تصاویر دیکھیں')} <span>↗</span></Link></div></section>

    <section className="notices-section section-pad"><div className="container"><div className="section-head-row"><SectionHeading eyebrow={tx(language, 'FROM THE OFFICE', 'دفتر کی جانب سے')} title={ur ? <>خبریں اور <em>اعلانات۔</em></> : <>News & <em>announcements.</em></>} text={tx(language, 'Official updates will appear here when published by the institution.', 'ادارے کی جانب سے شائع ہونے والے مستند اعلانات یہاں دکھائے جائیں گے۔')}/><Link to="/contact" className="text-link desktop-only">{tx(language, 'Ask a question', 'سوال پوچھیں')} <span>↗</span></Link></div>{notices.length ? <div className="notices-list">{notices.slice(0,3).map(n=><NoticeCard key={n._id || n.slug || n.title} notice={n}/>)}</div> : <div className="empty-notices"><span className="empty-notices-icon">✦</span><div><b>{tx(language, 'No announcements published yet', 'ابھی کوئی اعلان شائع نہیں ہوا')}</b><p>{tx(language, 'Please check back later or contact the office for confirmed information.', 'بعد میں دوبارہ دیکھیں یا مستند معلومات کے لیے دفتر سے رابطہ کریں۔')}</p></div></div>}</div></section>

    <section className="cta-band"><div className="container cta-content"><div><Eyebrow>{tx(language, 'TAKE THE NEXT STEP', 'اگلا قدم')}</Eyebrow><h2>{ur ? <>تعلیم یا داخلے سے متعلق<br/>کوئی سوال ہے؟</> : <>Questions about learning<br/>or admissions?</>}</h2><p>{tx(language, 'Contact the institution to discuss your question and the next steps.', 'اپنے سوال اور اگلے مرحلے کے بارے میں رہنمائی کے لیے ادارے سے رابطہ کریں۔')}</p></div><Link to="/contact" className="button button-light">{tx(language, 'Contact the office', 'دفتر سے رابطہ کریں')} <span>↗</span></Link></div></section>
  </main></PageShell>;
}
function SubHero({ eyebrow, title, text }) { return <section className="subhero"><div className="container"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{text}</p></div></section>; }
function About() {
  const { language } = useLanguage(); const ur = language === 'ur';
  return <PageShell><main id="main-content"><SubHero eyebrow={tx(language,'WHO WE ARE','ہم کون ہیں')} title={ur ? <>مقصد کے ساتھ تعلیم۔<br/><em>کردار کے ساتھ ترقی۔</em></> : <>Learning with purpose.<br/><em>Growing with character.</em></>} text={tx(language,'Meet the Jamia’s Owner & Principal, Qari Ali Akhtar Awan Qadri, and explore the educational pathways offered. Contact the office to confirm programme and admission details.','جامعہ کے مالک و پرنسپل قاری علی اختر اعوان قادری سے تعارف حاصل کریں اور تعلیمی پروگراموں کے بارے میں جانیے۔ داخلے اور نصاب کی تفصیلات کے لیے دفتر سے رابطہ کریں۔')}/>
    <section className="section-pad"><div className="container two-col"><div><Eyebrow>{tx(language,'OUR PURPOSE','ہمارا مقصد')}</Eyebrow><h2>{ur ? <>علم ہمیں <em>بہتر انسان</em> بنائے۔</> : <>Knowledge should help us <em>become better.</em></>}</h2></div><div className="prose"><p>{tx(language,'Established in 2025, Jamia-tur-Raza Ghousia Mehria is an Islamic educational institution in Jamilabad, Taxila, Pakistan. Its learning programmes include Hifz, Nazra, Tajweed, Teaching Program, Dars-e-Nizami, Qira’at, and Islamic Studies.','جامعۃ الرضا غوثیہ مہریہ 2025 میں جمیل آباد، ٹیکسلا، پاکستان میں قائم ہوئی۔ یہاں حفظ، ناظرہ، تجوید، تدریسی پروگرام، درسِ نظامی، قراءت اور اسلامی علوم کے پروگرام پیش کیے جاتے ہیں۔')}</p><p>{tx(language,'The Jamia is led by Qari Ali Akhtar Awan Qadri, Owner & Principal. Hostel accommodation is available for boys; families should contact the office to confirm availability, rules, charges, current syllabus, class timings, and admission requirements.','جامعہ کی سربراہی قاری علی اختر اعوان قادری بطور مالک و پرنسپل کرتے ہیں۔ لڑکوں کے لیے ہاسٹل کی سہولت دستیاب ہے؛ دستیابی، قواعد، اخراجات، نصاب، اوقات اور داخلے کی شرائط کی تصدیق کے لیے دفتر سے رابطہ کریں۔')}</p><Link to="/contact" className="text-link">{tx(language,'Speak with the office','دفتر سے رابطہ کریں')} <span>↗</span></Link></div></div></section>
    <section className="jamia-identity-band"><div className="container jamia-identity-grid"><figure className="jamia-full-logo"><img src="/images/jamia-logo-full.webp" alt={tx(language,'Official logo of Jamia-tur-Raza Ghousia Mehria','جامعۃ الرضا غوثیہ مہریہ کا آفیشل لوگو')} loading="lazy" width="742" height="1269"/><figcaption>{tx(language,'OFFICIAL INSTITUTIONAL EMBLEM','ادارے کا آفیشل نشان')}</figcaption></figure><div className="jamia-identity-copy"><Eyebrow>{tx(language,'OUR IDENTITY','ہماری شناخت')}</Eyebrow><h2>{ur ? <>علم، تدریس اور <em>خدمت کا سفر۔</em></> : <>A place for learning, <em>character and service.</em></>}</h2><p>{tx(language,'The Jamia was established in 2025 in Jamilabad, Taxila. Its official identity and programme information are presented here to help families learn about the institution and contact the office directly for current details.', 'جامعہ 2025 میں جمیل آباد، ٹیکسلا میں قائم ہوئی۔ اس ویب سائٹ پر ادارے کی شناخت اور تعلیمی پروگراموں کی معلومات پیش کی گئی ہیں؛ تازہ تفصیلات کے لیے اہلِ خانہ جامعہ کے دفتر سے براہِ راست رابطہ کریں۔')}</p><div className="identity-facts"><span>{tx(language,'ESTABLISHED','قیام')}: <b>2025</b></span><span>{tx(language,'LOCATION','مقام')}: <b>{tx(language,'Taxila, Pakistan','ٹیکسلا، پاکستان')}</b></span></div><Link to="/contact" className="button button-light">{tx(language,'Contact the Jamia','جامعہ سے رابطہ')} <span>↗</span></Link></div></div></section>
    <section className="values-section section-pad"><div className="container"><SectionHeading eyebrow={tx(language,'OUR PRINCIPLES','ہمارے اصول')} title={ur ? <>بامقصد تعلیم کی <em>بنیادیں۔</em></> : <>The foundations of meaningful <em>learning.</em></>} text={tx(language,'A thoughtful learning experience can be guided by these principles.','بامقصد تعلیمی ماحول کی رہنمائی یہ اصول کر سکتے ہیں۔')}/><div className="principle-grid"><article><span>01</span><h3>{tx(language,'Respectful inquiry','باادب سوال')}</h3><p>{tx(language,'Make room for questions, understanding, and considered reflection.','سوالات، سمجھ بوجھ اور غور و فکر کے لیے جگہ پیدا کریں۔')}</p></article><article><span>02</span><h3>{tx(language,'Consistent growth','مسلسل ترقی')}</h3><p>{tx(language,'Build skills over time through discipline, practice, and guidance.','نظم و ضبط، مشق اور رہنمائی سے وقت کے ساتھ صلاحیتیں بڑھائیں۔')}</p></article><article><span>03</span><h3>{tx(language,'Service to others','دوسروں کی خدمت')}</h3><p>{tx(language,'Connect learning with kindness, responsibility, and community.','تعلیم کو مہربانی، ذمہ داری اور معاشرتی خدمت سے جوڑیں۔')}</p></article></div></div></section>
    <section className="section-pad"><div className="container callout-strip"><div><Eyebrow>{tx(language,'WANT TO KNOW MORE?','مزید جاننا چاہتے ہیں؟')}</Eyebrow><h2>{tx(language,'We welcome your questions.','آپ کے سوالات کا خیرمقدم ہے۔')}</h2></div><Link className="button button-dark" to="/contact">{tx(language,'Contact us','رابطہ کریں')} <span>↗</span></Link></div></section></main></PageShell>;
}
function Programs() {
  const { language } = useLanguage(); const [programs,setPrograms]=useState(seedPrograms); const [error,setError]=useState(''); const [mediaAssets,setMediaAssets]=useState([]);
  useEffect(()=>{let alive=true;Promise.allSettled([api('/programs'),api('/media/public')]).then(([p,m])=>{if(!alive)return;if(p.status==='fulfilled')setPrograms(mergePrograms(p.value.programs));else setError(p.reason?.message||'Programme service unavailable.');if(m.status==='fulfilled')setMediaAssets(m.value.assets||[])});return()=>{alive=false}},[]);
  const imageFor = slug => mediaAssets.find(item => item.target==='course' && item.targetSlug===slug)?.url;
  return <PageShell><main id="main-content"><SubHero eyebrow={tx(language,'LEARNING PATHWAYS','تعلیمی پروگرام')} title={language==='ur'?<>ہر متجسس ذہن کے لیے <em>علم کا راستہ۔</em></>:<>A path for every <em>curious mind.</em></>} text={tx(language,'The Jamia has supplied these programme types. Contact the office to confirm current availability, class timings, curriculum, and entry requirements.','یہ پروگرام جامعہ کی فراہم کردہ معلومات کے مطابق درج ہیں۔ موجودہ دستیابی، کلاس کے اوقات، نصاب اور داخلے کی شرائط کی تصدیق کے لیے جامعہ سے رابطہ کریں۔')}/><section className="section-pad"><div className="container"><div className="page-context"><span>{programs.length} {tx(language,'programme types','پروگرام')}</span><span>{tx(language,'Confirm all details with the office','تمام تفصیلات دفتر سے تصدیق کریں')}</span></div>{error&&<div className="inline-notice">{tx(language,'Live content is unavailable; built-in programme information is displayed.','لائیو معلومات دستیاب نہیں؛ ویب سائٹ میں شامل پروگرام کی معلومات دکھائی جا رہی ہیں۔')} {error}</div>}<div className="program-grid program-grid-page">{programs.map((p,i)=><ProgramCard key={p._id || p.slug || p.title} program={{...p,imageUrl:imageFor(p.slug)}} index={i}/>)}</div><div className="callout-strip gap-top"><div><Eyebrow>{tx(language,'NEED GUIDANCE?','رہنمائی چاہیے؟')}</Eyebrow><h2>{tx(language,'Let’s find the right next step.','آئیے اگلا مناسب قدم طے کریں۔')}</h2></div><Link className="button button-dark" to="/contact">{tx(language,'Ask about a programme','پروگرام کے بارے میں پوچھیں')} <span>↗</span></Link></div></div></section></main></PageShell>;
}
function ProgramDetail() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const ur = language === 'ur';

  const [programs, setPrograms] = useState(seedPrograms);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      api('/programs'),
      api('/media/public')
    ]).then(([p, m]) => {
      if (!alive) return;

      if (p.status === 'fulfilled') {
        setPrograms(mergePrograms(p.value.programs));
      }

      if (m.status === 'fulfilled') {
        setMediaAssets(m.value.assets || []);
      }

      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  const program = programs.find(item => item.slug === slug);

  const photos = {
    'hifz-ul-quran': '/images/programs/hifz.webp',
    'nazra-quran': '/images/programs/nazra.webp',
    tajweed: '/images/programs/tajweed.webp',
    'teaching-course': '/images/programs/teaching.webp',
    'dars-e-nizami': '/images/programs/dars-e-nizami.webp',
    qirat: '/images/programs/qirat.webp',
    'islamic-studies': '/images/programs/islamic-studies.webp'
  };

  const focusAreas = {
    'hifz-ul-quran': ['Qur’an memorisation', 'Revision and practice', 'Guided recitation'],
    'nazra-quran': ['Qur’an reading', 'Pronunciation practice', 'Guided reading'],
    tajweed: ['Rules of Tajweed', 'Correct pronunciation', 'Recitation practice'],
    'teaching-course': ['Islamic manners', 'Daily practice', 'Character development'],
    'dars-e-nizami': ['Classical Islamic learning', 'Subject-based study', 'Guided learning'],
    qirat: ['Qur’anic recitation', 'Pronunciation practice', 'Recitation guidance'],
    'islamic-studies': ['Foundational Islamic knowledge', 'Islamic subjects', 'Guided learning']
  };

  if (loading && !program) {
    return (
      <PageShell>
        <main className="section-pad container">
          {ur ? 'براہِ کرم انتظار کریں...' : 'Loading course details...'}
        </main>
      </PageShell>
    );
  }

  if (!program) return <NotFound />;

  const title = ur
    ? (program.titleUrdu || program.title)
    : program.title;

  const description = ur
    ? (program.descriptionUrdu || program.description)
    : program.description;

  const duration = ur
    ? (program.durationUrdu || 'دفتر سے معلوم کریں')
    : (program.duration || 'Confirm with the Jamia office');

  const media = mediaAssets.find(
    item => item.target === 'course' && item.targetSlug === slug
  );

  const image = media?.url
    ? mediaAssetUrl(media.url)
    : (program.imageUrl || photos[slug] || '/images/visual-placeholder.svg');

  const topics = focusAreas[slug] || focusAreas['islamic-studies'];

  return (
    <PageShell>
      <main className="course-detail-page">
        <section className="course-detail-hero">
          <div className="container">
            <div className="course-breadcrumb">
              <Link to="/">{ur ? 'صفحۂ اول' : 'Home'}</Link>
              <span>/</span>
              <Link to="/programs">
                {ur ? 'تعلیمی پروگرام' : 'Programmes'}
              </Link>
              <span>/</span>
              <span>{title}</span>
            </div>

            <div className="course-detail-hero-grid">
              <div className="course-detail-intro">
                <span className="course-detail-kicker">
                  {ur ? 'جامعہ کا تعلیمی پروگرام' : 'JAMIA LEARNING PROGRAMME'}
                </span>

                <h1>{title}</h1>

                <p>{description}</p>

                <div className="course-detail-actions">
                  <Link to="/contact" className="button button-light">
                    {ur ? 'داخلے کی معلومات' : 'Ask about admission'}
                    <span>↗</span>
                  </Link>

                  <Link to="/contact" className="button button-outline">
                    {ur ? 'رابطہ کریں' : 'Contact us'}
                  </Link>
                </div>
              </div>

              <div className="course-detail-image">
                <StockImage
                  src={image}
                  fallbackSrc="/images/visual-placeholder.svg"
                  alt={title}
                  loading="lazy"
                />
                <span>{ur ? 'جامعہ کے تعلیمی پروگرام' : 'JAMIA PROGRAMMES'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad course-detail-section">
          <div className="container course-detail-columns">
            <div className="course-detail-main">
              <article className="course-detail-panel">
                <span className="course-section-number">01 / OVERVIEW</span>
                <h2>{ur ? 'پروگرام کا تعارف' : 'Course Overview'}</h2>
                <p>{description}</p>
                <p>
                  {ur
                    ? 'موجودہ نصاب، جماعت اور تدریسی اوقات کی تصدیق جامعہ کے دفتر سے کریں۔'
                    : 'Contact the Jamia office to confirm the current syllabus, class level and schedule.'}
                </p>
              </article>

              <article className="course-detail-panel">
                <span className="course-section-number">02 / LEARNING FOCUS</span>
                <h2>{ur ? 'تعلیمی توجہ' : 'Learning Focus'}</h2>

                <ul className="course-focus-list">
                  {topics.map((topic, index) => (
                    <li key={topic}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {topic}
                    </li>
                  ))}
                </ul>

                <p className="course-detail-note">
                  {ur
                    ? 'یہ عمومی نکات ہیں، جامعہ کا تصدیق شدہ حتمی نصاب نہیں۔'
                    : 'These are general learning areas, not a verified official syllabus.'}
                </p>
              </article>
            </div>

            <aside className="course-detail-sidebar">
              <span className="course-section-number">03 / INFORMATION</span>
              <h2>{ur ? 'پروگرام کی معلومات' : 'Course Information'}</h2>

              <div className="course-info-row">
                <span>{ur ? 'پروگرام' : 'Programme'}</span>
                <strong>{title}</strong>
              </div>

              <div className="course-info-row">
                <span>{ur ? 'دورانیہ' : 'Duration'}</span>
                <strong>{duration}</strong>
              </div>

              <div className="course-admission-box">
                <h3>{ur ? 'داخلے سے پہلے' : 'Before You Apply'}</h3>
                <p>
                  {ur
                    ? 'دستیابی، اہلیت اور اوقات کی تصدیق کے لیے جامعہ سے رابطہ کریں۔'
                    : 'Contact the Jamia to confirm availability, eligibility and class timings.'}
                </p>

                <Link to="/admissions" className="course-admission-link">
                  {ur ? 'داخلے کا طریقہ' : 'Admission guidance'} →
                </Link>
              </div>

              <Link to="/contact" className="button button-dark course-contact-button">
                {ur ? 'جامعہ سے رابطہ' : 'Contact the Jamia'}
                <span>↗</span>
              </Link>
            </aside>
          </div>
        </section>
      </main>
    </PageShell>
  );
}


function Admissions() {
  const { language } = useLanguage(); const ur = language === 'ur';
  return <PageShell><main id="main-content"><SubHero eyebrow={tx(language,'ADMISSIONS','داخلہ')} title={ur?<>بات چیت سے <em>آغاز کریں۔</em></>:<>Start with a <em>conversation.</em></>} text={tx(language,'Admissions are open throughout the year. Contact the Jamia to confirm current programme availability, eligibility, class timings, and the latest requirements before visiting.','داخلے سال بھر کھلے ہیں۔ آنے سے پہلے پروگرام کی دستیابی، اہلیت، کلاس کے اوقات اور تازہ شرائط کی تصدیق کے لیے جامعہ سے رابطہ کریں۔')}/><section className="section-pad"><div className="container admission-grid"><div><Eyebrow>{tx(language,'HOW TO PROCEED','طریقۂ کار')}</Eyebrow><h2>{ur?<>آغاز کے لیے <em>تین مراحل۔</em></>:<>Three steps to get <em>started.</em></>}</h2><p className="body-large">{tx(language,'Admissions are open year-round. Call or WhatsApp before visiting so the office can confirm programme availability, eligibility, and the latest document checklist.','داخلے سال بھر کھلے ہیں۔ آنے سے پہلے فون یا واٹس ایپ کریں تاکہ دفتر پروگرام، اہلیت اور ضروری دستاویزات کی تازہ فہرست کی تصدیق کر سکے۔')}</p><div className="admissions-actions"><Link to="/contact" className="button button-dark">{tx(language,'Send an enquiry','سوال بھیجیں')} <span>↗</span></Link><a className="button button-outline dark-outline" href={JAMIA.whatsapp} target="_blank" rel="noreferrer">{tx(language,'WhatsApp the office','دفتر کو واٹس ایپ کریں')} ↗</a></div></div><div className="steps"><article><span>01</span><div><h3>{tx(language,'Admissions open year-round','داخلے سال بھر کھلے ہیں')}</h3><p>{tx(language,'Contact the office to confirm the course you want, eligibility, and when to visit.','اپنے مطلوبہ کورس، اہلیت اور آنے کے مناسب وقت کی تصدیق کے لیے دفتر سے رابطہ کریں۔')}</p></div></article><article><span>02</span><div><h3>{tx(language,'Prepare the required documents','ضروری دستاویزات تیار کریں')}</h3><p>{tx(language,'Bring a copy of the student’s B-Form and a copy of their father’s CNIC. Ask whether any additional documents are needed.','طالب علم کے ب فارم اور والد کے شناختی کارڈ کی کاپی ساتھ لائیں۔ معلوم کر لیں کہ مزید کوئی دستاویز تو درکار نہیں۔')}</p></div></article><article><span>03</span><div><h3>{tx(language,'Ask about the boys’ hostel','لڑکوں کے ہاسٹل کی معلومات')}</h3><p>{tx(language,'Hostel accommodation is available for boys. Contact the Jamia to confirm room availability, rules, fees, and the enrolment process.','لڑکوں کے لیے ہاسٹل کی سہولت دستیاب ہے۔ کمروں کی دستیابی، قواعد، فیس اور داخلے کے طریقے کی تصدیق کے لیے جامعہ سے رابطہ کریں۔')}</p></div></article></div></div></section><section className="faq-section section-pad"><div className="container"><SectionHeading eyebrow={tx(language,'GOOD TO KNOW','اہم معلومات')} title={ur?<>درخواست سے پہلے <em>معلوم کریں۔</em></>:<>Before you <em>apply.</em></>} text={tx(language,'These general reminders help you prepare for an informed conversation.','یہ عمومی ہدایات آپ کو بہتر رہنمائی حاصل کرنے میں مدد دیتی ہیں۔')}/><div className="faq-grid"><article><h3>{tx(language,'When can I apply?','داخلے کے لیے کب درخواست دیں؟')}</h3><p>{tx(language,'Admissions are open throughout the year. Contact the office before visiting to confirm current availability.','داخلے سال بھر کھلے ہیں۔ آنے سے پہلے پروگرام کی موجودہ دستیابی کی تصدیق کے لیے دفتر سے رابطہ کریں۔')}</p></article><article><h3>{tx(language,'Which documents should I bring?','کون سی دستاویزات ساتھ لائیں؟')}</h3><p>{tx(language,'Bring a copy of the student’s B-Form and their father’s CNIC. Ask the office if anything else is needed.','طالب علم کے ب فارم اور والد کے شناختی کارڈ کی کاپی ساتھ لائیں۔ دفتر سے معلوم کریں کہ مزید کچھ درکار تو نہیں۔')}</p></article><article><h3>{tx(language,'Is hostel accommodation available?','کیا ہاسٹل کی سہولت موجود ہے؟')}</h3><p>{tx(language,'Yes, hostel accommodation is available for boys. Confirm availability, rules, and charges directly with the Jamia.','جی ہاں، لڑکوں کے لیے ہاسٹل کی سہولت موجود ہے۔ دستیابی، قواعد اور اخراجات کی تصدیق جامعہ سے کریں۔')}</p></article><article><h3>{tx(language,'How do I confirm fees and timings?','فیس اور اوقات کی تصدیق کیسے کروں؟')}</h3><p>{tx(language,'Call or WhatsApp the Jamia office to confirm the latest programme details before travelling.','سفر سے پہلے تازہ معلومات کے لیے جامعہ کے دفتر کو فون یا واٹس ایپ کریں۔')}</p></article></div></div></section></main></PageShell>;
}
function Contact() {
  const { language } = useLanguage(); const ur = language === 'ur';
  const [form,setForm]=useState({name:'',email:'',phone:'',program:'',message:''}); const [state,setState]=useState({busy:false,error:'',success:''});
  const onChange=e=>setForm({...form,[e.target.name]:e.target.value});
  async function submit(e){e.preventDefault();setState({busy:true,error:'',success:''});try{const d=await api('/inquiries',{method:'POST',body:JSON.stringify(form)});setState({busy:false,error:'',success:d.message||tx(language,'Your enquiry has been received.','آپ کا سوال موصول ہو گیا ہے۔')});setForm({name:'',email:'',phone:'',program:'',message:''});}catch(err){setState({busy:false,error:err.message,success:''});}}
  return <PageShell><main id="main-content"><SubHero eyebrow={tx(language,'CONTACT','رابطہ')} title={ur?<>گفتگو کا <em>آغاز کریں۔</em></>:<>Let’s start a <em>conversation.</em></>} text={tx(language,'Ask about programmes, admissions, or general information. The institution can follow up using the details you provide.','تعلیمی پروگراموں، داخلے یا عمومی معلومات کے بارے میں سوال بھیجیں۔ ادارہ آپ کی فراہم کردہ معلومات کے ذریعے جواب دے سکتا ہے۔')}/><section className="section-pad"><div className="container contact-grid"><div className="contact-copy"><Eyebrow>{tx(language,'GET IN TOUCH','رابطہ کریں')}</Eyebrow><h2>{ur?<>رہنمائی کے لیے <em>ہم سے رابطہ کریں۔</em></>:<>We’re here to help you find <em>clarity.</em></>}</h2><p>{tx(language,'Please do not include sensitive personal documents or confidential information in this message.','براہِ کرم اس پیغام میں ذاتی حساس دستاویزات یا خفیہ معلومات شامل نہ کریں۔')}</p><div className="contact-item"><span className="contact-icon">☎</span><div><small>{tx(language,'PHONE & WHATSAPP','فون اور واٹس ایپ')}</small><b><a href={`tel:${JAMIA.phoneE164}`} dir="ltr">{JAMIA.phone}</a></b><p><a href={JAMIA.whatsapp} target="_blank" rel="noreferrer">{tx(language,'Message the Jamia on WhatsApp','جامعہ کو واٹس ایپ پیغام بھیجیں')} ↗</a></p></div></div><div className="contact-item"><span className="contact-icon">✉</span><div><small>{tx(language,'EMAIL','ای میل')}</small><b><a href={`mailto:${JAMIA.email}`}>{JAMIA.email}</a></b><p>{tx(language,'Use this address for general enquiries.','عمومی سوالات کے لیے اس پتے پر ای میل کریں۔')}</p></div></div><div className="contact-item"><span className="contact-icon">⌖</span><div><small>{tx(language,'JAMIA LOCATION','جامعہ کا مقام')}</small><b>{tx(language,'Jamilabad, Taxila','جمیل آباد، ٹیکسلا')}</b><p>{tx(language, JAMIA.address, JAMIA.addressUrdu)}</p><a className="contact-map-link" href={JAMIA.mapUrl} target="_blank" rel="noreferrer">{tx(language,'Open the Jamia’s Google Maps location','جامعہ کا گوگل میپس مقام کھولیں')} ↗</a></div></div></div><form className="contact-form" onSubmit={submit}><div className="form-header"><h3>{tx(language,'Send an enquiry','سوال بھیجیں')}</h3><p>{tx(language,'Fields marked * are required.','* نشان والے خانے لازمی ہیں۔')}</p></div>{state.error&&<div className="form-alert error" role="alert">{state.error}</div>}{state.success&&<div className="form-alert success" role="status">{state.success}</div>}<div className="field-row"><label>{tx(language,'Full name','پورا نام')} *<input name="name" value={form.name} onChange={onChange} autoComplete="name" maxLength="100" required placeholder={tx(language,'Your full name','اپنا پورا نام لکھیں')}/></label><label>{tx(language,'Email address','ای میل')} *<input type="email" name="email" value={form.email} onChange={onChange} autoComplete="email" maxLength="160" required placeholder="you@example.com" dir="ltr"/></label></div><div className="field-row"><label>{tx(language,'Phone (optional)','فون (اختیاری)')}<input name="phone" value={form.phone} onChange={onChange} autoComplete="tel" maxLength="40" placeholder={tx(language,'Your contact number','رابطہ نمبر')} dir="ltr"/></label><label>{tx(language,'Interested in','دلچسپی کا موضوع')}<select name="program" value={form.program} onChange={onChange}><option value="">{tx(language,'Choose a topic','موضوع منتخب کریں')}</option><option>{ur?'حفظ القرآن':'Hifz-ul-Qur’an'}</option><option>{ur?'ناظرہ قرآن':'Nazra Qur’an'}</option><option>{ur?'تجوید':'Tajweed'}</option><option>{ur?'تدریسی پروگرام':'Teaching Program'}</option><option>{ur?'درسِ نظامی':'Dars-e-Nizami'}</option><option>{ur?'قراءت':'Qira’at'}</option><option>{ur?'اسلامی علوم':'Islamic Studies'}</option><option>{tx(language,'Admissions','داخلہ')}</option><option>{tx(language,'General enquiry','عمومی سوال')}</option></select></label></div><label>{tx(language,'How can we help?','ہم آپ کی کیسے مدد کر سکتے ہیں؟')} *<textarea name="message" value={form.message} onChange={onChange} minLength="5" maxLength="2000" rows="5" required placeholder={tx(language,'Write your question here…','اپنا سوال یہاں لکھیں…')}/></label><button className="button button-dark submit-button" type="submit" disabled={state.busy}>{state.busy?tx(language,'Sending…','بھیجا جا رہا ہے…'):tx(language,'Send your enquiry','سوال بھیجیں')} <span>↗</span></button><small className="privacy-note">{tx(language,'Your message is submitted to the website API and saved in its database.','آپ کا پیغام ویب سائٹ کے سرور کو بھیجا جائے گا اور ڈیٹا بیس میں محفوظ ہوگا۔')} <Link to="/privacy">{tx(language,'Read the privacy notice.','رازداری کا نوٹس پڑھیں۔')}</Link></small></form></div></section></main></PageShell>;
}

function AdminLogin() { const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const navigate=useNavigate(); async function submit(e){e.preventDefault();setBusy(true);setError('');try{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('jamia_admin_token',d.token);localStorage.setItem('jamia_admin_user',JSON.stringify(d.admin));navigate('/admin');}catch(err){setError(err.message);}finally{setBusy(false);}} return <div className="admin-login-page"><Link className="login-back" to="/">← Back to website</Link><div className="login-card"><Brand/><div className="login-intro"><Eyebrow>STAFF PORTAL</Eyebrow><h1>Welcome <em>back.</em></h1><p>Sign in to manage website content and enquiries.</p></div>{error&&<div className="form-alert error" role="alert">{error}</div>}<form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label><button className="button button-dark submit-button" disabled={busy}>{busy?'Signing in…':'Sign in securely'} <span>↗</span></button></form><p className="login-footnote">Admin credentials are set by the site owner in the server environment.</p></div></div>; }
function AdminDashboard() { const navigate=useNavigate();const [tab,setTab]=useState('overview');const [admin,setAdmin]=useState(null);const [overview,setOverview]=useState(null);const [programs,setPrograms]=useState([]);const [notices,setNotices]=useState([]);const [inquiries,setInquiries]=useState([]);const [busy,setBusy]=useState(true);const [message,setMessage]=useState('');const [error,setError]=useState('');const [programForm,setProgramForm]=useState({title:'',titleUrdu:'',category:'',categoryUrdu:'',description:'',descriptionUrdu:'',duration:'',durationUrdu:'',mode:'On campus',modeUrdu:'',featured:false});const [noticeForm,setNoticeForm]=useState({title:'',titleUrdu:'',excerpt:'',excerptUrdu:'',category:'Announcement',categoryUrdu:''});
  async function loadAll(){setBusy(true);setError('');try{const [o,p,n,i,m]=await Promise.all([api('/admin/overview'),api('/programs'),api('/notices'),api('/inquiries'),api('/auth/me')]);setOverview(o.overview);setAdmin(m.admin);setPrograms(p.programs);setNotices(n.notices);setInquiries(i.inquiries);}catch(e){setError(e.message);if(e.message.toLowerCase().includes('session')||e.message.toLowerCase().includes('sign in')||e.message.toLowerCase().includes('admin access')){localStorage.removeItem('jamia_admin_token');localStorage.removeItem('jamia_admin_user');navigate('/admin/login');}}finally{setBusy(false);}}
  useEffect(()=>{loadAll();},[]);
  async function removeItem(type,id){if(!window.confirm(`Delete this ${type.slice(0,-1)}? This cannot be undone.`))return;setMessage('');try{await api(`/${type}/${id}`,{method:'DELETE'});setMessage('Item deleted.');await loadAll();}catch(e){setError(e.message);}}
  async function addProgram(e){e.preventDefault();setMessage('');setError('');try{await api('/programs',{method:'POST',body:JSON.stringify(programForm)});setProgramForm({title:'',titleUrdu:'',category:'',categoryUrdu:'',description:'',descriptionUrdu:'',duration:'',durationUrdu:'',mode:'On campus',modeUrdu:'',featured:false});setMessage('Program published.');await loadAll();}catch(e){setError(e.message);}}
  async function addNotice(e){e.preventDefault();setMessage('');setError('');try{await api('/notices',{method:'POST',body:JSON.stringify(noticeForm)});setNoticeForm({title:'',titleUrdu:'',excerpt:'',excerptUrdu:'',category:'Announcement',categoryUrdu:''});setMessage('Notice published.');await loadAll();}catch(e){setError(e.message);}}
  async function statusChange(id,status){try{await api(`/inquiries/${id}`,{method:'PATCH',body:JSON.stringify({status})});setMessage('Inquiry status updated.');await loadAll();}catch(e){setError(e.message);}}
  function signOut(){localStorage.removeItem('jamia_admin_token');localStorage.removeItem('jamia_admin_user');navigate('/admin/login');}
  return <div className="dashboard"><aside className="dashboard-sidebar"><Brand/><div className="admin-badge">ADMIN WORKSPACE</div><nav className="dashboard-nav">{[['overview','▦','Overview'],['programs','◈','Programs'],['notices','▤','Notices'],['inquiries','✉','Enquiries'],['media','▧','Media library']].map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><span>{icon}</span>{label}</button>)}</nav><div className="sidebar-bottom"><div className="admin-avatar">{admin?.name?.slice(0,1)||'A'}</div><div className="admin-mini"><b>{admin?.name||'Administrator'}</b><small>{admin?.email||'Site administrator'}</small></div><button className="signout" onClick={signOut} aria-label="Sign out">↗</button></div></aside><main className="dashboard-main"><header className="dashboard-top"><div><span className="dashboard-kicker">JAMIA-TUR-RAZA GHOUSIA MEHRIA / MANAGEMENT</span><h1>{({overview:'Overview',programs:'Programs',notices:'Notices',inquiries:'Enquiries',media:'Media library'})[tab]}</h1></div><Link to="/" className="button button-outline dark-outline">View website ↗</Link></header><div className="dashboard-body">{error&&<div className="form-alert error" role="alert">{error}</div>}{message&&<div className="form-alert success" role="status">{message}</div>}{busy?<div className="loading-line">Loading dashboard…</div>:<>
    {tab==='overview'&&<><div className="overview-welcome"><div><span>GOOD TO SEE YOU</span><h2>Manage your website<br/>with <em>confidence.</em></h2><p>Keep learning information current and respond to incoming enquiries.</p></div><span className="welcome-symbol">✦</span></div><div className="metric-grid"><div className="metric-card"><span>LIVE PROGRAMS</span><b>{overview?.programs??0}</b><small>Available on the website</small></div><div className="metric-card"><span>PUBLISHED NOTICES</span><b>{overview?.notices??0}</b><small>Active announcements</small></div><div className="metric-card"><span>TOTAL ENQUIRIES</span><b>{overview?.inquiries??0}</b><small>Messages received</small></div><div className="metric-card attention"><span>NEW ENQUIRIES</span><b>{overview?.newInquiries??0}</b><small>Needs your attention</small></div></div><div className="dashboard-section-head"><div><h2>Latest enquiries</h2><p>Keep responses moving.</p></div><button className="text-link" onClick={()=>setTab('inquiries')}>View all ↗</button></div><div className="table-wrap"><table><thead><tr><th>NAME</th><th>TOPIC</th><th>RECEIVED</th><th>STATUS</th></tr></thead><tbody>{inquiries.slice(0,5).map(i=><tr key={i._id}><td><b>{i.name}</b><small>{i.email}</small></td><td>{i.program}</td><td>{new Date(i.createdAt).toLocaleDateString()}</td><td><span className={`status-pill ${i.status}`}>{i.status}</span></td></tr>)}{!inquiries.length&&<tr><td colSpan="4" className="empty-cell">No enquiries received yet.</td></tr>}</tbody></table></div></>}
    {tab==='programs'&&<><div className="dashboard-section-head"><div><h2>Learning programs</h2><p>Manage the programs visible to visitors.</p></div></div><form className="manage-form" onSubmit={addProgram}><h3>Add a programme</h3><p className="admin-form-hint">English fields are required. Urdu fields are optional but recommended for the bilingual site.</p><div className="field-row"><label>English title *<input value={programForm.title} onChange={e=>setProgramForm({...programForm,title:e.target.value})} required maxLength="120"/></label><label>Urdu title<input dir="rtl" value={programForm.titleUrdu} onChange={e=>setProgramForm({...programForm,titleUrdu:e.target.value})} maxLength="120" placeholder="پروگرام کا نام"/></label></div><div className="field-row"><label>English category *<input value={programForm.category} onChange={e=>setProgramForm({...programForm,category:e.target.value})} required maxLength="60"/></label><label>Urdu category<input dir="rtl" value={programForm.categoryUrdu} onChange={e=>setProgramForm({...programForm,categoryUrdu:e.target.value})} maxLength="60" placeholder="زمرہ"/></label></div><div className="field-row"><label>English description *<textarea rows="3" value={programForm.description} onChange={e=>setProgramForm({...programForm,description:e.target.value})} required maxLength="1200"/></label><label>Urdu description<textarea dir="rtl" rows="3" value={programForm.descriptionUrdu} onChange={e=>setProgramForm({...programForm,descriptionUrdu:e.target.value})} maxLength="1200" placeholder="پروگرام کی تفصیل"/></label></div><div className="field-row"><label>Duration<input value={programForm.duration} onChange={e=>setProgramForm({...programForm,duration:e.target.value})} maxLength="80" placeholder="e.g. 1 year"/></label><label>دورانیہ<input dir="rtl" value={programForm.durationUrdu} onChange={e=>setProgramForm({...programForm,durationUrdu:e.target.value})} maxLength="80" placeholder="مثلاً ایک سال"/></label></div><div className="field-row"><label>Mode<input value={programForm.mode} onChange={e=>setProgramForm({...programForm,mode:e.target.value})} maxLength="80"/></label><label>طریقۂ تعلیم<input dir="rtl" value={programForm.modeUrdu} onChange={e=>setProgramForm({...programForm,modeUrdu:e.target.value})} maxLength="80"/></label></div><label className="check-label"><input type="checkbox" checked={programForm.featured} onChange={e=>setProgramForm({...programForm,featured:e.target.checked})}/> Feature this programme</label><button className="button button-dark" type="submit">Publish programme +</button></form><div className="manage-list">{programs.map(p=><article className="manage-item" key={p._id}><div><span className="notice-tag">{p.category}</span><h3>{p.title}</h3><p>{p.description}</p></div><button className="delete-button" onClick={()=>removeItem('programs',p._id)}>Delete</button></article>)}{!programs.length&&<p className="empty-cell">No programs. Add your first one above.</p>}</div></>}
    {tab==='notices'&&<><div className="dashboard-section-head"><div><h2>News & notices</h2><p>Publish confirmed information and announcements.</p></div></div><form className="manage-form" onSubmit={addNotice}><h3>Publish a notice</h3><p className="admin-form-hint">Write an accurate English notice and add the approved Urdu version when available.</p><div className="field-row"><label>English title *<input value={noticeForm.title} onChange={e=>setNoticeForm({...noticeForm,title:e.target.value})} required maxLength="160"/></label><label>Urdu title<input dir="rtl" value={noticeForm.titleUrdu} onChange={e=>setNoticeForm({...noticeForm,titleUrdu:e.target.value})} maxLength="160" placeholder="اعلان کا عنوان"/></label></div><div className="field-row"><label>English category<input value={noticeForm.category} onChange={e=>setNoticeForm({...noticeForm,category:e.target.value})} maxLength="60"/></label><label>Urdu category<input dir="rtl" value={noticeForm.categoryUrdu} onChange={e=>setNoticeForm({...noticeForm,categoryUrdu:e.target.value})} maxLength="60" placeholder="زمرہ"/></label></div><div className="field-row"><label>English notice text *<textarea rows="4" value={noticeForm.excerpt} onChange={e=>setNoticeForm({...noticeForm,excerpt:e.target.value})} required maxLength="1400"/></label><label>Urdu notice text<textarea dir="rtl" rows="4" value={noticeForm.excerptUrdu} onChange={e=>setNoticeForm({...noticeForm,excerptUrdu:e.target.value})} maxLength="1400" placeholder="اعلان کی تفصیل"/></label></div><button className="button button-dark" type="submit">Publish notice +</button></form><div className="manage-list">{notices.map(n=><article className="manage-item" key={n._id}><div><span className="notice-tag">{n.category}</span><h3>{n.title}</h3><p>{n.excerpt}</p><small>{new Date(n.publishedAt||n.createdAt).toLocaleDateString()}</small></div><button className="delete-button" onClick={()=>removeItem('notices',n._id)}>Delete</button></article>)}{!notices.length&&<p className="empty-cell">No notices have been published.</p>}</div></>}
    {tab==='inquiries'&&<><div className="dashboard-section-head"><div><h2>Visitor enquiries</h2><p>Review messages and update their status.</p></div><span className="table-total">{inquiries.length} messages</span></div><div className="inquiries-list">{inquiries.map(i=><article className="inquiry-card" key={i._id}><div className="inquiry-top"><div><h3>{i.name}</h3><a href={`mailto:${i.email}`}>{i.email}</a>{i.phone&&<small>{i.phone}</small>}</div><span className={`status-pill ${i.status}`}>{i.status}</span></div><div className="inquiry-meta"><span>{i.program}</span><span>{new Date(i.createdAt).toLocaleString()}</span></div><p>{i.message}</p><label className="status-select-label">Update status<select value={i.status} onChange={e=>statusChange(i._id,e.target.value)}><option value="new">New</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></label></article>)}{!inquiries.length&&<div className="empty-panel"><span>✉</span><h3>No enquiries yet</h3><p>New messages from the public contact form will appear here.</p></div>}</div></>}
    {tab==='media'&&<MediaManager/>}
  </>}</div></main></div>;
}

function Privacy() {
  const { language } = useLanguage();
  const ur = language === 'ur';
  return <PageShell><main id="main-content"><SubHero eyebrow={tx(language, 'PRIVACY', 'رازداری')} title={ur ? <>آپ کی معلومات کی <em>حفاظت۔</em></> : <>A clear approach to <em>your privacy.</em></>} text={tx(language, 'This notice explains how the Jamia website handles information submitted through its contact form.', 'یہ نوٹس بتاتا ہے کہ جامعہ کی ویب سائٹ رابطہ فارم کے ذریعے بھیجی گئی معلومات کو کیسے سنبھالتی ہے۔')} /><section className="section-pad"><div className="container prose privacy-prose">{ur ? <><h2>رابطہ فارم کی معلومات</h2><p>جب آپ رابطہ فارم بھیجتے ہیں تو آپ کا نام، ای میل، اختیاری فون نمبر، منتخب پروگرام اور پیغام ویب سائٹ کے سرور کے ذریعے ڈیٹا بیس میں محفوظ ہو سکتے ہیں تاکہ جامعہ کا مجاز عملہ آپ کے سوال کا جواب دے سکے۔</p><h2>ذاتی دستاویزات مت بھیجیں</h2><p>رابطہ فارم میں ب فارم، شناختی کارڈ کی کاپی، پاس ورڈ، مالی معلومات یا کوئی دوسری حساس دستاویز شامل نہ کریں۔ داخلے کے لیے مطلوبہ دستاویزات دفتر کی ہدایات کے مطابق براہِ راست فراہم کریں۔</p><h2>رسائی اور تحفظ</h2><p>رابطہ ریکارڈ انتظامی پینل میں صرف مجاز منتظمین کے لیے ہونا چاہیے۔ ویب سائٹ کوئی آن لائن ادائیگی یا دستاویز اپ لوڈ فارم فراہم نہیں کرتی۔ انتظامیہ کو ڈیٹا بیس تک رسائی محدود رکھنی اور مناسب بیک اپ و حذف کرنے کے طریقہ کار برقرار رکھنے چاہییں۔</p><h2>زبان کی ترجیح اور ایڈمن لاگ اِن</h2><p>ویب سائٹ آپ کی منتخب زبان کو براؤزر کے مقامی اسٹوریج میں محفوظ کر سکتی ہے۔ ایڈمن لاگ اِن سیشن کا ٹوکن بھی منتظم کے اسی براؤزر میں محفوظ ہوتا ہے؛ منتظم کو مشترکہ یا عوامی ڈیوائس پر سائن اِن رہنے سے گریز کرنا چاہیے۔</p><h2>سوالات یا معلومات حذف کروانا</h2><p>اپنی بھیجی ہوئی معلومات کے بارے میں سوال یا حذف کروانے کی درخواست کے لیے جامعہ سے اس ای میل پر رابطہ کریں: <a href={`mailto:${JAMIA.email}`}>{JAMIA.email}</a>۔ ریکارڈ محفوظ رکھنے کی مدت انتظامیہ طے کرتی ہے، اس لیے براہِ کرم موجودہ طریقہ کار دفتر سے معلوم کریں۔</p></> : <><h2>Information submitted through the contact form</h2><p>When you submit an enquiry, your name, email, optional phone number, selected programme, and message may be stored in the website database so an authorised Jamia representative can respond.</p><h2>Do not send sensitive documents</h2><p>Do not attach or write B-Forms, identity-card copies, passwords, financial information, or other sensitive documents in the public contact form. Provide admission documents directly to the office following its instructions.</p><h2>Access and protection</h2><p>Enquiry records should be accessible only to authorised administrators through the protected dashboard. The website does not provide online payments or a public document-upload form. The institution should restrict database access and maintain appropriate backup and deletion procedures.</p><h2>Language preference and admin sign-in</h2><p>The site may store your language choice in browser local storage. An admin login token is also stored in the administrator’s browser; staff should avoid staying signed in on shared or public devices.</p><h2>Questions or a request to remove your information</h2><p>Contact the Jamia at <a href={`mailto:${JAMIA.email}`}>{JAMIA.email}</a> with questions about an enquiry or to request removal. The institution controls record-retention practices, so contact the office for its current policy.</p></>}<p className="privacy-policy-note">{tx(language, 'This draft should be reviewed and approved by the institution before public launch. It is a practical website notice, not legal advice.', 'اس مسودے کو ویب سائٹ عام کرنے سے پہلے ادارے کی منظوری درکار ہے۔ یہ ویب سائٹ کے لیے عملی نوٹس ہے، قانونی مشورہ نہیں۔')}</p></div></section></main></PageShell>;
}

function NotFound() {
  const { language } = useLanguage();

  return (
    <PageShell>
      <main id="main-content" className="not-found container">
        <span>404</span>
        <h1>{tx(language, 'This page isn’t here.', 'یہ صفحہ دستیاب نہیں ہے۔')}</h1>
        <p>
          {tx(
            language,
            'The page may have moved or the address may be incorrect.',
            'ممکن ہے صفحہ منتقل ہو گیا ہو یا پتہ درست نہ ہو۔'
          )}
        </p>
        <Link className="button button-dark" to="/">
          {tx(language, 'Back to home', 'صفحۂ اول پر واپس')} ↗
        </Link>
      </main>
    </PageShell>
  );
}

function AppRoutes() {
  const { language } = useLanguage();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/programs/:slug" element={<ProgramDetail />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/admissions" element={<Admissions />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  const [language, setLanguage] = useState(
    () => (localStorage.getItem('jamia_language') === 'ur' ? 'ur' : 'en')
  );
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('jamia_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' && !location.pathname.startsWith('/admin') ? 'rtl' : 'ltr';
  }, [language, location.pathname]);

  const publicRtl = language === 'ur' && !location.pathname.startsWith('/admin');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <a className="skip-link" href="#main-content">
        {language === 'ur' ? 'مواد پر جائیں' : 'Skip to content'}
      </a>
      <div className={publicRtl ? 'app-shell is-urdu' : 'app-shell'} dir={publicRtl ? 'rtl' : 'ltr'}>
        <AppRoutes />
      </div>
    </LanguageContext.Provider>
  );
}
