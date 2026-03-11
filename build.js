const fs = require('fs');
const path = require('path');

// 1. 确保输出目录 dist 存在
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// 2. 读取原始静态文件内容
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');
const jsContent = fs.readFileSync(path.join(__dirname, 'js', 'script.js'), 'utf8');

// 3. 安全转义函数：防止原代码中的反引号或模板变量导致 JS 语法错误
const escapeTemplateString = (str) => {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
};

// 4. 构建完整的 Cloudflare Worker 脚本字符串
const workerCode = `
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.endsWith('/css/style.css')) {
      return new Response(\`${escapeTemplateString(cssContent)}\`, {
        headers: {
          'Content-Type': 'text/css; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } else if (path.endsWith('/js/script.js')) {
      return new Response(\`${escapeTemplateString(jsContent)}\`, {
        headers: {
          'Content-Type': 'application/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    } else {
      return new Response(\`${escapeTemplateString(htmlContent)}\`, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      });
    }
  }
};
`;

// 5. 写入目标文件
const outputPath = path.join(distDir, '_worker.js');
fs.writeFileSync(outputPath, workerCode);
console.log(`[构建成功] 静态资源已打包至: ${outputPath}`);
