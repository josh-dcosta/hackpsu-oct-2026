import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Layout } from "./components/Layout";
import { useStore } from "./lib/store";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import Bank from "./pages/Bank";
import Progress from "./pages/Progress";
import { AboutApp, AboutMe, Mission } from "./pages/About";
import ModuleFrame from "./pages/ModuleFrame";
import Inflation from "./modules/Inflation";
import LifeStages from "./modules/LifeStages";
import Saving from "./modules/Saving";
import K401 from "./modules/K401";
import Accounts from "./modules/Accounts";
import HSA from "./modules/HSA";
import College from "./modules/College";
import Invest from "./modules/Invest";
import Debt from "./modules/Debt";

const MODS: Record<string, ComponentType> = { bank: Bank, inflation: Inflation, life: LifeStages, saving: Saving, k401: K401, accounts: Accounts, hsa: HSA, college: College, invest: Invest, debt: Debt };

function useRoute() {
  const [h, setH] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => { setH(window.location.hash); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const [path, query = ""] = (h.replace(/^#/, "") || "/").split("?");
  return { route: path, query };
}

export default function App() {
  const { route, query } = useRoute();
  const { profile, entered } = useStore();
  const about: Record<string, ComponentType> = { "/": AboutApp, "/about": AboutApp, "/mission": Mission, "/me": AboutMe };

  let page;
  let key = route;
  if (about[route]) { const P = about[route]; page = <P />; }
  else if (!entered || !profile.onboarded || route === "/welcome" || (route === "/try" && query)) {
    // Try it now: pick Dave's scenario or your own numbers first (and answer the questions)
    page = <Welcome key={query} />; key = "/try?" + query;
  }
  else if (route === "/try") page = <Dashboard />;
  else if (route === "/learn" || route === "/sims" || route === "/future") page = <Learn />;
  else if (route === "/bank") page = <ModuleFrame id="bank"><Bank /></ModuleFrame>;
  else if (route === "/progress") page = <Progress />;
  else if (route.startsWith("/learn/")) {
    const id = route.split("/")[2];
    const M = MODS[id];
    page = M ? <ModuleFrame id={id}><M /></ModuleFrame> : <Dashboard />;
  } else page = <Dashboard />;
  const shown = !about[route] && (!entered || !profile.onboarded) ? "/try" : route;

  return (
    <Layout route={shown}>
      <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{page}</motion.div>
    </Layout>
  );
}
