// Fetch each source, strip to text, hash, write snapshots/<slug>.txt; exit 0 always, print changed list.
import fs from 'node:fs'; import crypto from 'node:crypto';
const urls = JSON.parse(fs.readFileSync('scripts/sources.json'));
const changed = [];
for (const u of urls) {
  const slug = u.replace(/^https?:\/\//,'').replace(/[^a-z0-9]+/gi,'_');
  try {
    const html = await (await fetch(u,{headers:{'user-agent':'QuotaWatch/0.1 (+https://quotawatch.dev)'}})).text();
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const f = `snapshots/${slug}.txt`; const old = fs.existsSync(f) ? fs.readFileSync(f,'utf8') : '';
    if (old !== text) { fs.writeFileSync(f, text); changed.push(u); }
  } catch (e) { console.error('fail', u, e.message); }
}
console.log(JSON.stringify({changed}));
