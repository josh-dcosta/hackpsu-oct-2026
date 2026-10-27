import { useEffect, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { Layout } from "./components/Layout";
import { useStore } from "./lib/store";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import Bank from "./pages/Bank";
import Coach from "./pages/Coach";
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
  const get = () => (window.location.hash.replace(/^#/, "") || "/").split("?")[0];
  const [r, setR] = useState(get);
  useEffect(() => {
    const on = () => { setR(get()); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return r;
}

export default function App() {
  const route = useRoute();
  const { profile, entered } = useStore();
  // Every visit starts on the Welcome page: pick the demo or your own numbers
  const PUBLIC: Record<string, ComponentType> = { "/about": AboutApp, "/mission": Mission, "/me": AboutMe };
  // About pages are always reachable, even before choosing a scenario
  if (PUBLIC[route]) {
    const P = PUBLIC[route];
    return <Layout route={route}><motion.div key={route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}><P /></motion.div></Layout>;
  }
  if (!entered || route === "/welcome" || !profile.onboarded) return <Welcome />;

  let page;
  if (route === "/") page = <Dashboard />;
  else if (route === "/learn" || route === "/sims" || route === "/future") page = <Learn />;
  else if (route === "/bank") page = <ModuleFrame id="bank"><Bank /></ModuleFrame>;
  else if (route === "/coach") page = <Coach />;
  else if (route === "/progress") page = <Progress />;
  else if (route.startsWith("/learn/")) {
    const id = route.split("/")[2];
    const M = MODS[id];
    page = M ? <ModuleFrame id={id}><M /></ModuleFrame> : <Dashboard />;
  } else page = <Dashboard />;

  return (
    <Layout route={route}>
      <motion.div key={route} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{page}</motion.div>
    </Layout>
  );
}
