import type { Metadata } from "next";
import { InvestorBrief } from "../page";

export const metadata: Metadata = {
  title: "Weso para inversionistas — La capa operativa de servicios para asegurados, impulsada por IA.",
};

export default function PitchPage() {
  return <InvestorBrief />;
}
