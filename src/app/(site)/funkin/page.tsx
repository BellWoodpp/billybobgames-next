import type { Metadata } from "next";
import PageShell from "../_components/PageShell";
import styles from "./funkin.module.css";

export const metadata: Metadata = {
  title: "Friday Night Funkin' Linux 版 | Billy Bob Games",
  description:
    "下载并了解 Friday Night Funkin' Linux 64 位版本的文件结构与运行方式。",
  alternates: {
    canonical: "https://billybobgames.org/funkin",
  },
};

export default function FunkinPage() {
  return (
    <PageShell>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Friday Night Funkin' Linux 64 位版</h1>
          <p className={styles.subtitle}>
            该资源为 Linux 原生可执行程序，无法直接在浏览器内启动，但你可以下载后在本地运行。
          </p>
          <a className={styles.download} href="/funkin-linux-64bit/Funkin" download>
            下载 Linux 可执行文件
          </a>
          <p className={styles.hint}>首次运行前请在终端执行：chmod +x Funkin</p>
        </header>

        <section className={styles.card} aria-labelledby="run-instructions">
          <h2 id="run-instructions">如何在 Linux 上运行</h2>
          <ol>
            <li>确保下载目录中保留 <code>assets</code>、<code>manifest</code> 等文件夹的完整结构。</li>
            <li>在终端进入目录后执行 <code>chmod +x Funkin</code> 授予执行权限。</li>
            <li>运行 <code>./Funkin</code> 启动游戏；如需窗口化参数，可加入 <code>--help</code> 查看支持选项。</li>
          </ol>
        </section>

        <section className={styles.card} aria-labelledby="resource-structure">
          <h2 id="resource-structure">资源解析</h2>
          <p>本包内的关键内容：</p>
          <ul>
            <li><code>Funkin</code>：主程序，ELF 64 位可执行文件。</li>
            <li><code>assets/</code>：角色动画、场景、音乐及音效资源。</li>
            <li><code>manifest/</code>：各周目、歌曲、视频等配置 JSON。</li>
            <li><code>lime.ndll</code>：HaxeFlixel / Lime 运行依赖。</li>
            <li><code>CHANGELOG.md</code>、<code>LICENSE.md</code>：版本历史与开源许可说明。</li>
          </ul>
        </section>

        <section className={styles.card} aria-labelledby="why-no-embed">
          <h2 id="why-no-embed">为何无法直接嵌入网页</h2>
          <p>
            当前资源不包含 HTML 或 WebAssembly 入口文件，因此无法像其他 HTML5 游戏那样通过 iframe 方式直接嵌入页面。若需要在线游玩版本，请获取官方的 Web 导出，将其放入
            <code>public/games</code> 目录并调整本页面的 iframe 指向。
          </p>
        </section>
      </main>
    </PageShell>
  );
}
