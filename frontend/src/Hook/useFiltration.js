import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const useFiltration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialUser = searchParams.get("user") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialCourse = searchParams.get("courseId") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialStartDate = searchParams.get("startDate") || "";
  const initialEndDate = searchParams.get("endDate") || "";
  const initialPeriod = searchParams.get("period") || "";
  const initialPage = searchParams.get("page") || 1;
  const initialPageSize = searchParams.get("pageSize") || 10;

  const [filters, setFilters] = useState({
    search: initialSearch,
    user: initialUser,
    status: initialStatus,
    course: initialCourse,
    startDate: initialStartDate,
    endDate: initialEndDate,
    period: initialPeriod,
    page: initialPage,
    pageSize: initialPageSize,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  // Update debounced search with a delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.search]);

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({
      ...prev,
      page, // Keep it 1-based (as expected by Ant Design)
      pageSize,
    }));
  };
  // Update URL query string when filters change

  useEffect(() => {
    // console.log("Filters Called === > ",filters);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.status) params.set("status", filters.status);
    if (filters.course) params.set("courseId", filters.course);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.period) params.set("period", filters.period);
    if (filters.page) params.set("page", filters.page);
    if (filters.pageSize) params.set("pageSize", filters.pageSize);
    if (filters.user) params.set("user", filters.user);

    // Replace current URL with new query string
    navigate({ search: params.toString() }, { replace: true });
  }, [filters, debouncedSearch, navigate]);

  const handleFilterChangeHook = (event) => {
    let { name, value } = event.target;
    if (value === "nullOptions") value = "";
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleMultipleStageIds = (selectedIds) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      stageIds: selectedIds,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      startDate: "",
      endDate: "",
      period: "",
      status: "",
      course: "",
      page: 1,
      pageSize: 10,
      user: "",
    });
  };

  return {
    filters,
    debouncedSearch,
    handleFilterChangeHook,
    handleMultipleStageIds,
    handlePaginationChange,
    clearFilters,
  };
};
export default useFiltration;
