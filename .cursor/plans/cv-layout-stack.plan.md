---
name: CV layout stack order
overview: "مواءمة ترتيب وعرض عناصر السيرة بين الطباعة وملف الـ PDF: تخطيط عمود واحد متسلسل مع خطوط أفقية كاملة العرض بين الأقسام (مثل معاينة الطباعة)، بدون أولوية لتسجيل خطوط Playfair/DM Sans في هذه المرحلة."
todos:
  - id: print-html-stack
    content: "إعادة هيكلة CvPrintDocument: إزالة شبكة Summary|Contact جنبًا إلى جنب؛ ترتيب عمودي — Header → خط سفلي → Summary → خط سفلي → Contact → خط سفلي → ثم Work / Education / Skills / Projects بنفس المنطق (أو دمج Projects تحت الأقسام حسب نفس المرجع)"
    status: completed
  - id: pdf-stack-parity
    content: "إعادة هيكلة CvPdfDocument بنفس التسلسل: إزالة صفّين (mainCol|sideCol) للجزء العلوي؛ Views عمودية + borderBottomWidth كامل العرض بين الأقسام؛ مواءمة ترتيب Key Projects مع الطباعة"
    status: completed
  - id: spacing-dividers
    content: "ضبط الهوامش بين العنوان والنص وبين القسم والخط (مطابقة تقريبية للقطة): عناوين bold يسار، محتوى يسار، بدون justify إلزامي إذا كان المرجع يسار فقط"
    status: completed
  - id: verify-print-pdf
    content: مقارنة بصرية /dashboard/cv-print مع PDF المُحمّل بعد التعديل
    status: completed
isProject: false
---

# ترتيب عناصر السيرة (عمود واحد + فواصل)

## ما يطلبه المستخدم (مرجع المعاينة)

- **ليس التركيز على الخط** في هذه الخطوة؛ المطلوب **ترتيب العناصر** كالتالي:
  1. **رأس**: الاسم + السطر التعريفي يسار، الصورة يمين، ثم **خط أفقي رفيع بعرض الصفحة** تحت الرأس.
  2. **قسم Summary**: عنوان ثم فقرة/نص تحته بعرض كامل، ثم **خط أفقي** يفصل عن التالي.
  3. **قسم Contact**: عنوان ثم قائمة (بريد، هاتف، روابط…) سطرًا بسطر، بعرض كامل، ثم **خط أفقي** إن وُجد في التصميم المرجعي.
  4. استكمال باقي الأقسام (خبرة، تعليم، مهارات، مشاريع) **بنفس أسلوب التكديس العمودي** وليس عمودين متوازيين كما في التخطيط الحالي على الشاشات الكبيرة.

## الوضع الحالي في الكود

- `[src/components/cv/cv-print-document.tsx](src/components/cv/cv-print-document.tsx)`: يستخدم `grid` لجعل **Summary** و **Contact** جنبًا إلى جنب (`lg:col-span-8` / `4`)، وكذلك **Work + Key Projects** في صف ثانٍ. هذا يختلف عن المرجع (عمود واحد متتابع).
- `[src/components/cv/cv-pdf-document.tsx](src/components/cv/cv-pdf-document.tsx)`: يعكس نفس الفكرة بـ `flexDirection: "row"` وعمودين.

## التنفيذ المقترح

1. **طباعة HTML (`CvPrintDocument`)**
  - استبدال شبكة Summary/Contact بـ `<section>` متتالية بعرض `col-span-12` فقط (بدون `lg:col-span-8/4`).
  - بعد الرأس: إما الإبقاء على `border-b` على الرأس فقط أو إضافة فواصل صريحة (`border-b border-black/20` أو `hr`) بعد كل قسم كما في المرجع.
  - الجزء السفلي: إما عمود واحد لكل من Experience و Education و Skills و Key Projects بالتتابع، أو عمود واحد للنص الرئيسي ثم قسم مشاريع منفصل بخط فاصل — يُختار الأقرب بصريًا للصورة المرجعية الكاملة (إن وُجدت صفحات إضافية بنفس النمط).
2. **PDF (`CvPdfDocument`)**
  - إزالة `row` + `mainCol`/`sideCol` للكتلة العلوية؛ بناء عمود `View` واحد: Header → Summary → Contact، كل منها يليه `View` بـ `borderBottomWidth`/`borderBottomColor` بعرض المحتوى.
  - إعادة ترتيب Work / Education / Skills / Projects ككتل عمودية متتالية بنفس الفواصل.
  - الإبقاء على `Page wrap` لتعدد الصفحات.
3. **الخطوط (Playfair/DM Sans)**
  - **تأجيل** أو إلغاء أولويتها في هذه المهمة؛ لا تُربط نجاح التذكرة بتسجيل الخطوط.
4. **التحقق**
  - مقارنة `/dashboard/cv-print` (معاينة طباعة) مع PDF بعد التعديل من نفس المصدر.

## ملفات التعديل المتوقعة

- `[src/components/cv/cv-print-document.tsx](src/components/cv/cv-print-document.tsx)`
- `[src/components/cv/cv-pdf-document.tsx](src/components/cv/cv-pdf-document.tsx)`

