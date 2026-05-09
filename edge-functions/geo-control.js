// Netlify Edge Functions - SEO安全版地域管控 + 广告自动注入
// 配置项：目标服务国家（ISO 2位国家代码，全大写）
const TARGET_COUNTRIES = ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'DK', 'NO', 'CH', 'AU', 'NZ']
// 搜索引擎爬虫白名单
const CRAWLER_UA_KEYWORDS = ['googlebot', 'bingbot', 'duckduckbot', 'yandexbot', 'baiduspider', 'sogou', 'exabot', 'facebot', 'slurp', 'applebot']

// 广告代码（只向目标地区用户显示）
const AD_CODE = `
  <div id="ad-container" style="background: white; padding: 20px; border-top: 1px solid #eee; text-align: center; margin-top: 40px;">
    <script async src="//pricklyassociation.com/bmXKV.sgdkGelo0NYYW/cj/oeTmY9pu-ZeUXlAkDP/TqczwEMtTzUZyGN/TgM/t/NTzLAVx-N/TfI/1-NUwZ" referrerpolicy="no-referrer-when-downgrade"></script>
  </div>
`

export default async (request, context) => {
  // 第一步：判断是不是搜索引擎爬虫
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  const isCrawler = CRAWLER_UA_KEYWORDS.some(keyword => userAgent.includes(keyword))
  
  if (isCrawler) {
    return context.next() // 爬虫直接放行，不注入广告
  }

  // 第二步：获取用户所在国家
  const userCountry = context.geo?.country?.code?.toUpperCase() || ''

  // 第三步：非目标国家用户，返回区域限制页面
  if (userCountry && !TARGET_COUNTRIES.includes(userCountry)) {
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Region Restricted | PDFMaster</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            min-height: 100vh;
            background: linear-gradient(135deg, #409EFF, #67C23A);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 20px;
          }
          .content { max-width: 500px; text-align: center; }
          .emoji { font-size: 60px; margin-bottom: 20px; }
          h1 { font-size: 28px; font-weight: 700; margin-bottom: 16px; }
          p { font-size: 16px; line-height: 1.8; margin-bottom: 24px; opacity: 0.95; }
        </style>
      </head>
      <body>
        <div class="content">
          <div class="emoji">🌍</div>
          <h1>Service Region Restricted</h1>
          <p>
            Our PDFMaster tools are currently only available for users in the United States, Canada, United Kingdom, and European Union.
            <br><br>
            Thank you for your understanding and support.
          </p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 200
    })
  }

  // 第四步：目标国家用户，注入广告代码
  const response = await context.next()
  const contentType = response.headers.get('Content-Type') || ''
  
  // 只对HTML页面注入广告
  if (contentType.includes('text/html')) {
    const html = await response.text()
    // 在</body>标签前插入广告代码
    const modifiedHtml = html.replace('</body>', AD_CODE + '</body>')
    
    return new Response(modifiedHtml, {
      headers: { ...response.headers, 'Content-Type': 'text/html; charset=utf-8' },
      status: response.status
    })
  }

  return response
}

export const config = {
  path: '/*',
  excludedPath: ['/assets/*', '/lib/*', '/*.png', '/*.jpg', '/*.ico', '/*.css', '/*.js']
}
