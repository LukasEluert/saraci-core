import { notFound } from "next/navigation";
import { DevCheckClient } from "./DevCheckClient";

// Reines Dev-Werkzeug: in Produktion komplett gesperrt (404).
export default function DevCheckPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DevCheckClient />;
}
