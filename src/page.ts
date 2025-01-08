export function errorPage(c: any) {
    return `
    <html>
      <head>
        <title>失败</title>
      </head>
      <body>
        <h1>提交失败！</h1>
        <p>${c}</p>
      </body>
    </html>
    `;
}
