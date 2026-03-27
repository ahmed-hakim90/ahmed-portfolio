---
name: Changelog بدون GitHub Actions
overview: إيقاف الاعتماد على GitHub Actions لتحديث CHANGELOG_PUSHES.md والاعتماد على أتمتة محلية مجانية بالكامل (npm script واختياري git hook)، مع توثيق التغيير وإزالة أو تعطيل الـ workflow.
todos:
  - id: remove-workflow
    content: حذف أو تعطيل .github/workflows/changelog-log.yml (workflow فقط؛ لا يؤثر على استضافة الموقع)
    status: completed
  - id: docs-copy
    content: تحديث نص CHANGELOG_PUSHES.md (الهيدر الافتراضي في السكربت) وCHANGELOG.md ليعكس التحديث المحلي بدل Actions
    status: completed
  - id: script-comment
    content: تعديل تعليق رأس scripts/append-push-changelog.mjs ليعكس الاستخدام المحلي + githubRepoFromRemote
    status: completed
  - id: optional-hook
    content: "(اختياري) إضافة pre-push hook يشغّل npm run changelog:log ويضيف الملف للـ commit"
    status: cancelled
---

# سجل الدفعات بدون دفع لـ GitHub أو الاعتماد على Actions

## المطلوب

تحديث `CHANGELOG_PUSHES.md` **من غير** الاعتماد على أي خدمة في GitHub قد تربطك بفوترة أو تفشل بسبب قفل الحساب.

## الواقع التقني

- **GitHub Actions** للمستودعات العامة عادة لها حصة مجانية؛ رسالة القفل جاءت من **حساب GitHub** (فوترة عامة)، وليس من “ميزة مدفوعة” للسكربت وحده. لكن بما أنك لا تريد الاعتماد على Actions، الحل هو **إزالة الـ workflow** والاعتماد على الجهاز فقط.

## ما هو جاهز في المشروع بالفعل

- السكربت: [`scripts/append-push-changelog.mjs`](scripts/append-push-changelog.mjs)
- الأوامر في [`package.json`](package.json):
  - `npm run changelog:log` — يحدّث الملف
  - `npm run changelog:log:dry` — معاينة بدون كتابة

يعمل محلياً باستخدام `git` و`HEAD`؛ متغيرات `GITHUB_*` اختيارية لتحسين الرابط في CI فقط.

## خطة التنفيذ (بعد موافقتك على الخروج من وضع الخطة)

1. **إزالة التشغيل على GitHub**  
   - حذف [`/.github/workflows/changelog-log.yml`](.github/workflows/changelog-log.yml) **أو** إبقاء الملف مع `workflow_dispatch` فقط وتعطيل `on: push` إن أردت الاحتفاظ بالملف فارغاً للمرجع — الأبسط: **حذف الملف** إذا لن تستخدم Actions لهذا الغرض.

2. **مواءمة النصوص**  
   - تحديث الهيدر الافتراضي داخل السكربت (السطور التي تُكتب عند إنشاء `CHANGELOG_PUSHES.md` لأول مرة) ليقول إن التحديث **يدوي/محلي** (مثلاً بعد كل commit أو قبل `git push`) بدل “عند كل push عبر GitHub Actions”.  
   - تحديث الفقرة في [`CHANGELOG.md`](CHANGELOG.md) التي تشير إلى الـ workflow.

3. **(اختياري) أتمتة محلية**  
   - **pre-push hook** (في `.git/hooks/pre-push` أو عبر أداة مثل Husky إن كان المشروع يستخدمها): يشغّل `npm run changelog:log` ثم يطلب منك إضافة `CHANGELOG_PUSHES.md` للـ commit إن تغيّر — أو يذكّرك بتشغيل الأمر يدوياً.  
   - البديل الأبسط بدون hooks: عادة عمل `npm run changelog:log` ثم commit قبل الـ push.

4. **تحسين اختياري للروابط**  
   - إذا أردت روابط commit صحيحة بدون `GITHUB_REPOSITORY`: استنتاج `user/repo` من `git remote get-url origin` عندما لا تُضبط المتغيرات — يمكن إدراجها كتحسين لاحق في نفس السكربت.

## ملخص

| قبل | بعد |
|-----|-----|
| تحديث تلقائي على السيرفر عبر Actions | لا workflow؛ تحديث عبر `npm run changelog:log` محلياً |
| يعتمد على حالة حساب GitHub | لا يعتمد على تشغيل أي job على GitHub |

لا حاجة لدفع شيء لـ GitHub لهذا السلوك الجديد؛ كل شيء على جهازك وبنفس سكربت المشروع.
