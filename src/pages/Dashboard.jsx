import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOpportunities } from "../features/opportunity/opportunityThunks";
import { axiosInstance } from "../services/api";
import { useFiscalPeriod } from "../contexts/FiscalPeriodContext";

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import FilterButton from '../components/DropdownFilter';
import Datepicker from '../components/Datepicker';
import DashboardCard01 from '../partials/dashboard/DashboardCard01';
import DashboardCard02 from '../partials/dashboard/DashboardCard02';
import DashboardCard03 from '../partials/dashboard/DashboardCard03';
import DashboardCard04 from '../partials/dashboard/DashboardCard04';
import DashboardCard05 from '../partials/dashboard/DashboardCard05';
import DashboardCard06 from '../partials/dashboard/DashboardCard06';
import LeaderboardCard from '../charts/LeaderboardCard';
import SourceCard from '../charts/SourceCard';
import ProductsCard from '../charts/ProductsCard';
import DashboardCard014 from "../partials/dashboard/DashboardCard014";
import DashboardCard07 from '../partials/dashboard/DashboardCard07';
import DashboardCard08 from '../partials/dashboard/DashboardCard08';
import DashboardCard09 from '../partials/dashboard/DashboardCard09';
import DashboardCard10 from '../partials/dashboard/DashboardCard10';
import DashboardCard11 from '../partials/dashboard/DashboardCard11';
import DashboardCard12 from '../partials/dashboard/DashboardCard12';
import DashboardCard13 from '../partials/dashboard/DashboardCard13';
import { getCssVariable } from '../utils/Utils';

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { dateRange, periodLabel, fiscalPeriodCode } = useFiscalPeriod();
  const [modalOpportunities, setModalOpportunities] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [pageSize] = React.useState(10);
  const [chartData, setChartData] = React.useState(null);
  const [chartLoading, setChartLoading] = React.useState(false);

  const [labels, setLabels] = useState([]);
  const [dataOpen, setDataOpen] = useState([]);
  const [dataClosed, setDataClosed] = useState([]);
  const [amountOpen, setAmountOpen] = useState(0);
  const [amountClosed, setAmountClosed] = useState(0);
  const [totalOpenCounts, setTotalOpenCounts] = useState([]);
  const [totalClosedCounts, setTotalClosedCounts] = useState([]);
  const [openOpsCount, setOpenOpsCount] = useState(0);
  const [closedOpsCount, setClosedOpsCount] = useState(0);
  
  const dispatch = useDispatch();

  // Get the selected pipeline filters from redux state
  const selectedPipelines = useSelector((state) => state.filters?.selectedGlobalFilterPipelines || []);

  const selectedPipelineStages = useSelector((state) => state.filters?.pipelineStages || []);
  const selectedAssignedUsers = useSelector((state) => state.filters?.assignedUsers || []);
  const selectedOpportunityOwners = useSelector((state) => state.filters?.opportunityOwners || []);
  const selectedOpportunitySources = useSelector((state) => state.filters?.opportunitySources || []);
  const selectedProductSales = useSelector((state) => state.filters?.productSales || []);

    // Prevent duplicate API calls with useRef flag
    const initialLoadDone = React.useRef(false);
     // Fetch opportunities and chart data
      React.useEffect(() => {
        // Create a function to handle the data fetching
        const fetchData = async () => {
          
          // Fetch chart data with fiscal period parameter
          try {
            setChartLoading(true);
            
            let endpoint = '/opportunity_dash';
            let urlParams = new URLSearchParams();
            
            // Add fiscal period as query parameter if available
            if (fiscalPeriodCode) {
              urlParams.append("fiscal_period", fiscalPeriodCode);
            } else if (dateRange && dateRange.from) {
              const createdAtMin = format(dateRange.from, 'yyyy-MM-dd');
              urlParams.append("created_at_min", createdAtMin);
              if (dateRange.to) {
                const createdAtMax = format(dateRange.to, 'yyyy-MM-dd');
                urlParams.append("created_at_max", createdAtMax);
              }
            }
            
            // Add pipeline filters if available
            if (selectedPipelines && selectedPipelines.length > 0) {
              selectedPipelines.forEach(pipeline => {
                urlParams.append("pipeline", pipeline);
              });
            }
            
            if (selectedPipelineStages && selectedPipelineStages.length > 0) {
              selectedPipelineStages.forEach(stage_name => {
                urlParams.append("stage_name", stage_name);
              });
            }
            
            if (selectedAssignedUsers && selectedAssignedUsers.length > 0) {
              selectedAssignedUsers.forEach(assigned_to => {
                urlParams.append("assigned_to", assigned_to);
              });
            }
            
            if (selectedOpportunityOwners && selectedOpportunityOwners.length > 0) {
              selectedOpportunityOwners.forEach(contact => {
                urlParams.append("contact", contact);
              });
            }
            
            if (selectedOpportunitySources && selectedOpportunitySources.length > 0) {
              selectedOpportunitySources.forEach(opportunity_source => {
                urlParams.append("opportunity_source", opportunity_source);
              });
            }
            
            // Only append '?' if we have parameters
            if (urlParams.toString()) {
              endpoint += `?${urlParams.toString()}`;
            }
            
            const response = await axiosInstance.get(endpoint);
            if (response.data && response.data.graph_data) {
              const graphData = response.data.graph_data;
              setLabels(graphData.labels || []);
              setDataOpen(graphData.open || []);
              setDataClosed(graphData.closed || []);
              setAmountOpen(response.data.amount_open || 0);
              setAmountClosed(response.data.amount_closed || 0);
              setTotalOpenCounts(response.data.graph_data.open_counts || []);
              setTotalClosedCounts(response.data.graph_data.closed_counts || []);
              setOpenOpsCount(response.data.open_ops_count || 0);
              setClosedOpsCount(response.data.closed_ops_count || 0);

            }
          } catch (error) {
            console.error('Error fetching chart data:', error);
          } finally {
            setChartLoading(false);
          }
        };
        
        // Call the fetch function
        fetchData();
      }, [dispatch, dateRange, fiscalPeriodCode, selectedPipelines, selectedPipelineStages, selectedAssignedUsers, selectedOpportunityOwners, selectedOpportunitySources]);
      
  
    
      // Format currency in GBP (British Pound)
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-GB', { 
          style: 'currency',
          currency: 'GBP',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(amount);
      };
  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Filter button */}
                <FilterButton align="right" />
                {/* Datepicker built with React Day Picker */}
                <Datepicker align="right" />
                {/* Add view button */}
                {/* <button 
                className="btn text-white hover:brightness-110"
                style={{ 
                  backgroundColor: getCssVariable('--tertiary'),
                  ':hover': { backgroundColor: getCssVariable('--tertiary-dark') }
                }}
                >
                  <svg className="fill-current shrink-0 xs:hidden" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                  </svg>
                  <span className="max-xs:sr-only">Add View</span>
                </button>                 */}
              </div>

            </div>

            {/* Cards */}
            <div className="grid grid-cols-12 gap-6">

              {/* Line chart (Acme Plus) */}
              <DashboardCard01 />
              <DashboardCard03 />
              {/* Line chart (Acme Advanced) */}
              <DashboardCard02 />
              {/* Line chart (Acme Professional) */}
              <DashboardCard05 />
              {/* Bar chart (Direct vs Indirect) */}
              <DashboardCard04
                title="Total Open VS Total Closed Values"
                labels={labels}
                dataOpen={dataOpen}
                dataClosed={dataClosed}
                amountOpen={amountOpen}
                amountClosed={amountClosed}
              />

              <DashboardCard014
                title="Total Open VS Total Closed Deals"
                labels={labels}
                totalOpenCounts={totalOpenCounts}
                totalClosedCounts={totalClosedCounts}
                openOpsCount={openOpsCount}
                closedOpsCount={closedOpsCount}
              />

              {/* Line chart (Real Time Value) */}
              {/* <DashboardCard05 /> */}
              {/* Doughnut chart (Top Countries) */}
              <DashboardCard06 />
              {/* Leader board card */}
              <LeaderboardCard />
              <SourceCard/>
              <ProductsCard/>
              {/* Table (Top Channels) */}
              {/* <DashboardCard07 />  */}
              {/* Line chart (Sales Over Time) */}
              {/* <DashboardCard08 /> */}
              {/* Stacked bar chart (Sales VS Refunds) */}
              {/* <DashboardCard09 /> */}
              {/* Card (Customers) */}
              {/* <DashboardCard10 /> */}
              {/* Card (Reasons for Refunds) */}
              {/* <DashboardCard11 /> */}
              {/* Card (Recent Activity) */}
              {/* <DashboardCard12 /> */}
              {/* Card (Income/Expenses) */}
              {/* <DashboardCard13 /> */}
              
            </div>

          </div>
        </main>


      </div>
    </div>
  );
}

export default Dashboard;