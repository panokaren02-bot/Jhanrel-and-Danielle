"use client"

import { useState, type CSSProperties, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

// Palette lives in globals.css → motif / welcome tokens.
const IVORY = "var(--color-motif-soft)"
const PAPER = "var(--color-welcome-bg-soft)"
const NAVY = "var(--color-welcome-navy)"
const SCRIPT = "var(--color-welcome-script)"
const BODY = "var(--color-welcome-text)"
const ACCENT = "var(--color-motif-accent)"

const sectionBg = `
  radial-gradient(820px 460px at 50% 0%, color-mix(in srgb, var(--color-motif-silver) 75%, transparent) 0%, transparent 65%),
  radial-gradient(560px 380px at 0% 60%, color-mix(in srgb, var(--color-motif-blush) 30%, transparent) 0%, transparent 60%),
  radial-gradient(560px 380px at 100% 85%, color-mix(in srgb, var(--color-motif-blush) 30%, transparent) 0%, transparent 60%),
  linear-gradient(180deg, var(--color-welcome-bg-soft) 0%, var(--color-motif-cream) 100%)
`.trim()

const cardStyle = {
  background: `linear-gradient(180deg, ${PAPER} 0%, var(--color-motif-cream) 100%)`,
  boxShadow:
    "0 26px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)",
} as const

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-motif-medium), transparent)",
} as const

const CORNER_DECO_CLASS =
  "block h-auto w-auto max-w-[130px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[320px] select-none opacity-90"

const ct = {
  body: sectionType.textRelaxed,
  question: sectionType.text,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} loading="lazy" decoding="async" alt="" aria-hidden="true" className={className} />
  )
}

function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium))" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: ACCENT }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-medium))" }} />
    </div>
  )
}

function FaqTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {subtitle}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", color: NAVY }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{ fontSize: "var(--script-size)", color: SCRIPT, textShadow: "0 1px 0 var(--color-motif-soft)" }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

// "[guest list](#guest-list)" → smooth-scrolling link; everything else stays text
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\(#[^)]+\))/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(#([^)]+)\)$/)
    if (!match) return part
    const [, label, id] = match
    return (
      <a
        key={i}
        href={`#${id}`}
        className="font-semibold underline decoration-[var(--color-motif-medium)] underline-offset-2 transition-opacity hover:opacity-80"
        style={{ color: "var(--color-motif-deep)" }}
        onClick={(e) => {
          e.preventDefault()
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
        }}
      >
        {label}
      </a>
    )
  })
}

