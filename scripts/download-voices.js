const fs = require('fs');
const path = require('path');
const https = require('https');

// CSV 파일 읽기
function parseCSV() {
  const csvPath = '/Users/yunsungji/Desktop/voice_list.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  const voices = [];
  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSV 파싱 - 쉼표로 구분, 마지막 필드는 audio tag
    const parts = line.split(',');
    
    if (parts.length >= 4) {
      const name = parts[0].trim();
      const style = parts[1].trim();
      const id = parts[2].trim();
      
      // 마지막 부분에서 src URL 추출
      const audioTag = parts.slice(3).join(','); // 마지막 필드에 쉼표가 있을 수 있음
      const urlMatch = audioTag.match(/src=""([^"]+)""/);
      
      if (urlMatch) {
        const mp3Url = urlMatch[1];
        voices.push({
          name: name,
          style: style,
          id: id,
          mp3Url: mp3Url,
          previewFile: `${id}.mp3`
        });
        console.log(`Parsed: ${name} - ${id}`);
      } else {
        console.log(`Failed to parse URL for: ${name}`);
      }
    }
  }
  
  return voices;
}

// MP3 파일 다운로드
function downloadFile(url, destinationPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destinationPath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close(() => {
          console.log(`Downloaded: ${path.basename(destinationPath)}`);
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(destinationPath, () => {});
      reject(err);
    });
  });
}

// 메인 함수
async function main() {
  const voices = parseCSV();
  console.log(`Found ${voices.length} voices`);
  
  // public/voice-previews 디렉토리 생성
  const previewDir = path.join(__dirname, '..', 'public', 'voice-previews');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
  
  // voices.json 파일 생성
  const voicesJsonPath = path.join(__dirname, '..', 'public', 'voices.json');
  fs.writeFileSync(voicesJsonPath, JSON.stringify(voices, null, 2));
  console.log(`Created voices.json with ${voices.length} voices`);
  
  // MP3 파일 다운로드
  console.log('Downloading preview files...');
  for (const voice of voices) {
    const destinationPath = path.join(previewDir, voice.previewFile);
    
    // 이미 존재하는 파일은 스킵
    if (fs.existsSync(destinationPath)) {
      console.log(`Skipped (exists): ${voice.previewFile}`);
      continue;
    }
    
    try {
      await downloadFile(voice.mp3Url, destinationPath);
      // 잠시 대기 (서버 부하 방지)
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to download ${voice.name}: ${error.message}`);
    }
  }
  
  console.log('All downloads completed!');
}

// 실행
main().catch(console.error);
