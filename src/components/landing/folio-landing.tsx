import { getPublicBuildLabel } from "@/lib/build-label";
import type { PublicStats } from "@/lib/public-stats";
import Link from "next/link";
import "./folio-landing.css";
import { FolioLandingClient } from "./folio-landing-client";
import { MockBrowserThemeToggle } from "./mock-browser-theme-toggle";

function formatArNumber(n: number): string {
  return n.toLocaleString("ar-EG");
}

type FolioLandingProps = {
  stats: PublicStats;
};

export function FolioLanding({ stats }: FolioLandingProps) {
  const buildLabel = getPublicBuildLabel();
  const accounts =
    stats.users !== null ? `+${formatArNumber(stats.users)}` : "+٢٤٠٠";
  const projects = formatArNumber(stats.projectCards);
  const posts = formatArNumber(stats.blogPosts);

  return (
    <>
      <FolioLandingClient />
      <div
        id="folio-landing-root"
        className="folioLanding print:hidden"
        dir="rtl"
        lang="ar"
      >
        <div className="folioCursor" id="folio-cursor" aria-hidden />
        <div className="folioCursorRing" id="folio-cursor-ring" aria-hidden />

        <nav className="folioNav" id="folio-nav">
          <div className="folioLogo">
            <div className="folioLogoDot" />
            HAKIMO CV
          </div>
          <div className="folioNavLinks">
            <a href="#features">المميزات</a>
            <a href="#how">كيف يعمل</a>
            <a href="#testimonials">آراء المستخدمين</a>
          </div>
          <div className="folioNavRight">
            <Link className="folioNbtn folioNbtnGhost" href="/dashboard/login">
              تسجيل دخول
            </Link>
            <Link className="folioNbtn folioNbtnSolid" href="/signup">
              ابدأ مجاناً
            </Link>
          </div>
        </nav>

        <div className="folioTickerWrap">
          <div className="folioTickerTrack">
            {(
              [
                "محفظة احترافية",
                "بدون كود",
                "وضع داكن وفاتح",
                "لوحة تحكم مركزية",
                "مدونة اختيارية",
                "نشر فوري",
              ] as const
            )
              .concat(
                [
                  "محفظة احترافية",
                  "بدون كود",
                  "وضع داكن وفاتح",
                  "لوحة تحكم مركزية",
                  "مدونة اختيارية",
                  "نشر فوري",
                ] as const,
              )
              .map((label, i) => (
                <div key={`${label}-${i}`} className="folioTickItem">
                  {label} <span className="folioTickSep">✦</span>
                </div>
              ))}
          </div>
        </div>

        <section style={{ background: "var(--folio-w)" }}>
          <div className="folioHero">
            <div className="folioHeroText">
              <div className="folioHeroPill">
                <i />
                محفظة واحدة، تحكم كامل
              </div>
              <h1 className="folioHeroTitle">
                حوّل خبرتك
                <br />
                إلى <em>صفحة ويب</em>
                <br />
                في دقائق
              </h1>
              <p className="folioHeroBody">
                عدّل سيرتك ومشاريعك من لوحة تحكم بسيطة، فعّل المدونة عند الحاجة،
                واختر الوضع الفاتح أو الداكن — دون أي تعقيد.
              </p>
              <div className="folioHeroBtns">
                <Link className="folioHbtn folioHbtnPrimary" href="/signup">
                  أنشئ صفحتك الآن ←
                </Link>
                <Link className="folioHbtn folioHbtnOutline" href="/portfolio">
                  شاهد مثالاً حياً
                </Link>
              </div>
              <div className="folioHeroMeta">
                <div>
                  <div className="folioMetaN">{accounts}</div>
                  <div className="folioMetaL">مسجّل في المنصة</div>
                </div>
                <div>
                  <div className="folioMetaN">٩٨٪</div>
                  <div className="folioMetaL">رضا المستخدمين</div>
                </div>
                <div>
                  <div className="folioMetaN">٣ دقائق</div>
                  <div className="folioMetaL">متوسط الإعداد</div>
                </div>
              </div>
            </div>
            <div className="folioHeroVisual">
              <div className="folioBrowser">
                <div className="folioBbar">
                  <div className="folioBdots">
                    <div className="folioBdot folioBdotR" />
                    <div className="folioBdot folioBdotY" />
                    <div className="folioBdot folioBdotG" />
                  </div>
                  <div className="folioBurl">folio.builder / ahmed-hassan</div>
                </div>
                <div className="folioBbody">
                  <div className="folioPnav">
                    <div className="folioPnavLogo">أحمد حسن ✦</div>
                    <MockBrowserThemeToggle
                      className="folioPtoggle"
                      ptogClass="folioPtog"
                      ptogActiveClass="folioPtogActive"
                    />
                  </div>
                  <div className="folioPhero">
                    <div className="folioPavatar">👨‍💻</div>
                    <div>
                      <div className="folioPname">أحمد حسن</div>
                      <div className="folioProle">
                        مطوّر واجهات أمامية · القاهرة
                      </div>
                      <div className="folioPtags">
                        <span className="folioPtag">React</span>
                        <span className="folioPtag">TypeScript</span>
                        <span className="folioPtag">UI/UX</span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.63rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--folio-ink3)",
                      marginBottom: "0.55rem",
                    }}
                  >
                    المشاريع
                  </div>
                  <div className="folioPprojects">
                    <div className="folioPcard">
                      <div
                        className="folioPthumb"
                        style={{
                          background:
                            "linear-gradient(135deg,#e8e8e4,#d0cec9)",
                        }}
                      />
                      <div className="folioPtitle">تطبيق إدارة المهام</div>
                      <div className="folioPdesc">React · Supabase</div>
                    </div>
                    <div className="folioPcard">
                      <div
                        className="folioPthumb"
                        style={{
                          background:
                            "linear-gradient(135deg,#e4e8e8,#c9d0ce)",
                        }}
                      />
                      <div className="folioPtitle">لوحة تحليل البيانات</div>
                      <div className="folioPdesc">Vue · D3.js</div>
                    </div>
                  </div>
                  <div className="folioPstats">
                    <div className="folioPstat">
                      <div className="folioPstatN">{projects}</div>
                      <div className="folioPstatL">مشروع</div>
                    </div>
                    <div className="folioPstat">
                      <div className="folioPstatN">{posts}</div>
                      <div className="folioPstatL">مقالات</div>
                    </div>
                    <div className="folioPstat">
                      <div className="folioPstatN">٥★</div>
                      <div className="folioPstatL">تقييم</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="folioLogosBar">
          <div className="folioLogosTrack">
            {(
              [
                "مطوّرون",
                "مصمّمون",
                "كتّاب محتوى",
                "مستقلّون",
                "مسوّقون رقميون",
                "محلّلو بيانات",
              ] as const
            )
              .concat(
                [
                  "مطوّرون",
                  "مصمّمون",
                  "كتّاب محتوى",
                  "مستقلّون",
                  "مسوّقون رقميون",
                  "محلّلو بيانات",
                ] as const,
              )
              .map((label, i) => (
                <div key={`${label}-${i}`} className="folioLogoChip">
                  {label}
                </div>
              ))}
          </div>
        </div>

        <section className="folioSection" id="features">
          <div className="folioSectionInner">
            <div className="folioSectionLabel folioReveal">
              <span>المميزات</span>
            </div>
            <div className="folioSectionTitle folioReveal">
              كل ما تحتاجه
              <br />
              <em>في مكان واحد</em>
            </div>
            <div className="folioFeatGrid">
              {[
                {
                  n: "١",
                  t: "مدونة اختيارية",
                  p: "فعّلها أو عطّلها من الإعدادات. مرونة كاملة دون الحاجة لتعديل أي كود.",
                },
                {
                  n: "٢",
                  t: "لوحة تحكم مركزية",
                  p: "حرّر محتوى محفظتك من مكان واحد واحفظ مباشرة في السحابة بضغطة زر.",
                },
                {
                  n: "٣",
                  t: "تجربة متناسقة",
                  p: "نفس المكوّنات على جميع الصفحات — بدون قفزات بصرية أو تناقض في التصميم.",
                },
                {
                  n: "٤",
                  t: "وضع فاتح وداكن",
                  p: "راحة للعين مع إمكانية إخفاء مفتاح الثيم من الواجهة العامة متى أردت.",
                },
                {
                  n: "٥",
                  t: "نشر فوري",
                  p: "صفحتك متاحة للعالم فور الحفظ، بعنوان خاص بك وبدون أي انتظار.",
                },
                {
                  n: "٦",
                  t: "إحصائيات الزوار",
                  p: "تابع من يزور صفحتك ومن أين يأتون، كل ذلك من لوحة التحكم نفسها.",
                },
              ].map((item) => (
                <div key={item.n} className="folioFeat folioReveal">
                  <div className="folioFeatNum">{item.n}</div>
                  <h3>{item.t}</h3>
                  <p>{item.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="folioSection folioHowBg" id="how">
          <div className="folioSectionInner">
            <div className="folioHowGrid">
              <div className="folioHowSticky folioReveal">
                <div className="folioSectionLabel" style={{ marginBottom: "1.2rem" }}>
                  <span>كيف يعمل</span>
                </div>
                <h2
                  style={{
                    fontFamily: "var(--folio-serif)",
                    fontSize: "clamp(2rem,3vw,3rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    marginBottom: "1rem",
                  }}
                >
                  ثلاث خطوات
                  <br />
                  <em style={{ fontStyle: "italic", color: "var(--folio-ink3)" }}>
                    وصفحتك جاهزة
                  </em>
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--folio-ink3)",
                    lineHeight: 1.85,
                    maxWidth: "340px",
                  }}
                >
                  مسار واضح ومبسّط — تسجيل الدخول، تعديل المحتوى، ثم المعاينة
                  الفورية.
                </p>
              </div>
              <div className="folioStepsList">
                <div className="folioStep">
                  <div className="folioStepN">٠١</div>
                  <div>
                    <h3>أنشئ حسابك</h3>
                    <p>
                      سجّل بالبريد الإلكتروني في ثوانٍ. لا بطاقة ائتمان، لا تعقيد.
                    </p>
                  </div>
                </div>
                <div className="folioStep">
                  <div className="folioStepN">٠٢</div>
                  <div>
                    <h3>خصّص محتواك</h3>
                    <p>
                      أضف مشاريعك وخبراتك ومقالاتك من لوحة التحكم الذكية في دقائق.
                    </p>
                  </div>
                </div>
                <div className="folioStep">
                  <div className="folioStepN">٠٣</div>
                  <div>
                    <h3>انشر وشارك</h3>
                    <p>
                      صفحتك على الإنترنت فوراً بعنوانك الخاص، جاهزة للمشاركة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="folioSection" id="testimonials">
          <div className="folioSectionInner">
            <div className="folioSectionLabel folioReveal">
              <span>آراء المستخدمين</span>
            </div>
            <div
              className="folioSectionTitle folioReveal"
              style={{ marginBottom: 0 }}
            >
              ماذا يقول
              <br />
              <em>المستخدمون؟</em>
            </div>
            <div className="folioTgrid">
              <div className="folioTcard">
                <div className="folioTquote">&ldquo;</div>
                <p>
                  أخيراً قدرت أعمل محفظة احترافية بدون ما أضيع وقتي في الكود.
                  الإعداد أخذ أقل من ٥ دقائق وشكل الصفحة جميل جداً.
                </p>
                <div className="folioTauthor">
                  <div className="folioTavatar">🧑‍🎨</div>
                  <div>
                    <div className="folioTname">سارة المهندس</div>
                    <div className="folioTrole">مصمّمة جرافيك · الرياض</div>
                  </div>
                </div>
              </div>
              <div className="folioTcard">
                <div className="folioTquote">&ldquo;</div>
                <p>
                  استخدمتها لعرض مشاريعي أمام العملاء. الوضع الداكن رائع والتحديثات
                  تظهر فوراً بدون أي مشاكل تقنية.
                </p>
                <div className="folioTauthor">
                  <div className="folioTavatar">👨‍💻</div>
                  <div>
                    <div className="folioTname">محمد الشريف</div>
                    <div className="folioTrole">مطوّر فريلانسر · القاهرة</div>
                  </div>
                </div>
              </div>
              <div className="folioTcard">
                <div className="folioTquote">&ldquo;</div>
                <p>
                  أفضل قرار اتخذته لحضوري الرقمي. بسيطة، سريعة، وتبدو احترافية بشكل
                  لا يصدق مقارنة بالسعر.
                </p>
                <div className="folioTauthor">
                  <div className="folioTavatar">👩‍💼</div>
                  <div>
                    <div className="folioTname">نور الأحمدي</div>
                    <div className="folioTrole">كاتبة محتوى · دبي</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="folioCtaWrap">
          <div className="folioCtaBox folioReveal">
            <div>
              <h2>
                جاهز تحوّل خبرتك
                <br />
                لصفحة <em>احترافية؟</em>
              </h2>
              <p className="folioCtaSub">
                انضم إلى أكثر من ٢٤٠٠ محترف يعرضون أعمالهم بأناقة وبساطة. مجاناً
                للبداية.
              </p>
            </div>
            <div className="folioCtaBtns">
              <Link className="folioCbtn folioCbtnWhite" href="/signup">
                ابدأ مجاناً الآن ←
              </Link>
              <Link className="folioCbtn folioCbtnGhost" href="/portfolio">
                شاهد مثالاً حياً
              </Link>
            </div>
          </div>
        </div>

        <footer className="folioFooter">
          <div className="folioFooterTop">
            <div>
              <div className="folioFlogo">HAKIMO CV</div>
              <p className="folioFbrandP">
                حوّل خبرتك إلى صفحة ويب احترافية في دقائق — بدون كود، بدون تعقيد.
              </p>
            </div>
            <div className="folioFcol">
              <h4>المنتج</h4>
              <a href="#features">المميزات</a>
              <a href="#">الأسعار</a>
              <a href="#">التوثيق</a>
              <a href="#">التحديثات</a>
            </div>
            <div className="folioFcol">
              <h4>الشركة</h4>
              <a href="#">من نحن</a>
              <a href="#">المدونة</a>
              <a href="#">الوظائف</a>
              <a href="#">تواصل معنا</a>
            </div>
            <div className="folioFcol">
              <h4>قانوني</h4>
              <a href="#">الشروط</a>
              <a href="#">الخصوصية</a>
              <a href="#">ملفات الارتباط</a>
            </div>
          </div>
          <div className="folioFooterBottom">
            <div className="folioFcopy">
              <div>© ٢٠٢٥ HAKIMO CV — جميع الحقوق محفوظة</div>
              {buildLabel ? (
                <div
                  className="folioFversion"
                  dir="ltr"
                  translate="no"
                  title="إصدار التطبيق ومرجع البناء"
                >
                  {buildLabel}
                </div>
              ) : null}
            </div>
            <div className="folioFsoc">
              <a className="folioSi" href="#" aria-label="LinkedIn">
                in
              </a>
              <a className="folioSi" href="#" aria-label="X">
                X
              </a>
              <a className="folioSi" href="#" aria-label="GitHub">
                gh
              </a>
              <a className="folioSi" href="#" aria-label="Email">
                ✉
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
