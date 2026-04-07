import { http } from "../../services/http";
import type { DashboardOverview } from "../../types/dashboard";

export const dashboardService = {
  async getOverview() {
    const { data } = await http.get<DashboardOverview>("/dashboard/overview");
    return data;
  },
};
