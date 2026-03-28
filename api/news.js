export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  const topic = req.query.topic || "technology";

  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
    topic
  )}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(rssUrl);
    const xml = await response.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => {
      const block = match[1];

      const get = (tag) => {
        const pattern = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`);
        const m = block.match(pattern);
        return m ? m[1].replace(/<!

\[CDATA

\[|\]

\]

>/g, "").trim() : "";
      };

      const title = get("title");
      const link = get("link");
      const pubDate = get("pubDate");
      const description = get("description");

      let imgUrl = "";
      const imgMatch = description.match(/src="(.*?)"/);
      if (imgMatch) imgUrl = imgMatch[1];

      return { title, link, pubDate, description, imgUrl };
    });

    res.status(200).json({ articles: items });
  } catch (e) {
    res.status(500).json({ articles: [], error: e.toString() });
  }
}

