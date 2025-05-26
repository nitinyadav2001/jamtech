export const setCache = (req, res, next) => {
    const period = 10;

    if (req.method === "GET") {
        res.set("Cache-control", `public, max - age=${period}`);
    } else {
        res.set("Cache-control", "no-store");
    }

    next();
};