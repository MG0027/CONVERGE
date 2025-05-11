import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCampaigns } from "../store/campaignSlice"; // Make sure this path is correct
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const { items: campaigns = [], status = 'idle', error = null } = useSelector((state) => state.campaign || {});
  const dispatch = useDispatch();

  useEffect(() => {
    // Always fetch campaigns when component mounts
    dispatch(fetchCampaigns());
  }, [dispatch]);

  // Calculate total audience
  const totalAudience = campaigns.reduce((sum, campaign) => {
    return sum + (campaign.audience || 0);
  }, 0);

  // Find the newest campaign
  const getNewestCampaign = () => {
    if (!campaigns || campaigns.length === 0) return null;
    
    return campaigns.reduce((newest, current) => {
      const newestDate = new Date(newest.createdAt || newest.date || 0);
      const currentDate = new Date(current.createdAt || current.date || 0);
      return currentDate > newestDate ? current : newest;
    }, campaigns[0]);
  };

  const newestCampaign = getNewestCampaign();

  // Get the latest 5 campaigns sorted by date
  const getLatestCampaigns = () => {
    if (!campaigns || campaigns.length === 0) return [];
    
    return [...campaigns]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB - dateA; // Sort descending (newest first)
      })
      .slice(0, 5); // Get only the first 5
  };

  const latestCampaigns = getLatestCampaigns();
  
  // Format data for line chart
  const chartData = latestCampaigns
    .map(campaign => ({
      name: campaign.title?.substring(0, 12) || 'Untitled',
      audience: campaign.audience || 0,
      date: new Date(campaign.createdAt || campaign.date || 0).toLocaleDateString()
    }))
    .reverse(); // Reverse to show oldest to newest (left to right)

  // Loading and error states
  if (status === 'loading') {
    return <div className="m-10">Loading dashboard data...</div>;
  }

  if (status === 'failed') {
    return <div className="m-10">Error loading campaigns: {error}</div>;
  }

  return (
    <>
      <div className="m-10">
        <h1 className="text-3xl font-semibold">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Here's what's happening with your campaigns today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Total Audience Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Audience Reach
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAudience.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                Combined audience across all campaigns
              </p>
            </CardContent>
          </Card>

          {/* Latest Campaign Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Latest Campaign
              </CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {newestCampaign ? (
                <>
                  <div className="text-xl font-bold">
                    {newestCampaign.title || "Untitled Campaign"}
                  </div>
                  <div className="flex items-center justify-left gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-500">Audience Size</p>
                      <p className="text-sm font-medium">
                        {(newestCampaign.audience || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery Rate</p>
                      <p className="text-sm font-medium">
                        {newestCampaign.successRate || "N/A"}
                        {newestCampaign.successRate ? "%" : ""}
                      </p>
                    </div>
                    
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium">
                          {new Date(newestCampaign.createdAt || newestCampaign.date).toLocaleDateString()}
                        </p>
                      </div>
                    
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">No campaigns found</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Audience Trend Area Chart */}
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Audience Trend - Last 5 Campaigns
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="pt-4">
            {chartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <defs>
                      <linearGradient id="audience-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value?.length > 10 ? `${value.substring(0, 10)}...` : value}
                      angle={-45} 
                      textAnchor="end"
                      height={60}
                      stroke="#888888"
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                      stroke="#888888"
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    />
                    <Tooltip
                      formatter={(value) => [`${value.toLocaleString()} audience`, 'Size']}
                      labelFormatter={(label, items) => {
                        const entry = chartData.find(item => item.name === label);
                        return `${label}${entry ? ` (${entry.date})` : ''}`;
                      }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="audience"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fill="url(#audience-gradient)"
                      dot={{ r: 4, strokeWidth: 2, fill: "white" }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-500">
                No campaign data available to display chart
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Dashboard;