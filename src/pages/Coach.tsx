import { Chat } from "../components/Chat";
export default function Coach() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold">Ask Ripple</h1>
      <p className="mb-4 text-slate-500">Your AI money coach. It explains concepts at your level and uses the numbers from your latest simulation.</p>
      <Chat />
    </div>
  );
}
