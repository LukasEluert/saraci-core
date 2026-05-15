import { redirect } from "next/navigation";

/**
 * „/“ wird vom Proxy zuerst abgesichert (Login/Session).
 * Diese Page ist der Route-Handler für `/` und leitet auf die Startansicht weiter.
 */
export default function Home() {
  redirect("/overview");
}
