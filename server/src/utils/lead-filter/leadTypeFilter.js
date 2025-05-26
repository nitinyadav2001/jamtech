export const leadTypeFilter = (
  filter,
  whereFilter,
  todayStart,
  todayEnd,
  deadStage
) => {
  switch (filter) {
    case "New Leads":
      whereFilter = {
        ...whereFilter,
        pipelineStageId: { not: deadStage.id },
        createdAt: {
          lt: todayStart,
        },
        dispositions: { none: {} },
      };
      break;

    case "Today's Follow Up":
      whereFilter = {
        ...whereFilter,
        pipelineStageId: { not: deadStage.id },
        leadFollowUpDate: { gte: todayStart, lte: todayEnd },
      };
      break;

    case "Past Follow Up":
      whereFilter = {
        ...whereFilter,
        pipelineStageId: { not: deadStage.id },
        leadFollowUpDate: { lte: todayStart },
        NOT: {
          dispositions: { none: {} },
        },
      };
      break;

    case "Upcoming Follow Up":
      whereFilter = {
        ...whereFilter,
        pipelineStageId: { not: deadStage.id },
        leadFollowUpDate: { gte: todayEnd },
      };
      break;

    case "Fresh Leads":
      whereFilter = {
        ...whereFilter,
        pipelineStageId: { not: deadStage.id },
        createdAt: { gte: todayStart, lte: todayEnd },
        dispositions: { none: {} },
      };
      break;

    default:
      break;
  }
  return whereFilter;
};
