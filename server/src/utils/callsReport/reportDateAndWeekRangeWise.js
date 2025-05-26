import prisma from "../../config/prismaClient.js";

import { convertToUTC } from "../dateUtil.js";
//lead weekly calls, monthly calls.......................................................
export const getDateRangeCalls = async (data) => {
  const { period, filters } = data;
  const calls = [];
  let numPeriods = 7; // Default to 7 days

  // Set number of periods based on period parameter
  if (period === "week") {
    numPeriods = 7;
  } else if (period === "month") {
    numPeriods = 12; // Changed to 12 months
  }

  for (let i = 0; i < numPeriods; i++) {
    let dayStart, dayEnd;

    // Daily view for week/month
    dayStart = new Date();
    if (period === "month") {
      // Set to first day of previous months
      dayStart.setDate(1);
      dayStart.setMonth(dayStart.getMonth() - i);
    } else {
      dayStart.setDate(dayStart.getDate() - i);
    }
    dayStart.setHours(0, 0, 0, 0);

    dayEnd = new Date(dayStart);
    if (period === "month") {
      // Set to last day of the month
      dayEnd.setMonth(dayEnd.getMonth() + 1);
      dayEnd.setDate(0);
    }
    dayEnd.setHours(23, 59, 59, 999);

    const leads = await prisma.lead.findMany({
      where: {
        ...filters,
        dispositions: {
          some: {
            createdAt: {
              gte: convertToUTC(dayStart),
              lte: convertToUTC(dayEnd),
            },
          },
        },
      },
      select: {
        id: true,
        dispositions: {
          where: {
            createdAt: {
              gte: convertToUTC(dayStart),
              lte: convertToUTC(dayEnd),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            callDuration: true,
          },
        },
      },
    });

    const buckets = {
      "0-2 min": 0,
      "2-5 min": 0,
      "5-10 min": 0,
      "10+ min": 0,
    };

    leads.forEach((lead) => {
      const disposition = lead.dispositions[0];

      if (disposition) {
        const duration = Math.round(disposition.callDuration / 60);

        if (duration <= 2) {
          buckets["0-2 min"]++;
        } else if (duration > 2 && duration <= 5) {
          buckets["2-5 min"]++;
        } else if (duration > 5 && duration <= 10) {
          buckets["5-10 min"]++;
        } else if (duration > 10) {
          buckets["10+ min"]++;
        }
      }
    });

    const periodLabel = {
      date: dayStart.toLocaleDateString("en-GB"),
      day:
        period === "month"
          ? dayStart.toLocaleDateString("en-GB", { month: "short" })
          : dayStart.toLocaleDateString("en-GB", { weekday: "short" }),
    };

    calls.push({
      period: periodLabel,
      calls: buckets,
    });
  }
  return calls;
};

//Lead Tag wise eg, cold, hot, good with period filter...................................
export const leadTagWiseCount = async (data) => {
  const { leadTagPeriod, filters } = data;
  const period = leadTagPeriod;
  const tagCounts = [];

  const numPeriods = period === "month" ? 12 : 7;

  for (let i = 0; i < numPeriods; i++) {
    let startDate = new Date();
    let endDate;

    if (period === "month") {
      // Go back i months and set to first day of that month
      startDate.setMonth(startDate.getMonth() - i);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      // End date = last day of the same month
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Go back i days and set full day range
      startDate.setDate(startDate.getDate() - i);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    }

    const leads = await prisma.lead.findMany({
      where: {
        ...filters,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tags: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            tag: true,
          },
        },
      },
    });

    const tagBuckets = {
      cold: 0,
      hot: 0,
      good: 0,
      bant: 0, // Changed to lowercase to match other tags
      "n-bant": 0, // Added quotes for hyphenated property name
    };

    leads.forEach((lead) => {
      if (lead.tags.length > 0 && lead.tags[0]?.tag?.name) {
        const tag = lead.tags[0].tag.name.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(tagBuckets, tag)) {
          tagBuckets[tag]++;
        }
      }
    });

    // Format period label with separate date and day
    const periodLabel = {
      date: startDate.toLocaleDateString("en-GB"),
      day:
        period === "month"
          ? startDate.toLocaleString("default", { month: "short" })
          : startDate.toLocaleDateString("en-GB", { weekday: "short" }),
    };

    tagCounts.push({
      period: periodLabel,
      ...tagBuckets,
    });
  }

  return tagCounts.reverse(); // Optional: oldest to latest
};
//Project wise percentage & client quoted budget.........................................
export const overallProjectWisePercentage = async (period) => {
  const now = new Date();
  let fromDate = new Date();

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
    return new Date(date.setDate(diff));
  };

  switch (period) {
    case "thisWeek": {
      fromDate = getMonday(new Date());
      break;
    }
    case "lastWeek": {
      const mondayThisWeek = getMonday(new Date());
      fromDate = new Date(mondayThisWeek);
      fromDate.setDate(fromDate.getDate() - 7);
      break;
    }
    case "oneMonth": {
      fromDate.setMonth(fromDate.getMonth() - 1);
      break;
    }
    case "threeMonth": {
      fromDate.setMonth(fromDate.getMonth() - 3);
      break;
    }
    case "sixMonth": {
      fromDate.setMonth(fromDate.getMonth() - 6);
      break;
    }
    case "oneYear": {
      fromDate.setFullYear(fromDate.getFullYear() - 1);
      break;
    }
    default:
      fromDate = new Date(0); // All-time fallback
  }

  const allProjects = await prisma.project.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      LeadProjects: {
        include: {
          lead: true,
        },
        where: {
          lead: {
            createdAt: {
              gte: fromDate,
              lte: now,
            },
          },
        },
      },
    },
  });

  const projectLeadStats = allProjects.map((project) => {
    const count = project.LeadProjects.length;
    const totalBudget = project.LeadProjects.reduce((sum, lp) => {
      return sum + (lp.lead?.clientBudget || 0);
    }, 0);

    return {
      project: project.name,
      count,
      totalBudget,
    };
  });

  const totalLeadCount = projectLeadStats.reduce(
    (acc, curr) => acc + curr.count,
    0
  );

  const result = projectLeadStats.map((p) => ({
    project: p.project,
    percentage:
      totalLeadCount > 0
        ? `${((p.count / totalLeadCount) * 100).toFixed(2)}%`
        : "0.00%",
    totalLeads: p.count,
    totalClientQuotedBudget: p.totalBudget,
  }));

  return result;
};

//top closure client.....................................................................
export const topClientReport = async (topClientsSort) => {
  const topClients = await prisma.lead.findMany({
    where: {
      isClient: true,
      pipelineStage: {
        name: "Closure",
      },
    },
    select: {
      name: true,
      finalClosedBudget: true,
      dispositions: true,
      pipelineStage: {
        select: {
          name: true,
        },
      },
    },
  });

  const clientStats = topClients.map((client) => {
    const closedCount = client.dispositions?.length || 0;
    return {
      client: client.name,
      closedCount,
      finalClosedBudget: client.finalClosedBudget || 0,
      stageStatus: client.pipelineStage?.name || "No Stage",
    };
  });

  const sortedClients = clientStats.sort(
    (a, b) => b.finalClosedBudget - a.finalClosedBudget
  );

  const top5Clients = sortedClients.slice(0, 3);

  return top5Clients;
};
