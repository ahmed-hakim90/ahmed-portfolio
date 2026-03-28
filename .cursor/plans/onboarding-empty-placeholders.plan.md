---
name: ""
overview: ""
todos:
  - id: todo-1774586823394-ddhcrnwsz
    content: ""
    status: completed
isProject: false
---

# حقول الـ onboarding: قيم فارغة + placeholder لكل الخطوات

## لماذا تظهر القيم الآن (مثل لقطة الشاشة)

- خطوة **المعلومات الشخصية** (`step-personal.tsx`) تربط الحقول بـ `useState(siteData.*)` وتُحدَّث من `useEffect` عند تغيّر `siteData`.
- `siteData` يأتي من `mergeSiteJsonForSave` بعد الجلب من API، فيُدمج **القالب** (`[site-defaults.json](src/data/site-defaults.json)`) مع ما في Firestore؛ فيظهر اسم إنجليزي، موقع Helwan، وصف طويل، و`/me1.jpg` **كقيم حقيقية في الحقل** وليست `placeholder`.
- لم يُطبَّق بعد مسار «أول إعداد»: عرض نسخة **مصفّرة** من الحقول القابلة للتحرير مع الإبقاء على النص التوضيحي في `placeholder` فقط.

## السلوك المتفق عليه (معنى طلبك)

نعم، المقصود يتوافق مع هذا الوصف:

1. **قبل ما المستخدم يحفظ بياناته الخاصة في أول رحلة إعداد**: الحقول تظهر **فارغة** (`value` فاضي)، والنص التوضيحي يظهر كـ `**placeholder` فقط** — مش قيم القالب أو البذرة داخل الحقل.
2. **بعد ما يضغط «حفظ ومتابعة» (أو أي حفظ ناجح لخطوة)**: اللي اتكتب واتبعت لـ `sites/{uid}` يبقى **داتا بتاعته**، والمعالج يعرضها في الخطوات التالية ولو **رجع لخطوة سابقة** يشوف اللي هو فعلاً محفوظ.
3. **المحرر** (`/dashboard/site`) يفضل يعتمد على **نفس مستند الموقع** في Firestore لنفس المستخدم — يعني مصدر الحقيقة واحد: بيانات اليوزر المحفوظة، مش نص القالب الافتراضي كقيم ظاهرة في الحقول.

**استثناء مهم:** لو اليوزر **سبق وأكمل الـ onboarding مرة** ثم **فتح المعالج تاني** من الإعدادات، نعرض **الداتا المحفوظة مباشرة** (مش تصفير)، لأن دي تعديل على موقع جاهزة مش «أول إنشاء».

## الهدف

- **أول رحلة onboarding** (مستخدم لم يُكمل الـ onboarding من قبل على هذا الحساب): كل حقول النصوص والقوائم في **كل** الخطوات تبدأ **فارغة**؛ الأمثلة تظهر فقط عبر `placeholder` (عربي واضح).
- **بعد أول حفظ ناجح** في المعالج: الاعتماد على بيانات الـ `site` المحفوظة كما هو اليوم (لتفادي فقدان ما كتبه عند التنقّل).
- **بعد إتمام الـ onboarding مرة ثم إعادة فتح المعالج من الإعدادات**: **prefill** من البيانات المحفوظة (لا تصفير).

## التصميم التقني (ملخّص)

1. **علامة في Firestore** على مستند `admin_users`: `onboardingEverCompletedOnce` تُضبط `true` عند أول `markOnboardingComplete` ولا تُمسح عند `reopenOnboarding`.
2. `**prefillOnboardingInputs = user.onboardingEverCompletedOnce`** يُمرَّر من `[onboarding/page.tsx](src/app/dashboard/onboarding/page.tsx)` إلى `[onboarding-wizard.tsx](src/app/dashboard/onboarding/onboarding-wizard.tsx)`.
3. **دالة** `[applyOnboardingEmptyDisplay(base: SiteJson)](src/lib/onboarding-empty-display.ts)` تصفّر الحقول التي يحرّرها المعالج (اسم، أحرف، موقع، روابط، وصف، ملخص، صورة، مهارات، عمل، تعليم، مشاريع، بريد، هاتف، روابط السوشيال) مع الإبقاء على هيكل `navbar` و`publicControls` و`url` إن لزم.
4. في الـ wizard: `wizardSiteData = prefill || usedRealSiteData ? siteData : applyOnboardingEmptyDisplay(siteData)`؛ `**usedRealSiteData`** يصبح `true` بعد **أول** `handleSave` ناجح (الـ `PUT` إلى `/api/admin/site`). **التخطّي** لا يفعّل الـ prefill من الـ API لكن يبقى العرض مصفّراً حتى أول حفظ.
5. تمرير `**wizardSiteData`** (وليس `siteData` الخام) إلى كل خطوات `Step`*.

## نطاق الملفات (كل الحقول)


