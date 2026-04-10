const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const buf = fs.readFileSync('C:/Users/Admin/Desktop/cursor/컴포넌트 속성 정의서.pdf');
const parser = new PDFParse();
parser.parse(buf).then(data => {
  console.log('총 페이지:', data.numpages);
  fs.writeFileSync('C:/Users/Admin/Desktop/claude_test/pdf-text.txt', data.text, 'utf-8');
  console.log('저장완료. 길이:', data.text.length);
  console.log(data.text.substring(0, 3000));
}).catch(e => console.error(e.message));
