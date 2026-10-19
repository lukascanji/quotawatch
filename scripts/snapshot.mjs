// Fetch each source, strip to text, write snapshots/<slug>.txt; exit 0 always, print changed list.
// Also writes data/status.json (last successful check time) so every successful run updates the live "Last checked" date.
import fs from 'node:fs';
const urls = JSON.parse(fs.readFileSync('scripts/sources.json'));
const changed = [], failed = [];
for (const u of urls) {
  const slug = u.replace(/^https?:\/\//,'').replace(/[^a-z0-9]+/gi,'_');
  try {
    const html = await (await fetch(u,{headers:{'user-agent':'QuotaWatch/0.1 (+https://quotawatch.vercel.app)'}})).text();
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const f = `snapshots/${slug}.txt`; const old = fs.existsSync(f) ? fs.readFileSync(f,'utf8') : '';
    if (old !== text) { fs.writeFileSync(f, text); changed.push(u); }
  } catch (e) { failed.push(u); console.error('fail', u, e.message); }
}
const ok = urls.length - failed.length;
if (ok > 0) fs.writeFileSync('data/status.json', JSON.stringify({last_checked: new Date().toISOString().replace(/\.\d+Z$/,'Z'), sources_checked: ok, sources_total: urls.length, sources_failed: failed}, null, 1) + '\n');
console.log(JSON.stringify({changed, failed}));
