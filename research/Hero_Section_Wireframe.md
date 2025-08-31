# Smart Voice AI - Hero Section Wireframe

## Hero Section Layout (Magic UI Startup Template)

```
+----------------------------------------------------------------------+
|                                                                      |
| [LOGO]             [Nav Link] [Nav Link] [Nav Link] [CTA Button]     |
|                                                                      |
+----------------------------------------------------------------------+
|                                                                      |
|                                                                      |
|   +---------------------------+       +-------------------------+    |
|   |                           |       |                         |    |
|   |   HEADLINE TEXT           |       |                         |    |
|   |   (Problem-focused)       |       |                         |    |
|   |                           |       |     HERO IMAGE/VIDEO    |    |
|   |   Sub-headline Text       |       |     (Attorney visual    |    |
|   |   (Solution + benefit)    |       |      with AI element)   |    |
|   |                           |       |                         |    |
|   |   [CTA BUTTON]            |       |                         |    |
|   |                           |       |                         |    |
|   +---------------------------+       +-------------------------+    |
|                                                                      |
|   "Trusted by 100+ Law Firms" (Social Proof Snippet)                 |
|                                                                      |
+----------------------------------------------------------------------+
```

## Detailed Component Specifications

### Header Section (Persistent across page)
- **Height**: 80px
- **Background**: White
- **Logo**:
  - Position: Left-aligned
  - Size: 150px wide
  - Format: SVG with proper scaling
- **Navigation**:
  - Position: Center-right
  - Items: Features, Pricing, Testimonials, Contact
  - Typography: Montserrat, 0.9rem, 500 weight
  - Spacing: 32px between items
- **Primary CTA**:
  - Position: Far right
  - Size: 120px x 40px
  - Text: "Get Started"
  - Colors: Accent Orange background (#FF8C00), White text (#FFFFFF)
  - Border-radius: 4px
  - Microinteraction: Scale to 103% on hover, subtle shadow increase

### Hero Section
- **Height**: 85vh (minimum 650px)
- **Layout**: Split 50/50 between content and visual
- **Background**: Light gradient from Light Grey (#F7FAFC) to White (#FFFFFF)
- **Optional Accent**: Subtle pattern or shape in Vibrant Teal at 5% opacity

### Content Column (Left)
- **Width**: 50% (full width on mobile)
- **Padding**: 10% on left and right sides
- **Headline**:
  - Text: "Drowning in Calls, Not Cases? Reclaim Your Practice with AI Employees."
  - Typography: Montserrat, 3.8rem (60px), 700 weight, 1.1 line height
  - Color: Deep Blue (#1A202C)
  - Microinteraction: Subtle text reveal animation on page load
- **Sub-headline**:
  - Text: "Automate client intake, scheduling, and phone support with voice AI, designed for personal injury attorneys."
  - Typography: Open Sans, 1.15rem (18.4px), 400 weight, 1.6 line height
  - Color: Dark Grey (#4A5568)
  - Spacing: 24px margin-top from Headline
- **Secondary CTA**:
  - Size: 200px x 50px
  - Text: "See How It Works"
  - Colors: Accent Orange background (#FF8C00), White text (#FFFFFF)
  - Border-radius: 4px
  - Typography: Montserrat, 1rem, 600 weight, uppercase, 0.05em letter spacing
  - Spacing: 32px margin-top from Sub-headline
  - Microinteraction: More pronounced animation than header CTA, slight bounce on hover
- **Social Proof Snippet**:
  - Position: Below CTA, 24px margin-top
  - Text: "Trusted by 100+ Law Firms"
  - Typography: Open Sans, 0.9rem (14.4px), 500 weight, italics
  - Optional: Small trust icons/logos
  - Spacing: 16px margin-top from CTA

### Visual Column (Right)
- **Width**: 50% (hidden on mobile, replaced with simplified visual)
- **Content**: Professional image or short video (max 15 seconds)
- **Description**:
  - If Image: Attorney looking overwhelmed at desk transitioning to relaxed with visual AI element
  - If Video: Short animation showing transformation from chaos to order with AI assistance
- **Format**: 
  - Image: WebP with JPG fallback, properly sized and compressed
  - Video: MP4 with WebM fallback, autoplay, muted, loop
- **Border**: None, or subtle shadow for depth
- **Microinteraction**: Smooth fade-in or subtle slide-up animation on page load

## Responsive Behavior

### Desktop (1200px+)
- Layout as described above
- Full animation effects

### Tablet (768px - 1199px)
- Content and visual columns remain side-by-side
- Typography scaled down:
  - Headline: 3rem (48px)
  - Sub-headline: 1rem (16px)
- Reduced padding to 6%

### Mobile (< 767px)
- Single column layout
- Content column on top (100% width)
- Visual simplified and reduced to 40% of screen height
- Typography scaled down:
  - Headline: 2.5rem (40px)
  - Sub-headline: 1rem (16px)
- CTA button expanded to full width
- Navigation collapses to hamburger menu

## Microinteractions Details

1. **Headline Animation**
   - Type: Split text reveal
   - Timing: 800ms, staggered by word
   - Easing: cubic-bezier(0.33, 1, 0.68, 1)
   - Trigger: On page load, after 200ms delay

2. **Image/Video Entrance Animation**
   - Type: Fade-in with slight upward movement
   - Distance: 20px vertical shift
   - Timing: 1000ms
   - Easing: cubic-bezier(0.16, 1, 0.3, 1)
   - Trigger: On page load, after headline animation completes

3. **CTA Button Animation**
   - Type: Pulse or slight bounce
   - Scale: 103% > 100% > 102% > 100%
   - Timing: 1200ms
   - Easing: cubic-bezier(0.34, 1.56, 0.64, 1)
   - Trigger: After image/video animation, repeats once then stops

4. **Social Proof Reveal**
   - Type: Fade-in
   - Timing: 600ms
   - Easing: ease-out
   - Trigger: After all other animations complete

## Implementation Notes

- Preload hero image/video to prevent layout shifts
- Consider reducing or disabling animations for users with prefers-reduced-motion setting
- Ensure all text remains readable when placed over any background variation
- Test the hero section's loading performance and optimize if it exceeds 1.5s LCP
- Consider implementing a skeleton loading state for slower connections
