export const CSS = `
body {
  height: 100vh;
  width: 100vw;
  padding: 1em;
  font-family: "HarmonyOS Sans SC", "Mi Sans", "Noto Sans", "Noto Sans CJK SC",
    "Plangothic P1", "Plangothic P2", "PingFang SC", system-ui, sans-serif;
  background-image: url("https://remnote-user-data.s3.amazonaws.com/zdmD37mYLVSvuv96iGt-UgA-6HGPWJb3c8F3JvI5xYoNLCWij3fF_v4akSq4JawanqbdOxk-44G0T2VVMWTgAEINSKf7ptipmsIrYE5Iyx8PJVZ5154Si3xTvmsdyreJ.webp"),
    url("https://remnote-user-data.s3.amazonaws.com/aqIgx6FrWE_Pmr_u3kHAAHgRil5DzD72WHFxw11gRUVYiiM-K_fyRdwb2wT_tyfeFIe874gJVgp3XkVyqMqWg07Zt5N0Q6arbITa1n035avyoyWig44BZLpJuaw--xVP.jpeg");
  background-repeat: no-repeat, no-repeat; /* 防止重复 */
  background-size: cover;
  background-position: center; /* 背景图像居中显示 */
  filter: brightness(0.89);
}

h1 {
  font-size: 2em;
}

main {
  color: white;
  font-size: 1.1em;
}

p {
  font-size: 1.2em;
}

a {
  color: #30a7cc;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.2em;
}

a:hover {
  text-decoration: underline;
}
`

export function errorPage(c: any) {
  return `
    <html>
      <head>
        <style>${CSS}</style>
        <title>失败</title>
      </head>
      <body>
        <main>
          <h1>提交失败！</h1>
          <p>原因：</p>
          <p>${c}</p>
        </main>
      </body>
    </html>
    `;
}
