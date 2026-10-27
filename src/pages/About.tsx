import { useState } from "react";
import { ArrowRight, BookOpen, ShieldCheck, ListChecks, Lightbulb, Church, Users, Landmark, Languages, MapPin, GraduationCap, Heart, Trophy, Lock } from "lucide-react";
import { Card } from "../components/ui";
import { Logo, WorkerIcon, CoachIcon } from "../components/Brand";

const LINKEDIN = "https://www.linkedin.com/in/joshdcosta";

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">{children}</div>;
}

export const JOURNEY = [
  { icon: BookOpen, word: "Information", text: "There's more money advice out there than ever. Most of it is confusing, and some of it is wrong." },
  { icon: Lightbulb, word: "Understanding", text: "One honest answer with your own numbers: will you have enough to pay the bills after you retire?" },
  { icon: ShieldCheck, word: "Confidence", text: "Short lessons, life moments and a plan builder show exactly what each smart move changes." },
  { icon: ListChecks, word: "Action", text: "A checklist of real next steps with exact amounts, how-to, reminders and links to verify." },
];

export function Journey({ dark = false }: { dark?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {JOURNEY.map((j, i) => (
        <div key={j.word} className={"relative rounded-2xl p-4 text-left " + (dark ? "bg-white/[.07] ring-1 ring-white/10" : "bg-white ring-1 ring-slate-200 shadow-card")}>
          <div className="flex items-center gap-2">
            <span className={"grid h-9 w-9 place-items-center rounded-xl " + (dark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-50 text-emerald-600")}><j.icon size={18} /></span>
            <span className={"text-[12px] font-bold num " + (dark ? "text-slate-400" : "text-slate-400")}>{i + 1}</span>
            <span className="font-display text-lg font-semibold">{j.word}</span>
          </div>
          <p className={"mt-2 text-[14px] leading-snug " + (dark ? "text-slate-300" : "text-slate-600")}>{j.text}</p>
          {i < 3 && <ArrowRight size={16} className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-emerald-500 lg:block" />}
        </div>
      ))}
    </div>
  );
}

/* ---------------- About the app ---------------- */
export function AboutApp() {
  return (
    <div className="space-y-5">
      <div className="hero-dark rounded-[2rem] p-6 sm:p-10 text-white">
        <div className="flex items-center gap-3"><Logo size={48} /><span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-emerald-300">About the app</span></div>
        <h1 className="mt-5 font-display text-3xl sm:text-5xl font-semibold leading-tight">See tomorrow before you spend today.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
          Next Step started as my entry to <b className="text-white">HackPSU</b>, Penn State's hackathon. The challenge was to use AI to build a tool that helps people
          turn <b className="text-white">information</b> into <b className="text-white">understanding</b>, understanding into <b className="text-white">confidence</b>, and confidence into <b className="text-white">action</b>.
          That journey is exactly what Next Step does, for the people who usually get left out of financial advice: blue-collar workers and families in underserved communities.
        </p>
        <div className="mt-7"><Journey dark /></div>
      </div>

      <Card>
        <Kicker>What it is</Kicker>
        <h2 className="mt-1 font-display text-2xl font-semibold">A simple money simulator that answers one question</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-slate-600">
          Next Step is a free, judgment-free web app that works on any phone or computer. It answers the question most hardworking people never get a straight answer to:
          <i> "If I keep going the way I am, will I have enough money to pay my bills after I retire?"</i> Then it shows which small, safe moves make the biggest difference,
          teaches each one in a five-minute lesson, and turns them into real next steps you can check off.
        </p>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3"><WorkerIcon size={52} /><div><Kicker>Way 1</Kicker><div className="font-display text-xl font-semibold">The demo scenario: meet Dave</div></div></div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            Dave is 50 and the head custodian at a Pennsylvania public high school, earning about $22 an hour. With his wife Linda's part-time job they make $64,000 a year,
            have $6,000 saved and two teenagers, Emma and Jake, heading to college soon. Every number is already filled in, so you can see how the whole app works in a minute.
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-3"><span className="grid h-[52px] w-[52px] place-items-center rounded-2xl bg-navy text-2xl">🙋</span><div><Kicker>Way 2</Kicker><div className="font-display text-xl font-semibold">Your own numbers</div></div></div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            Answer a few quick questions (about two minutes): your age, kids, income, monthly bills and savings. Rough guesses are fine. You get your own answer, plan and next steps,
            saved only on your device. Bob, a plumber earning $85,000 with three kids, gets a completely different picture from Dave, and that's the point.
          </p>
        </Card>
      </div>

      <Card>
        <Kicker>What's inside</Kicker>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["📊", "The answer", "How each year of retirement gets paid: pension and Social Security, then savings, then the part nothing covers. Slide inflation and watch it change."],
            ["⚡", "Life moments", "A raise, open enrollment, a surprise bill, a kid heading to college, a market drop, retiring soon. See what changes and what to do or not do."],
            ["🧭", "Build the plan", "Five safe moves: high-yield savings, retirement contributions, an HSA, Roth vs. Traditional and a simple index-fund mix."],
            ["✅", "Next steps", "Exact amounts, how-to steps, automate-it tips, calendar reminders, links to verify, and a PDF to take with you."],
            ["📚", "Learn", "Short lessons on the essentials, each with a real-world simulation already filled in with your numbers."],
            ["💬", "Ask Next Step", "An AI coach that explains your numbers in plain English. It never makes up numbers of its own."],
          ].map(([e, t, d]) => (
            <div key={t} className="rounded-2xl bg-slate-50 p-4"><div className="text-2xl">{e}</div><div className="mt-1 font-semibold">{t}</div><p className="mt-1 text-[14px] text-slate-600">{d}</p></div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <CoachIcon size={44} />
          <div>
            <Kicker>How AI is used, and how it isn't</Kicker>
            <p className="mt-1 text-[15px] leading-relaxed text-slate-600">
              Every number comes from fixed, tested formulas and official sources like the IRS, FDIC and Social Security. The AI coach (built on Anthropic's Claude) explains those
              numbers at your level, but it never invents its own. Next Step never asks for bank logins, account numbers or Social Security numbers.
              It's an educational tool, not financial advice.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700"><Lock size={13} /> Your numbers stay on your device.</div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-center gap-3 pb-4">
        <a href="#/mission" className="inline-flex items-center gap-2 rounded-2xl bg-navy px-5 py-3 font-semibold text-white">Where Next Step is going <ArrowRight size={16} /></a>
        <a href="#/me" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold ring-1 ring-slate-200">About me</a>
      </div>
    </div>
  );
}

/* ---------------- Mission ---------------- */
export function Mission() {
  const plans = [
    { icon: Church, title: "Local churches in Philadelphia", text: "Churches are where trust already lives. I want to run simple workshops after services and at community nights, walking families through their own numbers on their own phones." },
    { icon: Users, title: "Workers' unions", text: "Union halls bring together exactly the people I built this for: tradespeople, custodians, drivers and service workers. Lunch-and-learns around open enrollment and raises, when the decisions are real." },
    { icon: Landmark, title: "Credit unions", text: "Credit unions are member-owned and community-minded. Partnering with them connects every lesson to a safe, real next step, like opening an FDIC- or NCUA-insured savings account." },
    { icon: Languages, title: "Multiple languages", text: "Money stress doesn't only speak English. I want Next Step, its lessons and its AI coach available in the languages people speak at home, starting with Spanish." },
  ];
  return (
    <div className="space-y-5">
      <div className="hero-dark rounded-[2rem] p-6 sm:p-10 text-white">
        <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-emerald-300">Where it's going</span>
        <h1 className="mt-5 font-display text-3xl sm:text-5xl font-semibold leading-tight">Taking Next Step to the people who need it most.</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
          Next Step began as my entry to HackPSU at Penn State. It isn't ending there. I want to take this financial literacy app into the churches and workers' unions
          of Philadelphia, and help people make better financial decisions and plans, using simple lessons that can make a big difference in their lives.
        </p>
      </div>

      <Card>
        <div className="flex items-start gap-3">
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
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {plans.map((p) => (
          <Card key={p.title}>
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><p.icon size={22} /></span><div className="font-display text-xl font-semibold">{p.title}</div></div>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{p.text}</p>
          </Card>
        ))}
      </div>

      <Card>
        <Kicker>How I'll do it</Kicker>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ["Show up in person", "I'll personally visit congregations and union halls, starting in Philadelphia, and run short hands-on sessions with Dave's story and then people's own numbers."],
            ["Leave a next step behind", "Everyone leaves with a printed or downloaded plan, one action for this week, and a reminder on their phone."],
            ["Listen and improve", "Every session teaches me what's confusing. That feedback shapes new lessons, new life moments and new languages."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl bg-slate-50 p-4"><div className="num text-sm font-bold text-emerald-600">Step {i + 1}</div><div className="font-semibold">{t}</div><p className="mt-1 text-[14px] text-slate-600">{d}</p></li>
          ))}
        </ol>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Trophy className="text-amber" /><div><div className="font-semibold">Started at HackPSU, October 2026</div><div className="text-[14px] text-slate-500">Information → understanding → confidence → action.</div></div></div>
        <div className="flex flex-wrap gap-2">
          <a href="#/about" className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50">About the app</a>
          <a href="#/me" className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white">About me</a>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- About me ---------------- */
function Photo() {
  const [ok, setOk] = useState(true);
  return ok
    ? <img src="/josh.jpg" alt="Josh DeCosta" onError={() => setOk(false)} className="h-36 w-36 sm:h-44 sm:w-44 shrink-0 rounded-full object-cover ring-4 ring-white/20" />
    : <div className="grid h-36 w-36 sm:h-44 sm:w-44 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 font-display text-5xl font-semibold text-white ring-4 ring-white/20" aria-label="Josh DeCosta">JD</div>;
}

export function AboutMe() {
  return (
    <div className="space-y-5">
      <div className="hero-dark rounded-[2rem] p-6 sm:p-10 text-white">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <Photo />
          <div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-emerald-300">About me</span>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl font-semibold">Josh DeCosta</h1>
            <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-slate-300 sm:justify-start">
              <span className="inline-flex items-center gap-1.5"><GraduationCap size={17} /> Drexel University</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={17} /> Warrington, Pennsylvania</span>
            </div>
            <a href={LINKEDIN} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 font-semibold text-white hover:opacity-90"><span className="grid h-5 w-5 place-items-center rounded bg-white text-[12px] font-extrabold text-[#0A66C2]">in</span> Connect on LinkedIn</a>
          </div>
        </div>
      </div>

      <Card>
        <Kicker>Why I built Next Step</Kicker>
        <div className="mt-2 space-y-4 text-[16px] leading-relaxed text-slate-600">
          <p>Next Step started with conversations at home. Whenever contractors, plumbers and other tradespeople come to work on our house, my dad and I have a habit of getting to know them. We ask about their families, their work and what's ahead.</p>
          <p>Over many of those conversations, one theme kept coming up. These are skilled, hardworking people who earn an honest living, but almost no one has ever taught them how to plan with their money. Retirement, college for their kids, a surprise bill: the future feels unpredictable, and they feel unprepared for it.</p>
          <p>It was heartbreaking to realize how much stress could be avoided with a little clear, trustworthy guidance. Financial literacy is deeply underserved in blue-collar jobs and underprivileged communities, and the people there deserve that guidance just as much as anyone. So I built Next Step for them.</p>
        </div>
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div><div className="font-semibold">What I'm working on next</div><div className="text-[14px] text-slate-500">Bringing Next Step to churches, workers' unions and credit unions in Philadelphia, in more than one language.</div></div>
        <a href="#/mission" className="inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white">Where it's going <ArrowRight size={15} /></a>
      </Card>
    </div>
  );
}
