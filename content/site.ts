import {
  proposalRoleDefinitions,
  proposalRoleIdAliases,
} from "@/content/proposal-roles"

export type TimelineIconName =
  | "arrival"
  | "rings"
  | "departure"
  | "cocktail"
  | "fireworks"
  | "dance"

export type AttireGroupId = "sponsors" | "entourage" | "guests"
// A palette color: "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
export type AttireColor = string | { name: string; hex: string }

/* ============================================================================
   SOP — CREATING / UPDATING AN INVITATION
   ----------------------------------------------------------------------------
   This file is the single source of truth for the couple's content. Pages,
   metadata (link previews), robots.txt, sitemap.xml, QR codes, the table
   finder and proposal pages all read from here. Avoid hard-coding couple
   names, dates, URLs or image paths in components — add them here instead.

   NEW INVITATION (cloned from a previous couple) — work top to bottom:
     1. COUPLE          names + nicknames (nicknames drive "Groom & Bride" text)
     2. DATE & TIMES    wedding date, day, entourage/guest/ceremony/reception times
     3. VENUES          ceremony + reception name, address, Google Maps link, photos;
                        VENUE_CARDS = one combined card or two separate cards + their labels
     4. RSVP            deadline, coordinator, phone; HASHTAGS
     5. WEBSITE         SITE_URL = the live domain (keep the trailing "/").
                        LINK_PREVIEW_IMAGE = 1200×630 JPG for Facebook/Messenger.
                        Both feed app/layout.tsx, app/robots.ts, app/sitemap.ts,
                        lib/proposal-metadata.ts and the table finder.
                        NEXT_PUBLIC_SITE_URL (env, e.g. on Vercel) overrides SITE_URL.
     6. LOOK & FEEL     DISPLAY_MODE "plain" or "photos"
     7. SHARED IMAGES   monogram, couple-name lettering, wax seal, music, COUPLE_PHOTOS
     8. googleAPI       new Apps Script / Form URLs for THIS couple's sheet —
                        never reuse the previous couple's (guests would mix).
     9. SECTIONS        love story, timeline events, ATTIRE (cards + palette), reminders,
                        FAQ, registry accounts/QRs, playlist, snap & share, socials.
    10. Search for "⚠ check" and old couple names/hashtags/QRs and replace them.

   BEFORE GOING LIVE:
     • Put every referenced file in /public (paths are case-sensitive on Vercel).
     • Run `npm run build` to catch typos.
     • Paste the live URL in https://developers.facebook.com/tools/debug/ and
       click "Scrape Again" so Facebook picks up the new title + preview image.
       (Changing the preview image? Rename the file — FB caches by URL.)
     • Test RSVP search, a test RSVP submission, messages and /table on mobile.

   CONVENTIONS:
     • Image paths start with "/" and are relative to /public.
     • "" on a decoration/image hides it; show: false hides a card/account/link.
     • Placeholders like {couple}, {name}, {deadline} are filled automatically —
       keep the braces when editing text.
     • ⚠ marks values likely left over from a previous couple.
   ============================================================================ */

/* ============================================================================
   QUICK SETUP — edit these first.
   Every section below reads from here, so one change updates the whole site
   (loader, envelope, hero, details, timeline, RSVP, FAQ, footer, …).
   ============================================================================ */

// ── The couple ──────────────────────────────────────────────────────────────
const COUPLE = {
  bride: "Danielle Lacasandile",
  brideNickname: "Danielle",
  groom: "Jhanrel Ballocanag",
  groomNickname: "Jhanrel",
}

// ── Date & times ────────────────────────────────────────────────────────────
const WEDDING_DATE = "November 14, 2026" // e.g. "June 5, 2027"
const WEDDING_DAY = "Saturday"
const TIMES = {
  entourageCall: "3:00 PM", // entourage arrival
  guestArrival: "3:30 PM", // guests arrival (shown in Event Details + reminders)
  ceremony: "4:30 PM",
  reception: "7:00 PM",
}

// ── Venues ──────────────────────────────────────────────────────────────────

const CEREMONY_VENUE = {
  name: "El Marie Events Place Bacnotan, La Union",
  address: "Bacnotan, 2515 La Union, Philippines",
  map: "https://maps.app.goo.gl/x9QGXZEhc3J9CKYS6",
  photos: ["/Details/reception_1.jpg", "/Details/reception_2.jpg", "/Details/reception_3.jpg"],
}
const RECEPTION_VENUE = {
  name: "El Marie Events Place Bacnotan, La Union",
  address: "Bacnotan, 2515 La Union, Philippines",
  map: "https://maps.app.goo.gl/x9QGXZEhc3J9CKYS6",
  photos: ["/Details/reception_1.jpg", "/Details/reception_2.jpg", "/Details/reception_3.jpg"],
}

// ── Venue cards (Event Details section) ─────────────────────────────────────
// layout:
//   "separate" = two cards: ceremony (CEREMONY_VENUE) + reception (RECEPTION_VENUE)
//   "combined" = ONE card for both — use when ceremony and reception share a venue.
//                Name, address, map and photos come from CEREMONY_VENUE.
// badge        = small pill on the photo (e.g. "Ceremony & Reception")
// sectionLabel = label above the venue name (e.g. "Venue")
// showDate     = show the big Month / Day / Year
// showArrival  = show "Arrival: <guest arrival time>" (otherwise "At <time>")
const VENUE_CARDS = {
  layout: "combined" as "separate" | "combined",
  // Used when layout is "combined"
  combined: {
    badge: "Ceremony & Reception",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: true,
    // Time rows on the card, e.g. "Ceremony 4:30 PM | Reception 7:00 PM"
    ceremonyLabel: "Ceremony",
    receptionLabel: "Reception",
  },
  // Used when layout is "separate"
  ceremony: {
    show: true,
    badge: "Ceremony",
    sectionLabel: "Ceremony Venue",
    showDate: true,
    showArrival: true,
  },
  reception: {
    show: true,
    badge: "Reception",
    sectionLabel: "Reception Venue",
    showDate: false,
    showArrival: false,
  },
}

// ── RSVP & contact ──────────────────────────────────────────────────────────
const RSVP = {
  deadline: "November 1, 2026",
  coordinator: "{groom} / {bride}", // {groom} / {bride} → couple nicknames
  phone: "to be announced",
}
const HASHTAGS = ["#TheDanielleJhanrelStory"] // ⚠ check — looks like it's from a previous couple

// ── Attire guide (Event Details → Attire Guidelines) ────────────────────────
// SHOW = which cards to display AND their order, top to bottom. Examples:
//   ["guests"]                            guests only
//   ["entourage", "guests"]               entourage + guests
//   ["sponsors", "entourage", "guests"]   complete
//   ["guests", "sponsors"]                guests first, then sponsors
//   []                                    hide the whole attire guide
// Leave out a name to hide that card. Unknown or empty entries are ignored.
// Each card: fill in only what you need — anything left "" or [] is hidden.
//   image:     illustration path in /public ("" = no image; any size/shape works)
//   palette:   colors for this card — "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
//              (names show on the swatches; [] = no palette)
//   ladies / gentlemen:
//     label:     e.g. "Ninang", "Bridesmaids", "Ladies"
//     details:   the dress code text ("" hides this half of the card)
//     highlight: phrase inside details shown bold + underlined ("" for none)
const DRESS_CODE_PALETTE: AttireColor[] = [
  { name: "Pale Blue", hex: "#DDE5F0" },
  { name: "Powder Blue", hex: "#AFBED7" },
  { name: "Dusty Blue", hex: "#607CA6" },
  { name: "Classic Blue", hex: "#4F6381" },
  { name: "Deep Navy", hex: "#2F3B57" },
];



