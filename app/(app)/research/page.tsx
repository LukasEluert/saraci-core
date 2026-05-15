import type { Metadata } from "next";
import { ResearchClient } from "@/components/ResearchClient";

export const metadata: Metadata = {
  title: "Lead Research",
};

export default function ResearchPage() {
  return <ResearchClient />;
}
