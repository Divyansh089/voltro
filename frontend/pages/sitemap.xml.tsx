import { GetServerSideProps } from "next";

const BASE_URL = "";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const paths = ["/", "/categories", "/cart", "/checkout", "/auth"];
  const urls = paths
    .map(
      (p) =>
        `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.write(xml);
  res.end();

  return {
    props: {},
  };
};

export default function Sitemap() {
  return null;
}
