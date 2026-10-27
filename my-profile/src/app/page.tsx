import { getPortfolioData } from "@/lib/portfolio-data";
import PortfolioClient from "@/components/PortfolioClient";

// ISR: Cache the portfolio page at the CDN edge for instant 50ms delivery.
// Revalidates at most once per minute, or instantly whenever an admin saves changes.
export const revalidate = 60;

export default async function HomePage() {
  const portfolioData = await getPortfolioData();

  return <PortfolioClient initialData={portfolioData} />;
}

