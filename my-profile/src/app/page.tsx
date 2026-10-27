import { getPortfolioData } from "@/lib/portfolio-data";
import PortfolioClient from "@/components/PortfolioClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const portfolioData = await getPortfolioData();

  return <PortfolioClient initialData={portfolioData} />;
}
