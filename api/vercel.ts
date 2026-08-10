export default async function handler(req, res) {
  const { app } = await import("../apps/api/src/app.js");
  return app(req, res);
}
