"use client";

import TechnicianDashboardPage from "../technician-dashboard/page";

export default function RootPage({ params }: { params: { locale: string } }) {
  return <TechnicianDashboardPage params={params} />;
}


