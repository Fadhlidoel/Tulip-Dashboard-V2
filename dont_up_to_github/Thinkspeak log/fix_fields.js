#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, 'script.js');

console.log('🔧 Fixing field mapping in script.js...\n');

// Read file
let content = fs.readFileSync(scriptPath, 'utf8');

console.log('Original content (suhu & kelembapan sections):');
const lines = content.split('\n');
lines.forEach((line, idx) => {
    if (idx >= 47 && idx <= 65) {
        console.log(`${idx+1}: ${line}`);
    }
});

// Fix SENSOR_CONFIG['suhu']: field3 -> field4
console.log('\n\n1️⃣ Fixing SENSOR_CONFIG[suhu]: field3 -> field4');
const suhuMatch = content.match(/'suhu'\s*:\s*\{\s*field:\s*'field3'/);
if (suhuMatch) {
    content = content.replace(
        /'suhu'\s*:\s*\{\s*field:\s*'field3'/,
        "'suhu' : {\n         field: 'field4'"
    );
    console.log('✅ Fixed');
} else {
    console.log('⚠️ Pattern not found - checking current state...');
}

// Fix SENSOR_CONFIG['kelembapan']: field4 -> field5
console.log('\n2️⃣ Fixing SENSOR_CONFIG[kelembapan]: field4 -> field5');
const humidMatch = content.match(/'kelembapan'\s*:\s*\{\s*field:\s*'field4'/);
if (humidMatch) {
    content = content.replace(
        /'kelembapan'\s*:\s*\{\s*field:\s*'field4'/,
        "'kelembapan' : {\n         field: 'field5'"
    );
    console.log('✅ Fixed');
} else {
    console.log('⚠️ Pattern not found - might already be fixed');
}

console.log('\n\nAfter fix:');
const fixedLines = content.split('\n');
fixedLines.forEach((line, idx) => {
    if (idx >= 47 && idx <= 65) {
        console.log(`${idx+1}: ${line}`);
    }
});

// Write back
fs.writeFileSync(scriptPath, content, 'utf8');
console.log('\n\n✅ File updated successfully!');
console.log('Backup created as: script.js.bak');

// Create backup
fs.copyFileSync(scriptPath, scriptPath + '.bak');

console.log('\n🎉 Done! Restart the web server and test.');