const ATTIRE = {
  show: ["guests"] as AttireGroupId[],

  sponsors: {
    title: "Principal Sponsors",
    image: "/Details/entourage.png",
    palette: [ ] as AttireColor[],

    ladies: {
      label: "Ladies",
      details:
        "Formal floor-length dresses in elegant shades of sage, olive, and deep botanical green.",
      highlight: "Formal Dresses",
    },

    gentlemen: {
      label: "Gentlemen",
      details:
        "Formal suit or dress shirt paired with tailored slacks in coordinated sage, olive, or deep green tones.",
      highlight: "Suit or Dress Shirt with Slacks",
    },
  },

  entourage: {
    title: "Entourage",
    image: "/Details/entourage.png",
    palette: [] as AttireColor[],

    ladies: {
      label: "Ladies",
      details:
        "Casual and polished outfits in coordinated shades of blue. Ladies may wear elegant maxi dresses, midi dresses, floral dresses, or semi-formal blouses paired with trousers while maintaining a cohesive and refined look.",
      highlight:
        "Casual Blue Attire • Strictly No White or Cream Dresses",
    },
    
    gentlemen: {
      label: "Gentlemen",
      details:
        "Smart casual outfits in coordinated shades of blue. Polo shirts, casual dress shirts, and tailored trousers are encouraged for a comfortable yet polished look.",
      highlight: "Smart Casual Blue Attire",
    },
  },

  guests: {
    title: "Guests",
    image: "/Details/attire-guest.png",
    palette: DRESS_CODE_PALETTE,

    ladies: {
      label: "Ladies",
      details:
        "Casual and polished outfits in coordinated shades of blue. Ladies may wear elegant maxi dresses, midi dresses, floral dresses, or semi-formal blouses paired with trousers while maintaining a cohesive and refined look.",
      highlight:
        "Casual Blue Attire • Strictly No White or Cream Dresses",
    },
    
    gentlemen: {
      label: "Gentlemen",
      details:
        "Smart casual outfits in coordinated shades of blue. Polo shirts, casual dress shirts, and tailored trousers are encouraged for a comfortable yet polished look.",
      highlight: "Smart Casual Blue Attire",
    },
  },
}

// ── Website address (used for QR codes, link previews, table finder) ────────
// NEXT_PUBLIC_SITE_URL (env) overrides this when set.
const SITE_URL = "https://jhanrel-and-danielle.weddinginvitationrsvp.com/"
// Image shown when the link is shared (Facebook, Messenger, Viber, X, …) — 1200×630 JPG in /public
const LINK_PREVIEW_IMAGE = "/Details/LinkPreviewnewone.png"

// Site address with env override applied and no trailing slash — no need to edit
export const canonicalSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "")

// ── Look & feel ─────────────────────────────────────────────────────────────
// "plain"  = no photo backgrounds anywhere (botanical cards, hides photo-only blocks)
// "photos" = photo backgrounds on the loader, envelope and closing section
const DISPLAY_MODE = "plain" as "photos" | "plain"

// ── Shared images ───────────────────────────────────────────────────────────
const BRAND = {
  monogram: "/monogram/monogram.png",
  coupleNameImage: "/Details/couple-name.png", // couple-name lettering (loader, envelope)
  seal: "/Details/seal.png", // envelope wax seal
  backgroundMusic: "/background_music/Simoy - Rob Deniel 100 Awit Para Kay Stella (Official Lyric Video).mp3",
}

// Couple photos reused across the site (gallery, loader, reminders, snap & share, closing)
const COUPLE_PHOTOS = [
  "/mobile-background/couple (1).webp",
  "/mobile-background/couple (2).webp",
  "/mobile-background/couple (3).webp",
  "/mobile-background/couple (4).webp",
  "/mobile-background/couple (5).webp",
  "/mobile-background/couple (6).webp",
  "/mobile-background/couple (7).webp",
  "/mobile-background/couple (8).webp",
  "/mobile-background/couple (9).webp",
  "/mobile-background/couple (10).webp",
]

// ── Decorations ─────────────────────────────────────────────────────────────
// Change a path here to swap it on every section at once.
// To change ONE section only, override it there, e.g. decos: { ...SECTION_DECOS, footerVine: "" }
const DECOR = {
  cornerTopLeft: "/deco/BlueWatercolor-top-left.png",
  cornerTopRight: "/deco/BlueWatercolor-top-right.png",
  cornerBottomLeft: "/deco/BlueWatercolor-bottom-left.png",
  cornerBottomRight: "/deco/BlueWatercolor-bottom-right.png",
  headerOrnament: "/deco/lovestorydeco/Blue-Water-color-top.png", // small sprig above titles
  footerVine: "/deco/lovestorydeco/Blue-Water-color-bottom.png", // long vine at section ends
  sideLeft: "/deco/lovestorydeco/Blue-Water-color-left.png", // love story side sprigs
  sideRight: "/deco/lovestorydeco/Blue-Water-color-right.png",
}

// The four corners as one set
const CORNER_DECOS = {
  topLeft: DECOR.cornerTopLeft,
  topRight: DECOR.cornerTopRight,
  bottomLeft: DECOR.cornerBottomLeft,
  bottomRight: DECOR.cornerBottomRight,
}

// Default decoration set used by most sections (corners + ornament + vine)
const SECTION_DECOS = {
  ...CORNER_DECOS,
  headerOrnament: DECOR.headerOrnament,
  footerVine: DECOR.footerVine,
}

// Handy derived values — no need to edit
const COUPLE_LABEL = `${COUPLE.groomNickname} & ${COUPLE.brideNickname}`

/* ============================================================================
   SECTIONS — wording and per-section options. Values above are referenced here.
   ============================================================================ */

