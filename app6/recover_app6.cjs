const fs = require('fs');
const path = require('path');
const historyDir = '/home/nopparus2/.antigravity-server/data/User/History';
const targetTime = 1771656819000; // max timestamp (06:53Z before Git wipe)

const dirs = fs.readdirSync(historyDir);

for (const d of dirs) {
  const p = path.join(historyDir, d, 'entries.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const resPath = data.resource.split('home/nopparus2/www/app6/')[1];
    if (resPath && (resPath.startsWith('src/') || resPath.startsWith('package.json'))) {
      const validEntries = data.entries.filter(e => e.timestamp <= targetTime || Math.abs(e.timestamp - targetTime) < 3600000);
      if (validEntries.length > 0) {
        validEntries.sort((a,b) => b.timestamp - a.timestamp); // latest first
        const bestEntry = validEntries[0];
        
        console.log(`Recovering ${resPath} from ${bestEntry.id} (time: ${new Date(bestEntry.timestamp).toISOString()})`);
        
        const content = fs.readFileSync(path.join(historyDir, d, bestEntry.id), 'utf8');
        const targetFile = path.join('/home/nopparus2/www/app6', resPath);
        fs.mkdirSync(path.dirname(targetFile), { recursive: true });
        fs.writeFileSync(targetFile, content);
      }
    }
  }
}
