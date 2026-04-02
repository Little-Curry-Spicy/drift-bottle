import Image from "next/image";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[min(140vw,900px)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(79,124,255,0.2),transparent_68%)]" />
        <div className="absolute bottom-0 right-[-20%] h-[380px] w-[min(80vw,560px)] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(155,183,255,0.4),transparent_70%)]" />
      </div>

      <SiteHeader />

      <main>
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 md:pb-24">
          <div className="rounded-[3rem] border border-border/80 bg-card/95 px-6 py-10 shadow-[0_24px_80px_-40px_rgba(39,72,171,0.28)] sm:px-10 sm:py-14">
            <p className="mb-3 text-sm font-medium tracking-wide text-primary">匿名 · 温柔 · 偶然相遇</p>
            <h1 className="font-display text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              把故事装进瓶子，
              <span className="text-primary">扔进同一片海</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Share a feeling anonymously and connect with someone who resonates.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              把此刻写进瓶子，扔向大海。也许会被某个陌生人捞起，也许会收到一句刚好治愈你的回复——与移动端
              <strong className="font-semibold text-foreground/90"> Drift Bottle </strong>
              使用同一套视觉与产品叙事。
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#download"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-accent"
              >
                获取移动应用
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-6 py-3.5 text-base font-semibold text-foreground transition hover:border-primary/40"
              >
                了解功能
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-20 sm:px-6">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">App 里能做什么</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            与{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">apps/mobile</code>{" "}
            主界面一致：Sea、Drop、Saved、Mine，外加简洁数据看板。
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <article className="rounded-3xl border border-border/80 bg-card p-6 transition hover:border-primary/25 hover:shadow-[0_20px_50px_-30px_rgba(39,72,171,0.35)]">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-xl" aria-hidden>
                  🧭
                </span>
                <h3 className="text-lg font-semibold text-foreground">Sea · Catch a bottle</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Meet an anonymous story from someone out there. 一键捞瓶，阅读陌生人的只言片语。
              </p>
            </article>
            <article className="rounded-3xl border border-border/80 bg-card p-6 transition hover:border-primary/25 hover:shadow-[0_20px_50px_-30px_rgba(39,72,171,0.35)]">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-xl" aria-hidden>
                  ✈️
                </span>
                <h3 className="text-lg font-semibold text-foreground">Drop · 扔出你的瓶子</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Write what is on your mind and send it anonymously. 最多 200 字，搭配罗盘方向与轻微陀螺仪互动。
              </p>
            </article>
            <article className="rounded-3xl border border-border/80 bg-card p-6 transition hover:border-primary/25 hover:shadow-[0_20px_50px_-30px_rgba(39,72,171,0.35)]">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-xl" aria-hidden>
                  💬
                </span>
                <h3 className="text-lg font-semibold text-foreground">回复与收藏</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Send reply、收藏喜欢的瓶子；数据看板展示 Dropped、Saved、Replies，看见自己的参与感。
              </p>
            </article>
            <article className="rounded-3xl border border-border/80 bg-card p-6 transition hover:border-primary/25 hover:shadow-[0_20px_50px_-30px_rgba(39,72,171,0.35)]">
              <div className="flex items-center gap-2 text-primary">
                <span className="text-xl" aria-hidden>
                  🔐
                </span>
                <h3 className="text-lg font-semibold text-foreground">账号与安全</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                移动端使用 Clerk 登录；后端可提供 NestJS API 与 Supabase 数据层，官网仅作品牌与下载引导。
              </p>
            </article>
          </div>
        </section>

        <section id="download" className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-24 sm:px-6">
          <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/80 px-6 py-10 sm:px-10">
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">获取 Drift Bottle</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              请在仓库根目录运行{" "}
              <code className="rounded bg-background px-1.5 py-0.5 text-sm">pnpm mobile</code>{" "}
              本地体验 Expo 客户端；应用商店链接可在上架后替换下方按钮。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex cursor-not-allowed items-center rounded-2xl border border-dashed border-border bg-background/80 px-5 py-3 text-sm font-semibold text-muted-foreground">
                App Store（即将上线）
              </span>
              <span className="inline-flex cursor-not-allowed items-center rounded-2xl border border-dashed border-border bg-background/80 px-5 py-3 text-sm font-semibold text-muted-foreground">
                Google Play（即将上线）
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 bg-card/60 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/icon.png" alt="Drift Bottle" width={32} height={32} className="rounded-lg opacity-90" />
            <div>
              <p className="font-display font-semibold text-foreground">Drift Bottle · 漂流瓶</p>
              <p className="text-sm text-muted-foreground">Monorepo：mobile · api · shared</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">© 漂流瓶项目。设计与配色与移动端 global.css 主题变量对齐。</p>
        </div>
      </footer>
    </>
  );
}
