require('dotenv').config();
const connectDB = require('../src/config/db');
const Program = require('../src/models/Program');
const Notice = require('../src/models/Notice');

// Remove only known generic starter/demo records. Preserve all other admin-created content.
const legacyProgramSlugs = ['quran-studies', 'arabic-language', 'tarbiyat-course'];
const legacyNoticeSlugs = ['admissions-information', 'office-announcements'];
const programs = [
  {
    title: 'Hifz-ul-Qur’an', titleUrdu: 'حفظ القرآن', slug: 'hifz-ul-quran',
    category: 'Qur’an memorisation', categoryUrdu: 'حفظِ قرآن',
    description: 'A guided learning pathway for students who wish to memorise the Holy Qur’an. Contact the Jamia to confirm class placement, timetable, and admission requirements.',
    descriptionUrdu: 'حفظِ قرآن کے خواہش مند طلبہ کے لیے رہنمائی پر مبنی تعلیمی پروگرام۔ جماعت، اوقات اور داخلے کی شرائط کے لیے جامعہ سے رابطہ کریں۔',
    duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true, active: true
  },
  {
    title: 'Nazra Qur’an', titleUrdu: 'ناظرہ قرآن', slug: 'nazra-quran',
    category: 'Qur’an reading', categoryUrdu: 'قرآن خوانی',
    description: 'Guided Qur’an reading for learners. Ask the Jamia about suitable class placement, timings, and the current admission process.',
    descriptionUrdu: 'قرآنِ کریم پڑھنے کے لیے رہنمائی پر مبنی تعلیم۔ مناسب جماعت، اوقات اور داخلے کے موجودہ طریقۂ کار کے لیے جامعہ سے معلومات لیں۔',
    duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true, active: true
  },
  {
    title: 'Tajweed', titleUrdu: 'تجوید', slug: 'tajweed',
    category: 'Correct recitation', categoryUrdu: 'درست تلاوت',
    description: 'Study the foundations of correct Qur’anic pronunciation and recitation. Contact the office to confirm the current syllabus and class schedule.',
    descriptionUrdu: 'قرآنِ کریم کی درست ادائیگی اور تلاوت کے بنیادی اصولوں کا مطالعہ۔ موجودہ نصاب اور اوقات کی تصدیق کے لیے دفتر سے رابطہ کریں۔',
    duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true, active: true
  },
  {
    title: 'Teaching Program', titleUrdu: 'تدریسی پروگرام', slug: 'teaching-course',
    category: 'Teaching practice', categoryUrdu: 'تدریسی مہارتیں',
    description: 'A learning programme focused on teaching skills. Contact the Jamia to confirm the current content and availability.',
    descriptionUrdu: 'تدریسی مہارتوں پر مبنی تعلیمی پروگرام۔ موجودہ تفصیلات اور دستیابی کے لیے جامعہ سے رابطہ کریں۔',
    duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true, active: true
  },
  {
    title: 'Dars-e-Nizami', titleUrdu: 'درسِ نظامی', slug: 'dars-e-nizami',
    category: 'Classical Islamic studies', categoryUrdu: 'درسِ نظامی',
    description: 'A pathway in classical Islamic learning. Contact the Jamia to confirm the current curriculum, stages, timetable, and eligibility.',
    descriptionUrdu: 'درسِ نظامی کے تحت روایتی اسلامی تعلیم کا پروگرام۔ موجودہ نصاب، درجات، اوقات اور اہلیت کی تصدیق کے لیے جامعہ سے رابطہ کریں۔',
    duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true, active: true
  },
  {
    title: 'Qira’at', titleUrdu: 'قراءت', slug: 'qirat',
    category: 'Qur’anic recitation', categoryUrdu: 'تلاوتِ قرآن',
    description: 'A learning pathway focused on Qur’anic recitation. Ask the office to confirm the teaching approach, class level, and schedule.',
    descriptionUrdu: 'قرآنِ کریم کی قراءت پر توجہ دینے والا تعلیمی پروگرام۔ تدریسی طریقۂ کار، جماعت اور اوقات کی تصدیق کے لیے دفتر سے رابطہ کریں۔',
    duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true, active: true
  },
  {
    title: 'Islamic Studies', titleUrdu: 'اسلامی علوم', slug: 'islamic-studies',
    category: 'Foundational Islamic knowledge', categoryUrdu: 'بنیادی اسلامی تعلیم',
    description: 'Explore foundational Islamic knowledge through the subjects and level offered by the Jamia. Contact the office for the current syllabus and class placement.',
    descriptionUrdu: 'جامعہ میں پڑھائے جانے والے مضامین اور درجے کے مطابق بنیادی اسلامی علوم کا مطالعہ۔ موجودہ نصاب اور جماعت کی معلومات کے لیے دفتر سے رابطہ کریں۔',
    duration: 'Confirm with the office', durationUrdu: 'دفتر سے معلوم کریں', mode: 'Contact the office', modeUrdu: 'دفتر سے معلوم کریں', featured: true, active: true
  }
];
const notices = [
  {
    title: 'Admissions are open throughout the year',
    titleUrdu: 'داخلے سال بھر کھلے ہیں',
    slug: 'admissions-open-year-round',
    category: 'Admissions', categoryUrdu: 'داخلہ',
    excerpt: 'Admissions are open year-round. Please contact the Jamia to confirm current programme availability, class eligibility, timings, and the process before visiting. Required documents: the student’s B-Form and a copy of the father’s CNIC. Boys’ hostel accommodation is available; confirm places, rules, and charges with the office.',
    excerptUrdu: 'داخلے سال بھر کھلے ہیں۔ آنے سے پہلے پروگرام کی دستیابی، اہلیت، اوقات اور طریقۂ کار کی تصدیق کے لیے جامعہ سے رابطہ کریں۔ ضروری دستاویزات: طالب علم کا ب فارم اور والد کے شناختی کارڈ کی کاپی۔ لڑکوں کے لیے ہاسٹل موجود ہے؛ جگہ، قواعد اور اخراجات کی تصدیق دفتر سے کریں۔',
    publishedAt: new Date(), active: true
  }
];

(async () => {
  try {
    await connectDB();
    await Program.deleteMany({ slug: { $in: legacyProgramSlugs } });
    await Notice.deleteMany({ slug: { $in: legacyNoticeSlugs } });
    for (const item of programs) await Program.updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
    for (const item of notices) await Notice.updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
    console.log(`Jamia content seeded: ${programs.length} programmes and ${notices.length} admission notice(s). Existing unrelated admin-created content was preserved.`);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await require('mongoose').disconnect();
  }
})();
