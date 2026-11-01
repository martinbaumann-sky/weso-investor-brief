/** Public Flow entry. Its static app uses no Hub authentication or session. */
export function GET(request: Request) {
  const destination = new URL('/wesoflow/index.html', request.url);
  destination.search = new URL(request.url).search;
  // Browsers retain the incoming fragment (shared project link) through this redirect.
  return Response.redirect(destination, 307);
}
