// قائمة الكلمات المحظورة (يمكن إضافة المزيد حسب الحاجة)
const BLOCKED_WORDS = [
  // كلمات عربية غير لائقة
  'احتيال', 'نصب', 'خداع', 'تزوير', 'غش', 'سرقة', 'مخدرات', 'حرام', 'مسروق',
  'ممنوع', 'مزيف', 'تقليد', 'مقلد', 'كوبي', 'فيك', 'replica', 'fake', 'copy',
  'احا', 'كسم', 'يلعن', 'منيك', 'زبي', 'كسي', 'طيز', 'شرموطة', 'عاهرة',
  'قحبة', 'ابن كلب', 'ابن عاهرة', 
  'scam', 'fraud', 'cheat', 'stolen', 'fake', 'counterfeit', 'replica', 'copy',
  'drugs', 'weapon', 'gun', 'bomb', 'kill', 'murder', 'terrorist', 'suicide',
  'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell', 'sex', 'porn', 'nude'
];

// كلمات مشبوهة تحتاج للمراجعة
const SUSPICIOUS_WORDS = [
  'سعر مغري جداً', 'فرصة ذهبية', 'استثمار مضمون', 'ربح سريع', 'بدون مجهود',
  'اتصل بسرعة', 'العرض محدود', 'آخر قطعة', 'سعر خاص', 'تصفية نهائية'
];

export interface ProfanityCheckResult {
  isClean: boolean;
  blockedWords: string[];
  suspiciousWords: string[];
  message?: string;
}

/**
 * فحص النص للكلمات غير اللائقة أو المحظورة
 */
export function checkProfanity(text: string): ProfanityCheckResult {
  if (!text || text.trim().length === 0) {
    return {
      isClean: true,
      blockedWords: [],
      suspiciousWords: []
    };
  }

  const normalizedText = text.toLowerCase().trim();
  const foundBlockedWords: string[] = [];
  const foundSuspiciousWords: string[] = [];

  // فحص الكلمات المحظورة
  for (const word of BLOCKED_WORDS) {
    if (normalizedText.includes(word.toLowerCase())) {
      foundBlockedWords.push(word);
    }
  }

  // فحص الكلمات المشبوهة
  for (const word of SUSPICIOUS_WORDS) {
    if (normalizedText.includes(word.toLowerCase())) {
      foundSuspiciousWords.push(word);
    }
  }

  const isClean = foundBlockedWords.length === 0;
  
  let message = '';
  if (!isClean) {
    message = 'يحتوي النص على كلمات تخالف سياسة الموقع. يرجى مراجعة المحتوى وإزالة الكلمات غير المناسبة.';
  } else if (foundSuspiciousWords.length > 0) {
    message = 'تم العثور على كلمات قد تكون مشبوهة. يرجى التأكد من صحة المعلومات.';
  }

  return {
    isClean,
    blockedWords: foundBlockedWords,
    suspiciousWords: foundSuspiciousWords,
    message
  };
}

/**
 * فحص سريع للنص - يُرجع true إذا كان النص نظيفاً
 */
export function isTextClean(text: string): boolean {
  return checkProfanity(text).isClean;
}

/**
 * تنظيف النص من الكلمات المحظورة (استبدالها بعلامات *)
 */
export function cleanText(text: string): string {
  if (!text) return text;
  
  let cleanedText = text;
  
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(word, 'gi');
    cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
  }
  
  return cleanedText;
}