// Paragraphs split on blank lines; lines starting with "• " render as a list
function FaqAnswer({ answer }: { answer: string }) {
  const blocks = answer.split(/\n{2,}/)
  return (
    <div className={`font-goudy-italic ${ct.body} space-y-2.5`} style={{ color: BODY }}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean)
        if (lines.length > 0 && lines.every((line) => line.trim().startsWith("•"))) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((line, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--color-motif-accent)" }}
                  />
                  <span>{renderInline(line.replace(/^\s*•\s*/, ""))}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

export function FAQ() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.faq
  const { decos } = content
  const reduceMotion = useReducedMotion()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const rsvp = siteConfig.details.rsvp
  const rsvpPhone = rsvp.phone.trim()
  const showRsvpPhone = rsvpPhone.length > 0 && !/to be announced/i.test(rsvpPhone)
  const ceremonyTime =
    siteConfig.ceremony.time ?? siteConfig.wedding.time ?? defaultSiteConfig.ceremony.time

  const fillAnswer = (text: string) =>
    text
      .split("{deadline}").join(rsvp.deadline.replace(/\.\s*$/, ""))
      .split("{coordinator}").join(rsvp.coordinator)
      // coordinator may itself use {groom} / {bride}
      .split("{groom}").join(siteConfig.couple.groomNickname || siteConfig.couple.groom)
      .split("{bride}").join(siteConfig.couple.brideNickname || siteConfig.couple.bride)
      .split("{contact}").join(showRsvpPhone ? ` at ${rsvpPhone}` : "")
      .split("{ceremonyTime}").join(ceremonyTime)

  const initial = reduceMotion ? false : "hidden"

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full`}
      style={{ background: sectionBg }}
    >
      <section
        id="faq"
        className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Corner decorations (from site.ts) */}
        <div className="pointer-events-none absolute left-0 top-0 z-10">
          <DecoImg src={decos.topLeft} className={CORNER_DECO_CLASS} />
        </div>
        <div className="pointer-events-none absolute right-0 top-0 z-10">
          <DecoImg src={decos.topRight} className={CORNER_DECO_CLASS} />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 z-10">
          <DecoImg src={decos.bottomLeft} className={CORNER_DECO_CLASS} />
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 z-10">
          <DecoImg src={decos.bottomRight} className={CORNER_DECO_CLASS} />
        </div>

        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/faq sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DecoImg
            src={decos.headerOrnament}
            className="mx-auto mb-3 block h-auto w-28 select-none sm:mb-4 sm:w-36 md:w-44"
          />
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={{ color: ACCENT }}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <FaqTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.body}`}
            style={{ color: BODY }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span className="h-px w-16 sm:w-24 md:w-32" style={dividerLineStyle} />
          </div>
        </motion.div>

        {/* Questions */}
        <div className="relative z-20 mx-auto max-w-3xl px-4 sm:px-6 md:px-8">
          <motion.div
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Top glow */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-40"
              style={{
                background:
                  "radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--color-motif-silver) 70%, transparent), transparent)",
              }}
            />

            <motion.ul
              className="relative z-20 space-y-2 px-4 py-5 sm:space-y-2.5 sm:px-6 sm:py-7 md:px-8"
              variants={listVariants}
              initial={initial}
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {content.items.map((item, index) => {
                const isOpen = openIndex === index
                const contentId = `faq-item-${index}`
                return (
                  <motion.li
                    key={item.question}
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl transition-all duration-300"
                    style={{
                      background: isOpen
                        ? "color-mix(in srgb, var(--color-motif-silver) 45%, var(--color-motif-soft))"
                        : "color-mix(in srgb, var(--color-motif-soft) 70%, transparent)",
                      boxShadow: isOpen
                        ? "0 12px 24px -16px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent)"
                        : "none",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="group flex w-full items-center gap-3 px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:px-5 sm:py-3.5"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                    >
                      <span
                        className={`${theSeasons.className} flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.72rem] transition-all duration-300 sm:h-8 sm:w-8 sm:text-[0.8rem]`}
                        style={
                          isOpen
                            ? {
                                background:
                                  "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 55%, var(--color-welcome-navy) 100%)",
                                color: IVORY,
                              }
                            : { background: "color-mix(in srgb, var(--color-motif-silver) 70%, transparent)", color: ACCENT }
                        }
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`${cinzel.className} ${ct.question} flex-1 font-semibold leading-snug transition-colors duration-200`}
                        style={{ color: isOpen ? "var(--color-motif-deep)" : NAVY }}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                        style={{ background: isOpen ? IVORY : "color-mix(in srgb, var(--color-motif-silver) 55%, transparent)" }}
                        aria-hidden
                      >
                        <ChevronDown className="h-4 w-4" style={{ color: ACCENT }} />
                      </span>
                    </button>

                    <div
                      id={contentId}
                      role="region"
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3.5 pb-4 sm:px-5 sm:pb-5">
                          <span className="mb-3 block h-px w-full" style={dividerLineStyle} aria-hidden />
                          <div className="sm:pl-11">
                            <FaqAnswer answer={fillAnswer(item.answer)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>

          <DecoImg
            src={decos.footerVine}
            className="mx-auto mt-10 block h-auto w-56 select-none opacity-90 sm:mt-12 sm:w-72 md:w-96"
          />
        </div>
      </section>
    </div>
  )
}