export const siteConfig = {
  siteUrl: SITE_URL,
  linkPreviewImage: LINK_PREVIEW_IMAGE,
  couple: {
    ...COUPLE,
    monogram: BRAND.monogram,
    backgroundMusic: BRAND.backgroundMusic,
  },
  googleAPI:{
    messageForm: "https://docs.google.com/forms/d/e/1FAIpQLSeIZwPGkrQ5U0CwcRwwqKdCityEstGueC6gTtXp2GNawWiRyg/formResponse",   //done
    message: "https://script.google.com/macros/s/AKfycbxcvbBvXKBS6LeiQLEQHz1h_S7G15mAOqRlDhoys6LrBH9gZzQH-90oOEvnIkHhEqgG/exec",  //done
    guestList: "https://script.google.com/macros/s/AKfycbxzn9PFC1fXVKu44ZmM3f3yKI36CDUe7gCCxBzBLRY_zLwmeh5QYjaNpQk6qKlQt43g/exec",  //done
    guestRequest: "https://script.google.com/macros/s/AKfycbzV5vRL8ZwpCKGCHCbd061nsaAJT6vAk778FoZOX6_NN3an-xd7iyytdL30pQhubwny/exec",   //done
    entourage: "https://script.google.com/macros/s/AKfycbzYWoqp1I_tCul7tzTbo9AfT1_Wgp4ZfbRSKC2H9aGPfUfQr6ZwnjrtlN0S8eFNqDz_/exec",  //done
    sponsors: "https://script.google.com/macros/s/AKfycbysfxuI1sjLmvEE7QbLddHPU7O94toJpEhJJ13RrkAO8NR1gm7t-QKvVQKjshTmajH7/exec",  
////google share 
    googleShare: "https://docs.google.com/spreadsheets/d/1rXgbJnVGT-kR5bXvcM1zjLyIeB3UdZ13HxHmNQqYWHc/edit?usp=sharing",
    videoMessageForm:
      "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform", 
  },
  wedding: {
    date: WEDDING_DATE,
    time: TIMES.ceremony,
    venue: CEREMONY_VENUE.name,
    tagline: "are getting married!!!!!",
    theme: "Blue Minimalist",
    motif: "rgb(8, 8, 7), rgb(11, 11, 9), rgb(14, 14, 11), rgb(17, 17, 13), rgb(20, 20, 15)",
  },
  // Opening "Save the Date" loading screen (components/loader/LoadingScreen.tsx).
  // Couple names, wedding date and ceremony details come from couple / wedding / ceremony above.
  loadingScreen: {
    // "photos" = sliding photo background + photo date cards
    // "plain"  = no images at all: soft solid background + plain date cards
    display: DISPLAY_MODE,
    // Colors used when display is "plain"
    plainTheme: {
      background: "var(--color-welcome-bg)",
      text: "var(--color-welcome-text)",
      accent: "var(--color-welcome-gold)",
    },
    // Sliding background photos (display: "photos"); files live in /public
    backgroundPhotos: COUPLE_PHOTOS,
    headline: "Save the Date",
    // {days} is replaced with the number of days left before wedding.date
    countdownText: "{days} more days to go",
    countdownOneDayText: "1 more day to go",
    countdownTodayText: "Today is the day",
    countdownPastText: "Thank you for celebrating with us",
    coupleNameImage: BRAND.coupleNameImage,
    // Shown in the three date cards (Month / Day / Year), left to right (display: "photos")
    photos: [
      "/frontboxes/couple (1).webp",
      "/frontboxes/couple (2).webp",
      "/frontboxes/couple (3).webp",
    ],
    dateLabels: ["Month", "Day", "Year"],
    // Plain mode invitation card — classic invitation wording around the couple's names ("" to hide a line)
    plainInvite: {
      ornament: DECOR.headerOrnament,
      lineAbove: "Together with their families",
      lineBelow: "request the honour of your presence",
    },
    showCeremonyDetails: true,
    eyebrow: "You are invited",
    message: "We can't wait to celebrate with you",
    // Rotates under the progress bar while the invitation loads
    statusMessages: [
      "Gathering our favorite moments",
      "Setting the table for you",
      "Crafting your invitation experience",
    ],
    durationMs: 10000,
    // Invitation envelope (components/loader/Hero.tsx) — shares display + photos with loader above
    hintText: "Tap the Seal to Open",
    enterButtonText: "View the Invitation",
    sealImage: BRAND.seal,
    cornerDecos: { ...CORNER_DECOS },
  },
  // Love story timeline (components/sections/love-story.tsx + StorySection)
  loveStory: {
    title: "Our Love Story",
    subtitle: "Our Journey to Forever",
    closingQuote: "I have found the one whom my soul loves.",
    closingCitation: "Song of Solomon 3: 4",
    eucalyptusDecos: {
      topLeft: DECOR.sideLeft,
      bottomRight: DECOR.sideRight,
      timelineTop: DECOR.headerOrnament,
      sectionBottom: DECOR.footerVine,
    },
    chapters: [
      {
        title: "Two Strangers, One Journey",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/couples (1).webp",
        paragraphs: [
          "In 2018, what started as two strangers meeting turned into a beautiful journey neither of them expected.",
        ],
      },
      {
        title: "Growing Friendship",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: "/mobile-background/couples (2).webp",
        paragraphs: [
          "From playful conversations and {groom}'s endless teasing of {bride}, a friendship slowly grew into something deeper.",
        ],
      },
      {
        title: "A Love That Grew Stronger",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/couples (3).webp",
        paragraphs: [
          "Behind the jokes and little arguments was a love that continued to grow stronger every day.",
        ],
      },
      {
        title: "The Season of Distance",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: "/mobile-background/couples (4).webp",
        paragraphs: [
          "Then in 2024, came the season of distance. As they began their long-distance relationship, they learned that love is not measured by the miles between them, but by the choice to keep choosing each other.",
        ],
      },
      {
        title: "Calls, Prayers, and Patience",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/couples (5).webp",
        paragraphs: [
          "Through countless calls, prayers, patience, and waiting, they proved that love can overcome any distance.",
        ],
      },
      {
        title: "The Question in Taiwan",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: "/mobile-background/couples (6).webp",
        paragraphs: [
          "In 2025, in Taiwan, {groom} asked {bride} the most important question of their lives.",
        ],
      },
      {
        title: "She Said Yes",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/couples (7).webp",
        paragraphs: ["And with a heart full of love, {bride} said yes."],
      },
      {
        title: "Surrounded by Love",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: "/mobile-background/couples (8).webp",
        paragraphs: [
          "Now in 2026, surrounded by the people who mean the most to them, they begin their forever.",
        ],
      },
      {
        title: "Forever Partners",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/couples (9).webp",
        paragraphs: ["From strangers, to best friends, to forever partners."],
      },
      {
        title: "Their Greatest Adventure",
        theme: "dark" as const,
        layout: "image-right" as const,
        image: "/mobile-background/couples (10).webp",
        paragraphs: [
          "Their greatest adventure begins — a lifetime of love, chosen again and again, no matter the distance.",
        ],
      },
      {
        title: "Ready to Say I Do",
        theme: "light" as const,
        layout: "image-left" as const,
        image: "/mobile-background/couples (11).webp",
        paragraphs: [
          "From two strangers meeting in 2018, through years of teasing, laughter, distance, and prayer, to a yes in Taiwan — {groom} and {bride} are ready to say \"I do.\"",
          "Join us as we begin forever.",
        ],
      },
    ],
  },
  // Gallery section (components/sections/gallery.tsx)
  gallery: {
    eyebrow: "Our Moments",
    title: "Gallery",
    subtitle: "our favorite moments",
    description:
      "From our first chapter to this beautiful season of commitment — every moment has been a testament to love, faith, and grace.",
    footnote:
      "More pictures will be added as we gather the rest of our favorite moments. Please check back — this gallery is still growing.",
    buttonText: "View Full Gallery",
    buttonHref: "/gallery",
    decos: { ...SECTION_DECOS },
    // Uses COUPLE_PHOTOS; replace with your own list if the gallery should differ
    images: COUPLE_PHOTOS.map((image) => ({ image, text: "" })),
  },
  // Event details section (components/sections/details.tsx)
  // Venue names, addresses, dates, times, maps and venue photos come from ceremony / reception below.
  // In reminder text, {guestsTime} and {ceremonyTime} are replaced from ceremony below.
  eventDetails: {
    eyebrow: "Our Celebration",
    title: "Event Details",
    subtitle: "our special day",
    description: "Everything you need to know about our special day.",
    decos: { ...SECTION_DECOS },
    // Venue cards layout:
    //   "separate" = one card each for ceremony and reception (uses ceremony / reception below)
    //   "combined" = ONE card for both — use when ceremony and reception share a venue.
    //                Venue name, address, map and photos come from CEREMONY_VENUE;
    //                the card lists both times (ceremony.time + reception.time).
    // Set in QUICK SETUP → VENUE_CARDS
    venues: VENUE_CARDS,
    labels: {
      arrival: "Arrival",
      at: "At",
      scanForDirections: "Scan for directions",
      getDirections: "Get Directions",
      copyAddress: "Copy Address",
      copied: "Copied!",
    },
    // Cards, colors, images and which groups show → QUICK SETUP → ATTIRE
    attire: {
      title: "Attire Guidelines",
description: "Please dress according to the guidelines below.",

// Shown above a card's palette
paletteTitle: "Dress Code Palette",
paletteSubtitle: "Casual Attire in Shades of Blue",

colorGuideTitle: "Color Guide",
colorGuideNote: "Please refer to the exact shades of blue below for the dress code.",

// Order and visibility come from ATTIRE.show
// (skips blanks, typos and repeats)
      groups: ATTIRE.show
        .filter((id, i, list) => ["sponsors", "entourage", "guests"].includes(id) && list.indexOf(id) === i)
        .map((id) => ({ id, ...ATTIRE[id] })),
      // Shared dress code palette (used by the "Strictly Formal" reminder)
      palette: DRESS_CODE_PALETTE,
    },
    reminders: {
      title: "Gentle Reminders",
      description: "A few thoughtful notes to help everyone enjoy our celebration.",
      images: COUPLE_PHOTOS.slice(0, 4),
      // showPalette: shows the dress code palette after the first paragraph
      items: [
        {
          title: "No Kids",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "While we adore your little ones, we've chosen to make our wedding an adults-only celebration. We hope you can enjoy a fun night out with us!",
          ],
        },
        {
          title: "Plus Ones",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Due to limited space, we're only able to accommodate the guests specifically named on your invitation. Thank you for understanding.",
          ],
        },
        {
          title: "Unplugged Ceremony",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "We invite you to be fully present with us during our ceremony. Please silence and put away phones and cameras—we promise our photographer has it covered!",
          ],
        },
        {
          title: "Dress Code",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "We can't wait to see everyone dressed up! We simply ask that shades of white, ivory and cream be saved for the bride.",
          ],
        },
        {
          title: "Arrival",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Our ceremony will begin promptly at {ceremonyTime}. We recommend arriving 20–30 minutes early so you have plenty of time to park, find your seat and get settled before we say \"I do\"!",
          ],
        },
      ],
    },
  },
  // Wedding day timeline (components/sections/wedding-timeline.tsx)
  weddingTimeline: {
    kicker: "Join us as we tie the knot!",
    title: "Timeline",
    subtitle: "our wedding day",
    description:
      "From the first arrival to the last farewell, here is how we will spend this day together.",
    quote: "At the right time, I, the Lord, will make it happen.",
    quoteCitation: "Isaiah 60:22",
    // Optional corner decorations — leave "" to hide
    decos: {
      topLeft: "",
      topRight: "",
      bottomLeft: "",
      bottomRight: "",
    },
    // Each event — shown top to bottom in this order (move a block to reorder):
    //   show:     true = display on the site, false = hide it (still kept here to edit later)
    //   time:     TIMES.* values come from QUICK SETUP; others are typed in directly
    //   location: text shown under the title; {ceremony} / {reception} are replaced
    //             with ceremony.location / reception.location ("" to hide)
    //   image:    line-art illustration from /public/weddingtimeline; "" to use the icon instead
    //   icon:     fallback icon when there is no image —
    //             "arrival" | "rings" | "departure" | "cocktail" | "fireworks" | "dance"
    //   description: optional extra line ("" to hide)
    // ⚠ check — 5:30 PM onward are placeholder times; set them to the real program.
    events: [
      {
        show: true,
        time: TIMES.entourageCall,
        title: "Entourage Assembly",
        description: "",
        location: "{ceremony}",
        image: "/weddingtimeline/assemble.png",
        icon: "arrival" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.guestArrival,
        title: "Guest Arrival",
        description: "",
        location: "{ceremony}",
        image: "/weddingtimeline/arrivalimage.png",
        icon: "arrival" as TimelineIconName,
      },
      {
        show: false, // spare arrival illustration
        time: TIMES.guestArrival,
        title: "Arrival",
        description: "",
        location: "{ceremony}",
        image: "/weddingtimeline/arrival.png",
        icon: "arrival" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.ceremony,
        title: "Wedding Ceremony",
        description: "",
        location: "{ceremony}",
        image: "/weddingtimeline/WeddingCeremony.png",
        icon: "rings" as TimelineIconName,
      },
      {
        show: true,
        time: "5:30 PM",
        title: "Photo Session",
        description: "",
        location: "{ceremony}",
        image: "/weddingtimeline/PhotoSession.png",
        icon: "rings" as TimelineIconName,
      },
      {
        show: true,
        time: "6:00 PM",
        title: "Cocktail Hour",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/CockTailHour.png",
        icon: "cocktail" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.reception,
        title: "Reception Program",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/reception welcom.png",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "7:30 PM",
        title: "Dinner Service",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/DinnerService.png",
        icon: "cocktail" as TimelineIconName,
      },
      {
        show: true,
        time: "8:30 PM",
        title: "Cake Cutting",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/cakecutting.png",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: true,
        time: "9:00 PM",
        title: "First Dance & Party",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/dance.png",
        icon: "dance" as TimelineIconName,
      },
      {
        show: true,
        time: "10:00 PM",
        title: "Send-Off",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/SendOff.png",
        icon: "departure" as TimelineIconName,
      },
    ],
  },
  // Wedding entourage (components/sections/entourage.tsx)
  // Names and roles come from the Google Sheet (googleAPI.entourage); couple names from couple above.
  entourage: {
    eyebrow: "Our People",
    title: "Wedding Entourage",
    subtitle: "standing with us",
    description: "Honoring those who stand with us on our special day",
    coupleKicker: "Together as one",
    coupleLine: "The beginning of our forever",
    coupleHeading: "The Couple",
    groomRole: "Groom",
    brideRole: "Bride",
    loadingText: "Loading entourage...",
    retryingText: "Still gathering the wedding party. Trying again...",
    errorText: "Unable to load entourage",
    retryText: "Try again",
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
    // Rename any heading shown in the entourage card: "Heading as shown": "Your text"
    headingLabels: {
      "Parents of the Groom": "Parents of the Groom",
      "Parents of the Bride": "Parents of the Bride",
      "Principal Sponsors": "Principal Sponsors",
      "Peer Sponsors": "Peer Sponsors",
      "Family of the Groom": "Family of the Groom",
      "Family of the Bride": "Family of the Bride",
      "Man of Honor": "Man of Honor",
      "Best Man": "Best Man",
      "Maid of Honor": "Maid of Honor",
      "Matron of Honor": "Matron of Honor",
      "Little Groom": "Little Groom",
      "Little Bride": "Little Bride",
      "Flower Girls": "Flower Girls",
      "Beloved Entourage": "Beloved Entourage",
      "To light our path": "To light our path",
      "To Cloth us as one": "To Cloth us as one",
      "To bind us together": "To bind us together",
    } as Record<string, string>,
  },
  // RSVP / guest list (components/sections/guest-list.tsx) — card, search, RSVP form and all modals.
  // Placeholders in curly braces are filled in automatically: {name}, {count}, {n}.
  // The RSVP deadline itself comes from details.rsvp.deadline.
  rsvp: {
    headerOrnament: DECOR.headerOrnament, // "" to hide
    title: "RSVP",
    script: "Are you going",
    intro: "Kindly confirm your attendance so we may prepare a place for you at our celebration.",
    deadlineLabel: "RSVP Deadline",
    openButton: "Tap here to respond",
    search: {
      title: "RSVP",
      script: "Find your Name",
      placeholder: "Begin with your first name",
      loading: "Preparing the guest list. We'll keep trying until names appear.",
      refine: "Keep typing to refine results",
      notFoundTitle: "Not finding your name?",
      notFoundText: "We'd love to have you with us. Send a request to join the celebration.",
      requestButton: "Request to Join",
    },
    invite: {
      title: "You are Invited",
      scriptFallback: "to our celebration",
      greeting: "Hello {name}, you are invited to our wedding!",
      seats: "We've reserved {count} for you.",
      seatSingular: "seat",
      seatPlural: "seats",
    },
    responded: {
      title: "Thank You for Responding!",
      text: "We've received your RSVP and look forward to celebrating with you!",
      attending: "You're Attending!",
      declined: "Unable to Attend",
      guestCountLabel: "Number of Guests",
      closeButton: "Close",
    },
    form: {
      attendLabel: "Can you attend? *",
      yes: "Yes!",
      no: "Sorry, No",
      companionsLabel: "Who's Coming With You?",
      companionsHint: "Please provide names and relationships for your {count} additional {guests}",
      guestSingular: "guest",
      guestPlural: "guests",
      companionTitle: "Guest {n}",
      companionNameLabel: "Full Name",
      companionNamePlaceholder: "Name of guest {n}",
      relationshipLabel: "Relationship with {name}",
      relationshipFallbackName: "Primary Guest",
      relationshipPlaceholder: "e.g., Spouse, Friend, Child, Parent",
      // One-tap relationship choices shown under the relationship field
      relationshipOptions: ["Spouse", "Partner", "Child", "Parent", "Sibling", "Friend"],
      companionProgress: "Guest {n} of {total}",
      companionsAdded: "{done} of {total} added",
      prevButton: "Back",
      nextButton: "Next guest",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "09XX XXX XXXX",
      phoneNote: "For wedding updates only. Your number stays private and will never be shown to other guests.",
      submitting: "Submitting...",
      submit: "Submit RSVP",
    },
    phoneAlert: {
      title: "A phone number is needed",
      paragraphs: [
        "We ask for your number so we can reach you with important updates — seating, timing, or anything you may need on the day.",
        "Your number will not appear on this invitation, and it will not be shared with other guests. It is kept private and used only by us and our coordinators to take care of you.",
      ],
      button: "Add my number",
    },
    success: {
      title: "RSVP Confirmed",
      attending: "We're thrilled you'll be joining us — your spot is saved!",
      declined: "We'll miss you, but thank you for letting us know.",
      neutral: "Thank you for your response!",
      messagePrompt:
        "Before you go, leave a message for the couple — your words will be a cherished memory they can always look back on.",
      messageButton: "Leave a Message",
      laterButton: "Maybe later — close",
    },
    request: {
      title: "Request",
      script: "to join us",
      greetingNamed: "Hi {name} — want to celebrate with us? Send a request!",
      greeting: "Want to celebrate with us? Send a request!",
      optional: "(Optional)",
      nameLabel: "Full Name *",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+63 912 345 6789",
      guestsLabel: "Number of Guests *",
      guestsPlaceholder: "How many guests?",
      messageLabel: "Message",
      messagePlaceholder: "Share why you'd like to join...",
      submitting: "Submitting...",
      submit: "Send Request",
      sentTitle: "Request Sent!",
      sentText: "We've received your request",
      sentSubtext: "We'll review it and get back to you soon",
      autoClose: "This will close automatically",
    },
    messages: {
      thankYou: "Thank you for your response!",
      requestSubmitted: "Request submitted! We'll review and get back to you.",
      loadFailed: "Failed to load guest list",
      selectAttendance: "Please select if you can attend",
      nameRequired: "Name is required",
      requestFailed: "Failed to submit request. Please try again.",
      submitFailed: "We couldn't save your RSVP. Please check your connection and try again.",
    },
  },
  // Messages wall (components/sections/message-wall-display.tsx)
  // Small decorations on each message card — leave "" to hide
  messageWall: {
    cardDecos: {
      topRight: DECOR.cornerTopRight, // sprig tucked in the card's top-right corner
      bottomLeft: "", // e.g. DECOR.cornerBottomLeft (sits behind the text — keep it subtle)
    },
  },
  // Book of guests (components/sections/book-of-guests.tsx) — confirmed guests come from the guest list API.
  bookOfGuests: {
    title: "Book of Guests",
    subtitle: "celebrating with us",
    description:
      "Meet the cherished souls joining us in celebration — your presence makes our day truly special.",
    statsEyebrow: "Our Celebration",
    guestSingular: "Guest",
    guestPlural: "Guests",
    statsCaption: "Celebrating With Us",
    rsvpSingular: "RSVP",
    rsvpPlural: "RSVPs",
    partySingular: "Party",
    partyPlural: "Parties",
    thankYou: "Thank you for confirming your RSVP — your presence means the world to us.",
    updatedLabel: "Updated",
    refreshLabel: "Refresh guest counts",
    listEyebrow: "Joining Us",
    listDescription: "A glimpse of the wonderful guests celebrating with us",
    vipLabel: "VIP",
    noTable: "No Table Yet",
    companionsLabel: "With Them",
    // Shown when a guest has more than 4 companions
    companionsMore: "+{count} more",
    companionsLess: "Show less",
    confirmedLabel: "Confirmed",
    emptyTitle: "Guest list updating",
    emptyText: "Confirmed guests will appear here as RSVPs come in.",
    // How many guest cards show at once (rotates every few seconds when there are more)
    cardsPerView: 4,
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
  },
  // FAQ (components/sections/faq.tsx)
  // In answers you can use:
  //   {deadline}      → details.rsvp.deadline
  //   {coordinator}   → details.rsvp.coordinator
  //   {contact}       → " at <phone>" when details.rsvp.phone is set (empty while "to be announced")
  //   {ceremonyTime}  → ceremony.time
  //   [link text](#section-id) → a link that smoothly scrolls to that section
  //   A blank line (\n\n) starts a new paragraph; lines starting with "• " show as a bulleted list
  faq: {
    eyebrow: "A Few Notes",
    title: "Frequently Asked Questions",
    subtitle: "everything you need to know",
    description:
      "Helpful notes so you can simply arrive, celebrate, and enjoy this new chapter with us.",
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
    items: [
      {
        question: "How do I RSVP?",
        answer:
          "Please RSVP using the [guest list](#guest-list) on this invitation: search for your name and confirm your attendance.\n\nPlease respond by {deadline}.\n\nIf you have questions, please contact {coordinator}{contact}.",
      },
      {
        question: 'Do we really need to RSVP? We already said "Yes" to the couple.',
        answer:
          "Yes, please. We will be needing your formal RSVP to consolidate guest details and finalize the headcount for catering and seating purposes.",
      },
      {
        question: "May we choose our own seats at the reception?",
        answer:
          "We kindly ask that you take the place reserved for you. Each seat has been arranged with care so everyone may be comfortably seated with those we hoped you would share the evening with.",
      },
      {
        question: 'Can I bring a "Plus One" to the event?',
        answer:
          "Due to limited space, we're only able to accommodate the guests specifically named on your invitation. Thank you for understanding.",
      },
      {
        question: "Can I bring my child to the event?",
        answer:
          "While we adore your little ones, we've chosen to make our wedding an adults-only celebration. We hope you can enjoy a fun night out with us!",
      },
      {
        question: "Is the ceremony unplugged?",
        answer:
          "We invite you to be fully present with us during our ceremony. Please silence and put away phones and cameras—we promise our photographer has it covered!",
      },
      {
        question: "What should I wear?",
        answer:
          "We can't wait to see everyone dressed up! We simply ask that shades of white, ivory and cream be saved for the bride.\n\nPlease see the [attire guide](#details) above for our full dress code and color palette.",
      },
      {
        question: "What time should I arrive?",
        answer:
          "Our ceremony will begin promptly at {ceremonyTime}. We recommend arriving 20–30 minutes early so you have plenty of time to park, find your seat and get settled before we say \"I do\"!",
      },
      {
        question:
          'I said "No" to the RSVP but I had a change of plans—I can attend now! What should I do?',
        answer:
          "Please check with us first as we have a strict guest list. If seats become available, we will let you know as soon as possible. Please do not attend unannounced, as we may not have any available seats for you.",
      },
      {
        question: "What if I RSVP'd but cannot attend?",
        answer:
          "We would love to have you at our wedding, but we understand that there are circumstances beyond our control. However, please let us know as soon as possible so we can reallocate your seat/s.",
      },
      {
        question: "Is there parking available?",
        answer:
          "Yes, parking is available at the venue. We recommend arriving 20–30 minutes before {ceremonyTime} so you have time to park, find your seat, and get settled.",
      },
      {
        question: "Can I take photos or videos during the reception?",
        answer:
          "Yes. We would love for you to capture the joy throughout the reception. We prepared this celebration wholeheartedly and we want everyone to enjoy it fully.",
      },
      {
        question: "When would it be most thoughtful to take our leave?",
        answer:
          "It would mean so much if you could stay with us through the end of the program. We have prepared the evening with love, and we hope you will laugh, take photos, and celebrate until the night draws to a close.",
      },
      {
        question: "What if I have dietary restrictions or allergies?",
        answer:
          "Please let us know about any dietary restrictions or allergies when you RSVP. We want to ensure everyone can enjoy the celebration comfortably.",
      },
      {
        question: "How can I help the couple have a great time during their wedding?",
        answer:
          "• Pray with us for favorable weather and the continuous blessings of our Lord as we enter this new chapter of our lives as husband and wife.\n• RSVP as soon as your schedule is cleared.\n• Dress according to the attire guide and color palette.\n• Arrive on time.\n• Follow the seating arrangement at the reception.\n• Stay until the end of the program.\n• Join the activities and enjoy!",
      },
    ],
  },
  // Gift guide (components/sections/registry.tsx). The signature uses couple.groomNickname / brideNickname.
  registry: {
    eyebrow: "A Token of Love",
    title: "Gift Guide",
    subtitle: "with gratitude",
    description: "Your presence on our wedding day is the best gift we could ask for.",
    paragraphs: [
      "Should you wish to bless us with a gift, we would be grateful for a monetary gift as we begin this new chapter together.",
      "However, if you prefer to purchase a gift, please feel free to surprise us in your own special way.",
    ],
    thankYou: "Thank you from the bottom of our hearts.",
    signOff: "With love,",
    // Colors — any CSS color or a palette token from app/globals.css (e.g. "var(--color-motif-accent)")
    colors: {
      title: "var(--color-welcome-navy)",          // "Gift Guide", account names
      script: "var(--color-welcome-script)",       // "with gratitude", couple signature
      eyebrow: "var(--color-motif-accent)",        // small caps labels, icons
      body: "var(--color-welcome-text)",           // paragraphs
      soft: "var(--color-welcome-text-soft)",      // "With love," and secondary text
      card: "var(--color-welcome-bg-soft)",        // letter card (top of gradient)
      cardEdge: "var(--color-motif-cream)",        // letter card (bottom of gradient)
      accountCard: "var(--color-motif-soft)",      // e-gift account cards
      button: "var(--color-motif-deep)",           // gift icon, copied state
      line: "var(--color-motif-medium)",           // dividers
      glow: "var(--color-motif-silver)",           // soft glows / copy pill
      background: "var(--color-motif-cream)",      // section background
    },
    // E-gift accounts — optional, as many as you like.
    //   showAccounts: false hides the whole block
    //   show:  false hides one account
    //   qr:    "/QR/BPI.png" to show a QR image, or "" when you have no QR (card shows name + number only)
    //   accountNumber: shown under the name (display only)
    //   With 2+ visible accounts, guests switch between them with tabs
    showAccounts: true,
    accountsTitle: "For e-gifts",
    accounts: [
      { show: true, label: "BDO", accountName: "Jhanrel", accountNumber: "***********9172", qr: "/QR/BDO.png" },
      { show: false, label: "MariBank", accountName: "", accountNumber: "", qr: "" },
      { show: true, label: "LandBank", accountName: "Jhanrel Ballocanag", accountNumber: "xxxxxxx7434", qr: "/QR/LandBank.png" },
    ] as { show: boolean; label: string; accountName: string; accountNumber: string; qr: string }[],
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
  },
  // Table finder page (/table — components/table-finder.tsx)
  tableFinder: {
    decos: { ...CORNER_DECOS },
    // "Find Your Table" QR card on the dashboard (components/table-finder-qr-card.tsx)
    // {couple} → "Groom & Bride" nicknames. "" hides a line or image.
    qrCard: {
      coupleNameImage: BRAND.coupleNameImage, // couple-name lettering; "" shows the names as text
      coupleImage: "Details/couple.png", // couple illustration beside the text
      eyebrow: "The wedding of",
      title: "Find Your Table",
      script: "please be seated",
      description:
        "Place this code at the entrance. Guests scan it, search their name, and go straight to their table.",
      scanLabel: "Scan to find your table",
      buttonText: "Download QR",
      downloadNote: "Saves a print-ready PNG for signs and table cards.",
      previewText: "Preview seating page",
    },
  },
  // Entourage proposal pages (components/proposal-page.tsx)
  // Text placeholders: {name} = invitee, {role} = role title, {groom} / {bride} = nicknames.
  // Each invitation type has its own wording:
  //   party      → Best Man, Maid/Matron of Honor, Bridesmaid, Groomsman, Little Bride, secondary sponsors
  //   sponsor    → Principal Sponsors (Ninong / Ninang)
  //   bearer     → Ring / Coin / Bible / Herald Bearer
  //   flowerGirl → Flower Girl
  // A list ([...]) shows one paragraph per line; "" or [] hides that part.
  proposal: {
    decos: { ...CORNER_DECOS },
    coupleNameImage: BRAND.coupleNameImage, // couple-name lettering at the top of the card; "" shows text names
    coupleImage: "/Details/couple.png", // couple illustration above the question
    ornament: DECOR.headerOrnament, // small sprig at the top of the card; "" to hide
    // Eucalyptus sprigs on either side of the couple name; "" to hide one
    nameDecos: { left: DECOR.sideLeft, right: DECOR.sideRight },
    showDate: true, // big date under the couple name (Month / Day / Day-number / Time / Year)
    // Use "Maid of Honor" for unmarried, "Matron of Honor" for married
    honorAttendant: "Matron of Honor" as "Matron of Honor" | "Maid of Honor",
    roles: proposalRoleDefinitions,
    roleIdAliases: proposalRoleIdAliases,
    // Shared labels used on every invitation
    labels: {
      headerEyebrow: "A Personal Invitation",
      headerScript: "from our hearts to yours",
      saveTheDate: "Save the Date",
      roleOffered: "Role offered",
      preparedFor: "Prepared for",
      askQuestion: "Will you be our",
      registeredName: "Registered name",
      returnButton: "Return to Wedding Page",
      saving: "Saving...",
      sending: "Sending...",
      sendButton: "Send Response",
      goBack: "Go Back",
      saveError: "We couldn't save your response. Please try again.",
      // Shown when the invite link has no name and the guest says yes
      nameForm: {
        title: "You Said Yes",
        script: "we're so happy",
        subheader: "One quick detail",
        body: "We couldn't be happier to have you by our side! Please confirm the name you'd like on our invitation and guest lists.",
        label: "Your Preferred Name",
        placeholder: "e.g. Aunt Maria Clara / Mr. James Bond",
        required: "Please type your preferred name so we can add it to our invitation.",
        submit: "Submit Response",
        cancel: "Cancel",
      },
    },
    copy: {
      party: {
        greeting: "Dear",
        intro: [
          "We have some wonderful news that we would love to share with you.",
          "We are happy and excited to announce that we are getting married and will be beginning a new chapter of our lives together.",
        ],
        body: [
          "But this isn't just a save-the-date. This is a personal ask, especially meant for you.",
          "As we imagine our wedding day, we find ourselves thinking about the people we would want beside us as we celebrate one of the biggest moments of our lives.",
          "You are someone we would genuinely love to have there — not just as a guest, but as someone who will stand beside us, celebrate with us, laugh with us, and share in the memories we will carry for years to come.",
        ],
        askLead: "So, with all our hearts, we would like to ask you",
        askNote:
          "We know that being part of the wedding party comes with time, effort, and a little bit of responsibility. More than anything, we hope it will be a chance for us to celebrate this beautiful moment together.",
        yesButton: "Yes, I'd Love To!",
        noButton: "No, With Love & Warm Wishes",
        signOff: "With love,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "We couldn't be happier",
          roleLine: "Standing as our {role}",
          body: [
            "Thank you for being willing to share this special moment with us. We can't wait to celebrate, laugh, make memories, and experience this beautiful day together. Having you beside us will make our wedding day even more special. Let's make some unforgettable memories together!",
          ],
          signOff: "With love,",
        },
        no: {
          title: "Thank You",
          script: "for responding",
          subheader: "We completely understand",
          body: [
            "Thank you for taking the time to consider being part of our wedding party. Please know that there are absolutely no hard feelings. Whether you're standing beside us or cheering for us from wherever you are, we will always be grateful to have you in our lives.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Your message has reached us",
          body: [
            "We hope you'll still celebrate this beautiful day with us in your own way. Your love and warmest wishes mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      sponsor: {
        greeting: "Dear",
        intro: [
          "We have some wonderful news that we would love to share with you.",
          "We are happy and excited to announce that we are getting married and will be beginning a new chapter of our lives together.",
        ],
        body: [
          "This is not a general invitation. This is a personal ask, especially meant for you.",
          "As we prepare for our wedding, we find ourselves thinking about the people we would be grateful to have by our side on one of the most meaningful days of our lives.",
          "For us, having a {role} is more than simply being part of the wedding ceremony. It means having someone we respect, someone whose experiences we can learn from, and someone whose wisdom and blessings we would be grateful to have as we build our life together.",
        ],
        askLead: "With great respect and sincerity, we would like to ask you a very special question:",
        askNote: "Having you share this moment with us would truly make our wedding more meaningful.",
        yesButton: "Yes, I'd Be Honored 🤍",
        noButton: "No, With Love & Warm Wishes",
        signOff: "With love and respect,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "Thank you for saying yes!",
          roleLine: "Our {role}",
          body: [
            "We are truly happy and honored to have you accept this special role in our wedding. Your support means a lot to us, and we look forward to celebrating this beautiful day with you and creating a memory we can cherish for years to come. Thank you for being part of this special moment.",
          ],
          signOff: "With love and heartfelt gratitude,",
        },
        no: {
          title: "Thank You",
          script: "for responding",
          subheader: "We completely understand and respect your decision",
          body: [
            "Thank you for taking the time to read our letter and consider our request. We sincerely appreciate your kindness and the thought you have given to our invitation. There are no hard feelings at all. We are simply grateful to have shared this moment with you and to have you celebrate our happiness in your own way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Your message has reached us",
          body: [
            "We are simply grateful to have shared this moment with you. Your love and warmest wishes mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      bearer: {
        greeting: "Hi",
        intro: [
          "We have a very special day coming up, and we would love for you to be part of it! 🤍",
          "{groom} & {bride} are getting married!",
        ],
        body: [
          "Our wedding day is a very important moment for us, and we would love to have you take part in making it even more special.",
        ],
        askLead: "So we have a very important question for you:",
        askNote: "We would be so happy to have you walk down the aisle and carry this special part of our wedding ceremony.",
        yesButton: "Yes, I'd Love To! 🤍",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We are so excited to have you on our team!",
          roleLine: "Our {role}",
          body: [
            "We are so excited to have you as our {role}! We can't wait to see you walk down the aisle and be part of our special day. Your little role will be a very special part of our wedding, and we hope you have lots of fun celebrating with us! See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "We completely understand 😊",
          body: [
            "Thank you for considering being our {role}. We hope you know that you are special to us, and we'll be happy to have you celebrate our wedding with us in any way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Thank you for letting us know",
          body: ["We hope you know how special you are to us, and we look forward to celebrating with you."],
          signOff: "With lots of love,",
        },
      },
      flowerGirl: {
        greeting: "Hi",
        intro: [
          "We have a very special day coming up, and we would love for you to be part of it! 🤍",
          "{groom} & {bride} are getting married!",
        ],
        body: [
          "Our wedding day wouldn't be complete without some extra sweetness, smiles, and a little bit of magic.",
        ],
        askLead: "And we have a very special role we would love for you to have.",
        askNote: "We would love to have you walk down the aisle and help make our wedding day even more beautiful and memorable.",
        yesButton: "Yes, I'd Love To! 🌸",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We are so happy to have you as our Flower Girl!",
          roleLine: "Our {role}",
          body: [
            "We can't wait to see you walk down the aisle and be part of our special day. We hope you have lots of fun, smile big, and enjoy every moment! We can't wait to see you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "We completely understand 😊",
          body: [
            "Thank you for taking the time to consider being our Flower Girl. Whether you're able to be part of our wedding or not, we hope you know how special you are to us. We'll still be very happy to celebrate our special day with you!",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "successfully",
          subheader: "Thank you for letting us know",
          body: ["We hope you know how special you are to us, and we look forward to celebrating with you."],
          signOff: "With lots of love,",
        },
      },
    },
  },
  details: {
    rsvp: { ...RSVP },
  },
  contact: {
    bridePhone: "to be announced",
    groomPhone: "to be announced",
    email: "to be announced",
  },
  // giftRegistry: {
  //   QR_1:{
  //   id: "BPI",
  //   src: "/QR/BPI.png",
  //   label: "BPI",
  //   accountNumber: "KAMS : ***********569",
  //   },
  //   QR_2:{
  //   id: "MariBank",
  //   src: "/QR/MariBank.png",
  //   label: "MariBank",
  //   accountNumber: "****7672",
  //   }
  //   ,
  //   QR_3:{
  //   id: "Gcash",
  //   src: "/QR/pleaseProvideQR.png",
  //   label: "Gcash",
  //   accountNumber: "to be announced",
  //   }
  // },
  // Built from QUICK SETUP — edit the values at the top of the file
  ceremony: {
    location: CEREMONY_VENUE.name,
    venue: CEREMONY_VENUE.address,
    map: CEREMONY_VENUE.map,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.ceremony,
    entourageTime: TIMES.entourageCall,
    guestsTime: TIMES.guestArrival,
    image: CEREMONY_VENUE.photos,
  },
  reception: {
    location: RECEPTION_VENUE.name,
    venue: RECEPTION_VENUE.address,
    map: RECEPTION_VENUE.map,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.reception,
    image: RECEPTION_VENUE.photos,
  },
  dressCode: {
    theme: "Blue Minimalist",
    sponsors: {
      title: "Sponsors",
      ninang: {
        label: "Ninang",
        description: "Long gown in the shade of silver gray.",
        image: "/Details/Ninang.png",
        palette: ["#D8D3CD", "#C0C0C0", "#A9A9A9", "#969090", "#8C8686"],
      },
      ninong: {
        label: "Ninong",
        description: "Barong Tagalog and black slacks.",
        image: "/Details/Ninong.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    entourage: {
      title: "Entourage",
      bridesmaid: {
        label: "Bridesmaids",
        description: "Long gown that suits our color motif.",
        image: "/Details/bridesmaid.png",
        palette: ["#B4A3D4", "#C8A2C8"],
      },
      groomsmen: {
        label: "Groomsmen",
        description: "Long sleeve Barong Tagalog and black slacks.",
        image: "/Details/Groomsmen.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    guests: {
      title: "Guests",
      label: "Guests",
      description: "Casual attire: Whimsical Spring.",
      image: "/Details/Guest.png",
      palette: ["#FFCA8B", "#FFB383", "#F6CEC8", "#E99997", "#C8C29E"],
    },
    paletteNote:
      "Our theme is Whimsical Spring Minimalist. Entourage: women, a flowy spring sage green dress, strictly floor length; gentlemen, a black and white suit, a white and gray suit, or sage green long sleeves with gray or brown pants — strictly no rubber shoes. Guests: casual attire, Whimsical Spring.",
    closing:
      "Thank you for helping us bring our wedding vision to life. We can't wait to celebrate with you!",
    note: "We kindly request our guests to dress in attire following our Whimsical Spring Minimalist palette.",
  },
  narratives: {
    ourStory: `Once upon a signature…

Our story began with a simple signature, one that slowly turned into something magical. He was my financial advisor, and I was there to sign documents. It was July 5, 2021, and we met at the Lobby of the building. Little did we know, that ordinary day would start a story neither of us expected.

I wasn't looking for anything, yet somehow, our connection grew in its own gentle, unexpected way. And then, on June 1, 2022, our story truly began—we became us. We found a love that feels like home.

Our journey wasn't rushed, but perfectly timed. We believe that God brought us together in His own way and season.

With hearts full of gratitude, we step into this new chapter hand in hand, trusting His plan and celebrating a love rooted in faith, patience, and grace.

Today, we choose each other- again and again- and we can't wait to celebrate this new chapter with the people we love most.`,
    groom: `The first time Mark saw Catherine, time seemed to slow down. It was an ordinary day that instantly became unforgettable: one smile, one hello, and suddenly his world had a new center. He didn't have the perfect words ready, but he knew he had met someone who felt like home.

Early conversations turned into late-night talks, sharing dreams, favorite meals, and whispered prayers for a future together. With every small adventure—coffee runs, long drives, quiet walks—Mark found himself choosing her over and over again. He loved how she laughed freely, how she listened with her whole heart, and how her faith steadied him.

There were seasons of distance and long workdays, but every reunion reminded him why he stayed patient: because Catherine was worth every mile and every minute apart. When he finally knelt to ask for her hand, it wasn't a question of "if," only "when can we start forever?"`,
    bride: `Catherine remembers the first time Mark said her name. It was gentle but sure, a kindness that made her feel both seen and safe. In that softness, she found a partner who met her with the same grace she prayed to give.

Mark's steadiness won her heart: the way he showed up, even when schedules were tight, and how he always found lightness in the small things. He celebrated her wins, held space for her worries, and never hesitated to choose "us" in every decision.

Now, as they prepare to say yes before God and the people they love most, Catherine is grateful for the patience, humor, and hope Mark brings to every day. She knows this next chapter is just the start of the love story they get to write together.`,
  },
  colors: {
    primary: "#87AE73",
    secondary: "#F5F5DC",
  },
  // Wedding playlist (components/sections/wedding-playlist.tsx). {couple} → "Groom & Bride" nicknames.
  playlist: {
    eyebrow: "Our Soundtrack",
    title: "A Playlist from our hearts",
    script: "songs of our love",
    subtitle: "Songs that have been part of our journey together",
    // Shown on the playlist card
    cardEyebrow: "Spotify Playlist",
    playlistName: `${COUPLE_LABEL} Wedding`,
    cardNote: "Press play and listen along — every song holds a little piece of our story.",
    buttonText: "Open in Spotify",
    // Leave any path "" to hide that decoration
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
    embedUrl:
    //https://open.spotify.com/embed/playlist/2kBlhGzzNIYxbn9WOqavnj?utm_source=generator&si=4550d9101c2c4cce
      "https://open.spotify.com/embed/playlist/2kBlhGzzNIYxbn9WOqavnj?utm_source=generator&si=4550d9101c2c4cce",
    spotifyUrl: "https://open.spotify.com/playlist/2kBlhGzzNIYxbn9WOqavnj",
  },
  // Closing "See you there!" section (components/sections/see-you-there.tsx).
  //   photos mode (loadingScreen.display "photos") → full-screen couple photo
  //   plain mode  (loadingScreen.display "plain")  → botanical card, no photo
  // {couple} → "Groom & Bride" nicknames.
  seeYouThere: {
    titleLine1: "See you",
    titleLine2: "there!",
    // Photos mode
    photo: COUPLE_PHOTOS[4],
    photoAlt: "{couple}",
    // Plain mode
    plain: {
      eyebrow: "Until we meet",
      script: "with love, {couple}",
      message: "We can't wait to celebrate this beautiful day with you.",
      decos: { ...CORNER_DECOS, footerVine: DECOR.footerVine },
    },
  },
  // Footer (components/sections/footer.tsx).
  // {couple} → "Groom & Bride" nicknames, {year} → current year. Date comes from ceremony, deadline from details.rsvp.
  footer: {
    showMonogram: true, // couple.monogram, tinted to the motif
    dateLabel: "Wedding Date",
    // Ceremony & reception at a glance (times and places come from ceremony / reception)
    summary: {
      show: true,
      ceremonyLabel: "Ceremony",
      receptionLabel: "Reception",
    },
    noteTitle: "A Note From Us",
    // Typed out one after another
    quotes: [
      '"I have found the one whom my soul loves." – Song of Solomon 3:4',
      "Welcome to our wedding website! We've found a love that's a true blessing, and we give thanks to God for writing the beautiful story of our journey together.",
      "Thank you for your love, prayers, and support. We can't wait to celebrate this joyful day together!",
    ],
    rsvp: {
      show: true,
      title: "RSVP Deadline",
      label: "Please respond by",
      note: "Please confirm your attendance by this date.",
      button: "Tap here to respond",
      href: "#guest-list",
    },
    // Social links — replace each href with your own profile link.
    //   show: false hides one; platforms: facebook | instagram | tiktok | youtube | twitter | threads | messenger | email
    //   email: use "mailto:you@example.com"; messenger: use "https://m.me/yourpage"
    followTitle: "Follow Us",
    followNote: "Share your photos and tag us — we'd love to see the day through your eyes.",
    socials: [
      { show: true, platform: "facebook", href: "https://www.facebook.com" },
      { show: true, platform: "instagram", href: "https://www.instagram.com/" },
      { show: true, platform: "tiktok", href: "https://www.tiktok.com/" },
      { show: true, platform: "youtube", href: "https://www.youtube.com" },
      { show: true, platform: "twitter", href: "https://x.com/" },
      { show: false, platform: "threads", href: "https://www.threads.net/" },
      { show: false, platform: "messenger", href: "https://m.me/" },
      { show: false, platform: "email", href: "mailto:" },
    ] as {
      show: boolean
      platform: "facebook" | "instagram" | "tiktok" | "youtube" | "twitter" | "threads" | "messenger" | "email"
      href: string
    }[],
    quickLinksTitle: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "Event Details", href: "#details" },
      { label: "RSVP", href: "#guest-list" },
      { label: "Gallery", href: "#gallery" },
      { label: "Messages", href: "#messages" },
      { label: "FAQ", href: "#faq" },
    ],
    copyright: "© {year} {couple} — crafted with love, prayers, and gratitude.",
    tagline: "This celebration site was designed to share our story and joy with you.",
    credit: {
      show: true,
      developedBy: "Developed by",
      developerName: "Lance Valle",
      developerUrl: "https://lance28-beep.github.io/portfolio-website/",
      promoText: "Want a website like this? Visit",
      promoName: "Wedding Invitation Naga",
      promoUrl: "https://www.facebook.com/WeddingInvitationNaga",
    },
    // Leave any path "" to hide that decoration
    decos: { ...CORNER_DECOS, headerOrnament: DECOR.headerOrnament },
  },
  // Snap & Share (components/sections/snap-share.tsx). {couple} → "Groom & Bride" nicknames.
  snapShare: {
    googleDriveLink:
      "https://drive.google.com/drive/folders/1FMl3t_llWIM28G17vtvUD_LmbWeeKb3W?usp=sharing",
    albumQR: "/QR/AlbumQR.png",
    hashtag: HASHTAGS,
    instructions: "Please scan this QR Code and upload the photos and videos you have taken during our wedding reception. We are delighted to see your snaps too!",
    title: "Snap and Share",
    subtitle: "Share your memories",
    description:
      "Help us remember the little moments of {couple}'s day — every smile, embrace, and candid laugh. Your photos and clips complete our love story.",
    // "Our Favorite Moments" photo card — always hidden when loadingScreen.display is "plain"
    moments: {
      show: true,
      title: "Our Favorite Moments",
      caption: "Share your snapshots to be featured in our keepsake gallery.",
      // 3 photos: two squares on top, one wide photo below
      images: COUPLE_PHOTOS.slice(0, 3),
    },
    website: {
      show: true,
      title: "Share Our Wedding Website",
      description:
        "Spread the word about {couple}'s celebration. Share this QR code so friends and family can join us.",
      downloadButton: "Download QR",
      note: "Scan with any camera app to open the full invitation and schedule.",
    },
    hashtags: {
      show: true,
      title: "Wedding Hashtags",
      copy: "Copy",
      copied: "Copied",
      copyAll: "Copy All",
      allCopied: "All Copied!",
    },
    social: {
      show: true,
      title: "Share on Social Media",
      description: "Help spread the word about {couple}'s wedding across your favorite platforms.",
      // Remove any you don't want: "instagram" | "facebook" | "tiktok" | "twitter"
      platforms: ["instagram", "facebook", "tiktok", "twitter"] as ("instagram" | "facebook" | "tiktok" | "twitter")[],
      shareText: "Celebrate {couple}'s wedding! Explore the details and share your special memories:",
    },
    // Shown only when googleDriveLink is set
    upload: {
      badge: "Upload Your Photos & Videos",
      scanNote: "Scan with your camera app",
      copyLink: "Copy Link",
      copied: "Copied!",
      downloadQr: "Download QR",
      uploadButton: "Upload Photos",
    },
    closing:
      "Thank you for helping make {couple}'s wedding celebration memorable. Your photos and messages create beautiful memories we will treasure for a lifetime.",
    closingTag: "Thank you for sharing the joy",
  },
  accommodation: {
    coordinator: {
      name: RSVP.coordinator,
      phone: RSVP.phone,
    },
    hotels: [
      {
        name: "La Luna Resort",
        discount: "Offered 20% discount for early booking",
        facebook: "https://www.facebook.com/lalunabeachresortofficial",
      },
      {
        name: "GOSAM Beach Resort",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100083461714073",
      },
      {
        name: "Calicoan Villa",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/CalicoanVilla",
      },
      {
        name: "G Camp Beachfront",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100085772194096",
      },
      {
        name: "Punta Viajero Beach Resort",
        discount: "Offered 15% discount",
        phone: "0932 214 6408",
        facebook: "https://www.facebook.com/puntoviajeroresort",
      },
      { name: "Balay Sunset" },
      { name: "Balay Pacifico" },
      { name: "Casa Nala" },
      { name: "The Grey Inn" },
    ],
    carRentals: [
      {
        name: "Apex Car Rental Tacloban",
        facebook: "https://www.facebook.com/profile.php?id=61574882327115",
      },
      {
        name: "Cassey Wheels Car Rental",
        facebook: "https://www.facebook.com/search/top?q=casseywheels%20car%20rental",
      },
    ],
  },
}
