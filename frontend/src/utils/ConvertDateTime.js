import { format } from "date-fns";
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return "ᵗʰ";
  switch (day % 10) {
    case 1:
      return "ˢᵗ";
    case 2:
      return "ⁿᵈ";
    case 3:
      return "ʳᵈ";
    default:
      return "ᵗʰ";
  }
}

export const convertDateTime = (dateString) => {
  if (!dateString || isNaN(new Date(dateString).getTime())) {
    return null;
  }

  const date = new Date(dateString);
  const day = date.getDate();
  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`;
  const formattedDate = format(date, "MMMM yyyy, h:mm aaa");

  return `${dayWithSuffix} ${formattedDate}`;
};
