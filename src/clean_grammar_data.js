
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'grammar_data.json');

const rawData = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(rawData);

// Deduplicate based on sentence
const uniqueMap = new Map();
data.forEach(item => {
    if (!uniqueMap.has(item.sentence)) {
        uniqueMap.set(item.sentence, item);
    }
});

const uniqueData = Array.from(uniqueMap.values());

// Tag Legendary Questions
uniqueData.forEach(q => {
    if (q.rule.includes('Spartan') || q.rule.includes('NASA') || q.rule.includes('Deadly Comma') || q.rule.includes('Million Dollar Comma')) {
        q.isLegendary = true;
    }
});

fs.writeFileSync(filePath, JSON.stringify(uniqueData, null, 2));
console.log(`Cleaned and tagged ${uniqueData.length} unique questions.`);
