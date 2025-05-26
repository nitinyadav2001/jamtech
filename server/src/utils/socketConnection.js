export const connectSocket = (io, total, current, duplicate) => {
  const emitProgress = () => {
    if (total === 0) return;

    // Calculate percentage, clamped between 0-100
    const percentage = Math.min(
      100,
      Math.max(0, Math.round((current / total) * 100))
    );

    // Emit progress event with payload
    io.emit("uploadProgress", {
      total,
      current,
      duplicate,
      percentage,
    });
  };

  return { emitProgress };
};
