import { defineConfig, defineSchema } from "tinacms";

export default defineConfig({
  // ---------------------------------------------------------------------------
  // TinaCMS connection — update clientId & token after creating a Tina Cloud
  // project at https://app.tina.io
  // ---------------------------------------------------------------------------
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main",

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },

  // ---------------------------------------------------------------------------
  // SCHEMA — every collection maps to a content section on the site
  // ---------------------------------------------------------------------------
  schema: {
    collections: [

      // -----------------------------------------------------------------------
      // SITE SETTINGS — global info used across header, footer, CTAs
      // -----------------------------------------------------------------------
      {
        name: "settings",
        label: "Site Settings",
        path: "content/settings",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          // Only one settings document
          global: true,
        },
        fields: [
          {
            type: "string",
            name: "businessName",
            label: "Business Name",
            required: true,
          },
          {
            type: "string",
            name: "tagline",
            label: "Tagline",
          },
          {
            type: "string",
            name: "phone",
            label: "Phone Number",
            description: "e.g. (306) 852-7969",
          },
          {
            type: "string",
            name: "address",
            label: "Street Address",
          },
          {
            type: "string",
            name: "city",
            label: "City, Province, Postal Code",
          },
          {
            type: "string",
            name: "janeAppUrl",
            label: "Jane App Booking URL",
          },
          {
            type: "string",
            name: "instagramUrl",
            label: "Instagram URL",
          },
          {
            type: "string",
            name: "facebookUrl",
            label: "Facebook URL",
          },
          {
            type: "string",
            name: "googleReviewScore",
            label: "Google Review Score",
            description: "e.g. 5.0",
          },
          {
            type: "string",
            name: "googleReviewCount",
            label: "Google Review Count",
            description: "e.g. 26",
          },
        ],
      },

      // -----------------------------------------------------------------------
      // HOME PAGE — hero, about, booking CTA
      // -----------------------------------------------------------------------
      {
        name: "homepage",
        label: "Home Page",
        path: "content/homepage",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          global: true,
        },
        fields: [
          // ── Hero ──────────────────────────────────────────────────────────
          {
            type: "object",
            name: "hero",
            label: "Hero Section",
            fields: [
              {
                type: "string",
                name: "headingLine1",
                label: "Heading Line 1",
                description: "e.g. Heal. Restore.",
              },
              {
                type: "string",
                name: "headingLine2",
                label: "Heading Line 2 (italic brown)",
                description: "e.g. Be Relieved.",
              },
              {
                type: "string",
                name: "subtext",
                label: "Subtext",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "string",
                name: "ctaPrimaryLabel",
                label: "Primary CTA Label",
                description: "e.g. Book Online",
              },
              {
                type: "string",
                name: "ctaSecondaryLabel",
                label: "Secondary CTA Label",
                description: "e.g. Call or Text: (306) 852-7969",
              },
              {
                type: "image",
                name: "heroImage",
                label: "Hero Image (right side)",
              },
            ],
          },

          // ── About ─────────────────────────────────────────────────────────
          {
            type: "object",
            name: "about",
            label: "About / Meet Your Therapist",
            fields: [
              {
                type: "string",
                name: "therapistName",
                label: "Therapist Name",
                description: "e.g. Chloe Jackson-Kotko",
              },
              {
                type: "string",
                name: "therapistNameItalic",
                label: "Italic portion of name",
                description: "The part shown in italic brown — e.g. Jackson-Kotko",
              },
              {
                type: "string",
                name: "bio",
                label: "Bio",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "image",
                name: "photo",
                label: "Therapist Photo",
              },
              {
                type: "string",
                name: "credentials",
                label: "Credentials",
                description: "e.g. Registered Massage Therapist (RMT) · Manual Osteopathic Therapist",
              },
              {
                type: "string",
                name: "location",
                label: "Location",
              },
              {
                type: "string",
                name: "contactNote",
                label: "Contact Note",
                description: "e.g. Texting gets the fastest response!",
              },
            ],
          },

          // ── Booking CTA ───────────────────────────────────────────────────
          {
            type: "object",
            name: "bookingCta",
            label: "Booking CTA Section",
            fields: [
              {
                type: "string",
                name: "heading",
                label: "Heading",
              },
              {
                type: "string",
                name: "headingItalic",
                label: "Italic portion of heading",
              },
              {
                type: "string",
                name: "subtext",
                label: "Subtext",
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
        ],
      },

      // -----------------------------------------------------------------------
      // SERVICES — each service card (massage, osteopathy, cupping, etc.)
      // -----------------------------------------------------------------------
      {
        name: "services",
        label: "Services",
        path: "content/services",
        format: "json",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) =>
              `${values?.title?.toLowerCase().replace(/ /g, "-") ?? "service"}`,
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Service Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "image",
            label: "Service Image",
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured (highlighted card)",
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
          },
          {
            type: "string",
            name: "icon",
            label: "Emoji Icon",
            description: "e.g. 🙌 ⚡ ⭕",
          },
        ],
      },

      // -----------------------------------------------------------------------
      // WHAT IS MANUAL OSTEOPATHY — explainer section
      // -----------------------------------------------------------------------
      {
        name: "osteopathy",
        label: "Manual Osteopathy Section",
        path: "content/osteopathy",
        format: "json",
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          global: true,
        },
        fields: [
          {
            type: "string",
            name: "sectionLabel",
            label: "Section Label",
            description: "Small uppercase label above heading — e.g. Education",
          },
          {
            type: "string",
            name: "heading",
            label: "Heading",
          },
          {
            type: "string",
            name: "headingItalic",
            label: "Italic portion of heading",
          },
          {
            type: "rich-text",
            name: "paragraph1",
            label: "Paragraph 1",
          },
          {
            type: "rich-text",
            name: "paragraph2",
            label: "Paragraph 2",
          },
          {
            type: "object",
            name: "features",
            label: "Feature Tiles",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title }),
            },
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
              },
              {
                type: "string",
                name: "description",
                label: "Description",
              },
            ],
          },
          {
            type: "image",
            name: "mainImage",
            label: "Main Image (large)",
          },
          {
            type: "image",
            name: "overlayImage",
            label: "Overlay Image (small, bottom-left)",
          },
          {
            type: "string",
            name: "ctaLabel",
            label: "CTA Button Label",
          },
        ],
      },

      // -----------------------------------------------------------------------
      // TRAINING & EDUCATION — certifications / courses
      // -----------------------------------------------------------------------
      {
        name: "training",
        label: "Training & Education",
        path: "content/training",
        format: "json",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) =>
              `${values?.title?.toLowerCase().replace(/ /g, "-") ?? "course"}`,
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Course / Qualification Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "institution",
            label: "Institution / Provider",
          },
          {
            type: "string",
            name: "dateCompleted",
            label: "Date Completed",
            description: "e.g. November 2024",
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "image",
            name: "image",
            label: "Certificate / Course Image",
          },
          {
            type: "string",
            name: "badgeLabel",
            label: "Badge Label",
            description: "e.g. ✓ Registered RMT",
          },
          {
            type: "string",
            name: "icon",
            label: "Emoji Icon",
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
          },
        ],
      },

      // -----------------------------------------------------------------------
      // REVIEWS — client testimonials
      // -----------------------------------------------------------------------
      {
        name: "reviews",
        label: "Client Reviews",
        path: "content/reviews",
        format: "json",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) =>
              `${values?.reviewerName?.toLowerCase().replace(/ /g, "-") ?? "review"}`,
          },
        },
        fields: [
          {
            type: "string",
            name: "reviewerName",
            label: "Reviewer Name",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "reviewText",
            label: "Review Text",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "platform",
            label: "Platform",
            description: "e.g. Google Review",
            options: ["Google Review", "Facebook Review", "Direct"],
          },
          {
            type: "number",
            name: "rating",
            label: "Star Rating (1–5)",
          },
          {
            type: "boolean",
            name: "featured",
            label: "Show on homepage",
          },
          {
            type: "number",
            name: "order",
            label: "Display Order",
          },
        ],
      },
    ],
  },
});