| الخطوة | الملف                                                                         | ملاحظات                                                                                                 |
| ------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 0      | `[step-personal.tsx](src/app/dashboard/onboarding/steps/step-personal.tsx)`   | التأكد من `placeholder` لكل input/textarea؛ حقل الصورة عبر `DriveUrlField` يعرض قيمة فارغة مع نص توضيحي |
| 1      | `[step-contact.tsx](src/app/dashboard/onboarding/steps/step-contact.tsx)`     | بريد، هاتف، روابط — placeholders لكل حقل                                                                |
| 2      | `[step-skills.tsx](src/app/dashboard/onboarding/steps/step-skills.tsx)`       | حقل إضافة المهارة + قائمة فارغة؛ `placeholder` للإدخال                                                  |
| 3      | `[step-work.tsx](src/app/dashboard/onboarding/steps/step-work.tsx)`           | كل حقول الخبرة                                                                                          |
| 4      | `[step-education.tsx](src/app/dashboard/onboarding/steps/step-education.tsx)` | كل حقول التعليم                                                                                         |
| 5      | `[step-projects.tsx](src/app/dashboard/onboarding/steps/step-projects.tsx)`   | كل حقول المشاريع                                                                                        |
| 6      | `[step-done.tsx](src/app/dashboard/onboarding/steps/step-done.tsx)`           | لا حقول إدخال نصية بحاجة تصفير                                                                          |


## واجهات برمجية / أنواع

- `[admin-users.ts](src/lib/admin-users.ts)`: الحقل في `AdminUserDoc` / `AdminUserPublic` + `docToPublic` + تحديث `markOnboardingComplete`.
- `[api/admin/profile/route.ts](src/app/api/admin/profile/route.ts)`: إرجاع `onboardingEverCompletedOnce` في `GET` إن لزم للواجهات.

## تحقق

- حساب جديد: فتح `/dashboard/onboarding` — الخطوة 0 كل الحقول فارغة، لا يظهر نص القالب داخل الحقول؛ الضغط على «حفظ» يحفظ ثم الخطوات التالية تعرض البيانات المدمجة الحقيقية.
- إعادة فتح المعالج بعد إتمام سابق: الحقول مملوءة من الموقع المحفوظ.

## حالة التنفيذ (محدّثة)

- **منفّذ جزئياً:** تصفير العرض في المعالج (`applyOnboardingEmptyDisplay`)، `onboardingEverCompletedOnce`، وقفل **الزائر** عند `!onboardingCompleted` عبر `[isPublicPortfolioPublished](src/lib/public-portfolio-access.ts)` و`[PortfolioSetupPlaceholder](src/components/portfolio/portfolio-setup-placeholder.tsx)`.
- **غير منفّذ / يحتاج توسيع:** شروط النشر أدناه (خطوات كاملة + حد أدنى بيانات)، وتوحيد «المعاينة العامة» مع نفس الشروط.

---

## توسيع متفق عليه: نشر للزائر والمعاينة فقط

**القصد (من مراجعة المنتج):**

1. **كل رحلة الـ onboarding:** لا تُعرض قيم من القالب داخل الحقول — فقط **placeholders عادية** وحقل فاضي (مع استثناء إعادة فتح المعالج بعد إتمام سابق كما سبق).
2. **طالما الداتا ناقصة أو فاضية أو لم تُمشَ كل الخطوات:** ما ينفعش للزائر يشوف موقع حقيقية — **ولا معاينة عامة** (نفس قاعدة الزائر).
3. **المحرر `[/dashboard/site](src/app/dashboard/(admin)`/site/page.tsx):** يبقى **متاح للمالك** أثناء الإعداد؛ القفل يخص **العالم الخارجي والمعاينة العامة** فقط، لا حظر المحرر على المالك.

**تعريف عملي مقترح (للتنفيذ لاحقاً):**

- **خطوات مكتملة:** مثلاً `onboardingStep` وصل لآخر خطوة قبل «تم» و/أو تم تسجيل إكمال صريح من خطوة Done — يُحدَّد في الكود ليتوافق مع سلوك الـ wizard الحالي (بما فيه «تخطّي» إن وُجد).
- **بيانات غير فارغة (حد أدنى):** دالة تحقق على `SiteJson` بعد الدمج مع القالب (أو على ما في `sites/{uid}`) — مثلاً: الاسم الظاهر، وصف قصير، بريد أو قناة تواصل واحدة على الأقل، إلخ — **قائمة الحقول الإلزامية تُحدَّد صراحة** وتُطبَّق في الخادم.
- **دالة واحدة للنشر:** توسيع `[isPublicPortfolioPublished](src/lib/public-portfolio-access.ts)` (أو استبدالها بـ `canShowPublicPortfolio(user, siteJson)`) لتجمع:
  - `onboardingCompleted === true`
  - **و** اجتياز التحقق من الخطوات (إن طُبّق)
  - **و** اجتياز التحقق من الحد الأدنى للبيانات  
  وتُستدعى من صفحات `/(public)/(user)/[slug]/`*، وAPIs العامة، والـ OG، وأي **رابط معاينة عام** في لوحة التحكم (إن وُجد).

**ملاحظة:** اليوم أي حقل محفوظ كسلسلة فارغة في Firestore قد يطغى على القالب في `[deepMergeSite](src/lib/site-hydrate.ts)`؛ شرط «بيانات كاملة» يمنع نشر صفحة «فاضية» حتى لو ضُغط إنهاء الإعداد بالخطأ.

---

## حالة التنفيذ (ملخّص)


| الجزء                                    | الحالة                                                |
| ---------------------------------------- | ----------------------------------------------------- |
| حقول onboarding بدون قالب في القيم       | منفّذ جزئياً (wizard + `applyOnboardingEmptyDisplay`) |
| قفل `/slug` للزائر عند عدم إكمال الإعداد | منفّذ (`onboardingCompleted`)                         |
| قفل عند خطوات ناقصة + داتا فاضية         | **مطلوب تنفيذ**                                       |
| معاينة عامة بنفس شروط الزائر             | **مطلوب تنفيذ** حيثما تظهر المعاينة                   |
| `/dashboard/site` للمالك                 | **يبقى مفتوحاً** (لا قفل)                             |


