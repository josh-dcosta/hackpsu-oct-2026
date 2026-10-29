import { useRef, useState, type ReactNode } from "react";
import { Panels as BasePanels, Fill, type Panel } from "../components/Panels";
import { ArrowRight, BookOpen, ShieldCheck, ListChecks, Lightbulb, Church, Users, Landmark, Languages, MapPin, GraduationCap, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "../components/ui";
import { Logo } from "../components/Brand";
import { ScenarioCards } from "../components/Scenario";
import { ABOUT_NAV } from "../components/SiteMenu";

const LINKEDIN = "https://www.linkedin.com/in/joshdcosta";
export const OWNER = "Josh DCosta";

function Kicker({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <div className={"text-[12px] font-bold uppercase tracking-wider " + (dark ? "text-emerald-300" : "text-emerald-600")}>{children}</div>;
}

// On phones and tablets there's no sidebar, so About pages show their own small switcher
function AboutSwitcher() {
  const here = "#" + ((window.location.hash.replace(/^#/, "") || "/").split("?")[0]);
  return (
    <div className="mb-3 flex shrink-0 gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-slate-200 lg:hidden">
      {ABOUT_NAV.map((n) => {
        const on = here === n.href || (n.href === "#/about" && here === "#/");
        return <a key={n.href} href={n.href} className={cx("flex-1 whitespace-nowrap rounded-xl px-3 py-2 text-center text-[14px] font-semibold", on ? "bg-navy text-white" : "text-slate-600")}>{n.label}</a>;
      })}
    </div>
  );
}

const Panels = ({ tabs }: { tabs: Panel[] }) => <BasePanels tabs={tabs} top={<AboutSwitcher />} />;

export const JOURNEY: { icon: typeof BookOpen; word: string; text: React.ReactNode }[] = [
  { icon: BookOpen, word: "Information", text: "Money advice is everywhere, and most of it is confusing." },
  { icon: Lightbulb, word: "Understanding", text: "One honest answer, built from your own numbers." },
  { icon: ShieldCheck, word: "Confidence", text: "Your life moments and a plan show what each move changes." },
  { icon: ListChecks, word: "Action", text: <>Real next steps, and we connect you to <span className="inline-block rounded-full bg-sun px-2.5 py-0.5 font-semibold text-navy">Valley Bank products</span> that suit your plan.</> },
];

function Journey() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {JOURNEY.map((j, i) => (
        <div key={j.word} className="relative rounded-2xl bg-white/[.07] p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300"><j.icon size={18} /></span>
            <span className="text-[12px] font-bold text-slate-400 num">{i + 1}</span>
            <span className="font-display text-lg font-semibold">{j.word}</span>
          </div>
          <p className="mt-2 text-[14px] leading-snug text-slate-300">{j.text}</p>
          {i < 3 && <ArrowRight size={16} className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-emerald-400 xl:block" />}
        </div>
      ))}
    </div>
  );
}

const GALLERY = [
  { img: "moments", title: "Pick your life moments", text: "Enter your numbers, then pick what's happening: a surprise bill, higher medical costs, college, a market drop, retiring soon, a vacation, buying a car. Your moments drive the plan and the actions." },
  { img: "plan", title: "A plan, built for you", text: "Every action comes with how-to steps and the Valley Bank product that does it. Next Step builds the plan automatically and shows where every dollar should live: emergency fund, HSA, college fund, retirement." },
  { img: "answer", title: "Your future", text: "One graph: where your savings go without the plan, and with it. How much you'll have at retirement, and how long it lasts." },
  { img: "learn", title: "Learn by doing", text: "Short lessons with a simple simulator: sliders on the left, the answer written right on the chart." },
  { img: "progress", title: "Numbers you can trust", text: "Every number comes from fixed, tested formulas and official IRS, FDIC and Social Security sources. No bank logins, no account numbers: everything stays on your device. Take your plan with you as a PDF." },
];

function Gallery() {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const scrollTo = (n: number) => {
    const el = ref.current; if (!el) return;
    const c = el.children[Math.max(0, Math.min(GALLERY.length - 1, n))] as HTMLElement;
    el.scrollTo({ left: c.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = ref.current; if (!el) return;
    const w = (el.children[0] as HTMLElement).offsetWidth + 16;
    setAt(Math.round(el.scrollLeft / w));
  };
  return (
    <div className="flex h-full flex-col rounded-[2rem] bg-white p-5 sm:p-7 shadow-card ring-1 ring-slate-200/70">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker>What's inside</Kicker>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold">Everything you need, one step at a time</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollTo(at - 1)} disabled={at === 0} aria-label="Previous" className="grid h-11 w-11 place-items-center rounded-xl ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft /></button>
          <button onClick={() => scrollTo(at + 1)} disabled={at >= GALLERY.length - 1} aria-label="Next" className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-white disabled:opacity-30"><ChevronRight /></button>
        </div>
      </div>
      <div ref={ref} onScroll={onScroll} className="mt-5 flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GALLERY.map((g) => (
          <figure key={g.img} className="flex w-[85%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-slate-200 sm:w-[62%] xl:w-[48%]">
            <div className="min-h-[160px] flex-1 overflow-hidden bg-slate-100">
              <img src={`/gallery/${g.img}.jpg`} alt={g.title} loading="lazy" className="h-full w-full object-cover object-left-top" />
            </div>
            <figcaption className="p-4 sm:p-5">
              <div className="font-display text-xl font-semibold">{g.title}</div>
              <p className="mt-1 text-[15px] leading-snug text-slate-600">{g.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {GALLERY.map((g, n) => <button key={g.img} onClick={() => scrollTo(n)} aria-label={g.title} className={cx("h-2 rounded-full transition-all", n === at ? "w-6 bg-emerald-500" : "w-2 bg-slate-300")} />)}
      </div>
    </div>
  );
}

/* ---------------- About the app ---------------- */
// Why Next Step exists: share of private-industry workers NOT participating in a workplace retirement plan
// (100% minus participation rate). BLS, Employee Benefits in the United States, March 2025, Table 1:
// lowest-paid 25% participate 23% · establishments with 1-49 workers 38% · service occupations 25%.
const BLS_BENEFITS = "https://www.bls.gov/news.release/archives/ebs2_09252025.htm";
function WhyStats() {
  return (
    <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10 lg:flex-row lg:items-center lg:gap-5">
      <div className="flex items-center gap-3">
        <span className="num font-display text-4xl font-semibold text-sun">77%</span>
        <span className="max-w-[17rem] text-[14px] leading-snug text-slate-200">of the lowest-paid workers aren't saving in a retirement plan through work.</span>
      </div>
      <div className="text-[13px] leading-snug text-slate-300">
        <span className="whitespace-nowrap"><b className="num text-white">75%</b> of service workers</span> · <span className="whitespace-nowrap"><b className="num text-white">62%</b> at small businesses</span>
        <a href={BLS_BENEFITS} target="_blank" rel="noreferrer" className="block text-[12px] text-slate-400 hover:text-white hover:underline">Source: U.S. Bureau of Labor Statistics, March 2025 ↗</a>
      </div>
    </div>
  );
}

export function AboutApp() {
  return (
    <Panels tabs={[
      {
        id: "see", label: "See tomorrow", body: (go) => (
          <Fill className="hero-dark rounded-[2rem] p-5 sm:p-8 [@media(min-width:640px)_and_(max-height:800px)]:p-6 text-white">
            <div className="flex items-center gap-3"><Logo size={40} /><Kicker dark>The App</Kicker></div>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl [@media(min-width:640px)_and_(max-height:800px)]:text-4xl font-semibold leading-tight">See tomorrow before you spend today.</h1>
            <p className="mt-3 max-w-3xl text-[16px] sm:text-lg leading-relaxed text-slate-300">
              <b className="text-white">Next Step</b> is a free, simple money planner for everyday working people, built for <b className="text-white">HackPSU</b>. It answers one honest question, <i className="text-white">"Will I have enough to pay my bills after I retire?"</i>, then gives you a plan and real next steps.
            </p>
            <WhyStats />
            <div className="mt-5 [@media(min-width:640px)_and_(max-height:800px)]:mt-3"><Journey /></div>
            <div className="mt-5 [@media(min-width:640px)_and_(max-height:800px)]:mt-3"><button onClick={() => go("try")} className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-sun px-6 py-3 text-lg font-semibold text-navy hover:bg-sun-600">Try it now <ArrowRight size={19} /></button></div>
          </Fill>
        ),
      },
      { id: "inside", label: "What's inside", body: () => <Gallery /> },
      {
        id: "try", label: "Try it now", body: () => (
          <Fill className="rounded-[2rem] bg-white p-5 sm:p-8 shadow-card ring-1 ring-slate-200/70">
            <Kicker>Try it now</Kicker>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-semibold">Build your plan</h2>
            <p className="mt-2 max-w-3xl text-[16px] text-slate-600">Answer a few quick questions, pick your life moments, and get your plan, next steps and the answer. No bank logins, no account numbers: your numbers stay on your device.</p>
            <div className="mt-5"><ScenarioCards compact /></div>
          </Fill>
        ),
      },
    ]} />
  );
}

/* ---------------- Where it's going ---------------- */
export function Mission() {
  const partners = [
    { icon: Church, title: "Local churches", text: "Churches are where trust already lives. I want to run simple workshops after services and at community nights, walking families through their own numbers on their own phones." },
    { icon: Users, title: "Workers' unions", text: "Union halls bring together exactly the people I built this for: tradespeople, custodians, drivers and service workers. Lunch-and-learns around open enrollment and raises, when the decisions are real." },
    { icon: Landmark, title: "Credit unions", text: "Credit unions are member-owned and community-minded. Partnering with them connects every lesson to a safe, real next step, like opening an insured savings account." },
    { icon: Languages, title: "Multiple languages", text: "Money stress doesn't only speak English. I want Next Step and its lessons available in the languages people speak at home." },
  ];
  return (
    <Panels tabs={[
      {
        id: "vision", label: "The vision", body: () => (
          <div className="flex h-full flex-col gap-4">
            <div className="hero-dark flex flex-1 flex-col justify-center rounded-[2rem] p-6 sm:p-10 text-white">
              <Kicker dark>Future Plans</Kicker>
              <h1 className="mt-4 font-display text-3xl sm:text-5xl font-semibold leading-tight">Taking Next Step to the people who need it most.</h1>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
                I want to take this financial literacy app into local churches and workers' unions, and help people make better financial decisions and plans
                with simple lessons that can make a big difference in their lives.
              </p>
            </div>
            <div className="flex items-start gap-4 rounded-[2rem] bg-white p-5 sm:p-7 shadow-card ring-1 ring-slate-200/70">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-500"><Heart size={22} /></span>
              <div>
                <Kicker>Why this matters to me</Kicker>
                <p className="mt-1 text-[16px] leading-relaxed text-slate-600">
                  This is what I'm passionate about: using AI to build tools like Next Step that help blue-collar workers and underprivileged communities. An app alone isn't enough.
                  People trust people, so I want to work hand in hand with their communities, local churches and local workers' unions to spread this knowledge in person.
                  It's something very dear to me, and I'm going to keep doing it.
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "who", label: "Who I'll work with", body: () => (
          <div className="grid h-full gap-4 sm:grid-cols-2">
            {partners.map((p) => (
              <div key={p.title} className="flex flex-col justify-center rounded-[2rem] bg-white p-6 shadow-card ring-1 ring-slate-200/70">
                <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><p.icon size={24} /></span><div className="font-display text-2xl font-semibold">{p.title}</div></div>
                <p className="mt-3 text-[16px] leading-relaxed text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "how", label: "How I'll do it", body: () => (
          <div className="grid h-full gap-4 md:grid-cols-3">
            {[
              ["Show up in person", "I'll personally visit congregations and union halls and run short, hands-on sessions: helping people enter their own numbers on their own phones."],
              ["Leave a next step behind", "Everyone leaves with a printed or downloaded plan, one action for this week, and a reminder on their phone."],
              ["Listen and improve", "Every session teaches me what's confusing. That feedback shapes new lessons, new life moments and new languages."],
            ].map(([t, d], i) => (
              <div key={t} className="flex flex-col justify-center rounded-[2rem] bg-white p-6 sm:p-7 shadow-card ring-1 ring-slate-200/70">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-navy font-display text-2xl font-semibold text-white">{i + 1}</div>
                <div className="mt-4 font-display text-2xl font-semibold">{t}</div>
                <p className="mt-2 text-[16px] leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        ),
      },
    ]} />
  );
}

/* ---------------- About me ---------------- */
function Photo() {
  const [ok, setOk] = useState(true);
  return ok
    ? <img src="/josh.jpg" alt={OWNER} onError={() => setOk(false)} className="h-40 w-40 sm:h-48 sm:w-48 shrink-0 rounded-full object-cover ring-4 ring-white/20" />
    : <div className="grid h-40 w-40 sm:h-48 sm:w-48 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 font-display text-6xl font-semibold text-navy ring-4 ring-white/20" aria-label={OWNER}>JD</div>;
}

export function AboutMe() {
  return (
    <Panels tabs={[{
      id: "me", label: "Me", body: () => (
        <div className="grid h-full gap-4 lg:grid-cols-5">
          <Fill className="hero-dark rounded-[2rem] p-6 sm:p-8 text-center text-white lg:col-span-2"><div className="flex flex-col items-center">
            <Photo />
            <h1 className="mt-5 font-display text-4xl font-semibold">{OWNER}</h1>
            <div className="mt-3 space-y-1.5 text-slate-300">
              <div className="flex items-center justify-center gap-1.5"><GraduationCap size={17} /> Drexel University</div>
              <div className="flex items-center justify-center gap-1.5"><MapPin size={17} /> Warrington, Pennsylvania</div>
            </div>
            <a href={LINKEDIN} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 font-semibold text-white hover:opacity-90"><span className="grid h-5 w-5 place-items-center rounded bg-white text-[12px] font-extrabold text-[#0A66C2]">in</span> Connect on LinkedIn</a>
          </div></Fill>
          <Fill className="rounded-[2rem] bg-white p-6 sm:p-9 shadow-card ring-1 ring-slate-200/70 lg:col-span-3">
            <Kicker>Why I built Next Step</Kicker>
            <div className="mt-3 space-y-4 text-[17px] leading-relaxed text-slate-600">
              <p>Next Step started with conversations at home. Whenever contractors, plumbers and other tradespeople come to work on our house, my dad and I have a habit of getting to know them. We ask about their families, their work and what's ahead.</p>
              <p>Over many of those conversations, one theme kept coming up. These are skilled, hardworking people who earn an honest living, but almost no one has ever taught them how to plan with their money. Retirement, college for their kids, a surprise bill: the future feels unpredictable, and they feel unprepared for it.</p>
              <p>It was heartbreaking to realize how much stress could be avoided with a little clear, trustworthy guidance. Financial literacy is deeply underserved in blue-collar jobs and underprivileged communities, and the people there deserve that guidance just as much as anyone. So I built Next Step for them.</p>
            </div>
          </Fill>
        </div>
      ),
    }]} />
  );
}
