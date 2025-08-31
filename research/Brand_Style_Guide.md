# Smart Voice AI - Brand Style Guide

## Color Palette

### Primary Colors

- **Deep Blue:** #1A202C (rgb(26, 32, 44))
  - Usage: Main headings, navigation bar background, footer background
  - Represents: Professionalism, trust, and sophistication
  - Accessibility note: Provides excellent contrast with white text (WCAG AAA compliant)

- **Vibrant Teal:** #00CED1 (rgb(0, 206, 209))
  - Usage: Accent elements, important UI elements, highlights
  - Represents: Innovation, clarity, and efficiency
  - Accessibility note: Requires dark text for readability

### Secondary Colors

- **Soft Grey:** #E2E8F0 (rgb(226, 232, 240))
  - Usage: Backgrounds, subtle accents, dividers
  - Promotes: Clean aesthetic, visual separation

- **Accent Orange:** #FF8C00 (rgb(255, 140, 0))
  - Usage: CTAs, important highlights, attention-grabbing elements
  - Conveys: Energy, urgency, and action
  - Note: Reserve primarily for CTA buttons and critical highlights

### Neutral Colors

- **Dark Grey:** #4A5568 (rgb(74, 85, 104))
  - Usage: Secondary text, subtle shadows, less prominent elements
  - Balance: Provides visual hierarchy without the harshness of pure black

- **Light Grey:** #F7FAFC (rgb(247, 250, 252))
  - Usage: Backgrounds, cards, spacious layouts
  - Benefit: Creates breathing room and improves readability

- **White:** #FFFFFF
  - Usage: Primary backgrounds, text on dark backgrounds
  - Purpose: Maximizes contrast and readability

## Color Application Guidelines

- Maintain a 60-30-10 ratio: 60% neutrals, 30% primary colors, 10% accent colors
- Always ensure text maintains a minimum contrast ratio of 4.5:1 for accessibility
- Use the Accent Orange sparingly to maintain its impact for CTAs
- Gradients can combine Deep Blue and Vibrant Teal for dynamic backgrounds

## Typography

### Headings: 'Montserrat', sans-serif

- **H1: Main Page Headings**
  - Weight: 700 (Bold)
  - Size: 3.8rem (60px) 
  - Line height: 1.1
  - Letter spacing: -0.02em

- **H2: Section Headings**
  - Weight: 700 (Bold)
  - Size: 2.8rem (45px)
  - Line height: 1.2
  - Letter spacing: -0.01em

- **H3: Subsection Headings**
  - Weight: 600 (Semibold)
  - Size: 2.0rem (32px)
  - Line height: 1.3
  - Letter spacing: normal

- **H4: Minor Headings**
  - Weight: 600 (Semibold)
  - Size: 1.6rem (26px)
  - Line height: 1.4
  - Letter spacing: normal

### Body Text: 'Open Sans', sans-serif

- **Main Content**
  - Weight: 400 (Regular)
  - Size: 1.15rem (18.4px)
  - Line height: 1.6
  - Letter spacing: normal

- **Secondary Content**
  - Weight: 400 (Regular)
  - Size: 1.0rem (16px)
  - Line height: 1.6
  - Letter spacing: normal

- **Emphasis/Highlighted Text**
  - Weight: 500 (Medium)
  - Same size as respective context
  - Consider using Vibrant Teal color for additional emphasis

### Button Text

- **Primary CTA Buttons**
  - Font: 'Montserrat', sans-serif
  - Weight: 600 (Semibold)
  - Size: 1.0rem (16px)
  - Letter spacing: 0.05em
  - Text transform: Uppercase

- **Secondary Buttons**
  - Font: 'Montserrat', sans-serif
  - Weight: 500 (Medium)
  - Size: 0.9rem (14.4px)
  - Letter spacing: 0.03em

## Typography Implementation Notes

- Font loading optimization: Preload critical font weights
- Include fallback system fonts: 
  - Montserrat → Arial, Helvetica, sans-serif
  - Open Sans → Segoe UI, Roboto, sans-serif
- For mobile, consider reducing heading sizes by 20% across all breakpoints
- Maintain a consistent typographic scale ratio of 1.2

## Logo Specifications

- **Size Requirements**
  - Minimum size: 150px wide for desktop, 120px for mobile
  - Clear space: Maintain padding equal to 1/4 of the logo height on all sides
  - Header placement: Maximum height of 60px, positioned in top left

- **Logo Variations**
  - Primary: Full color logo on white/light backgrounds
  - Reversed: White logo for dark backgrounds
  - Monochrome: Deep Blue version for special applications

## Imagery Style Guide

- **Photography Direction**
  - Style: Professional, clean, optimistic
  - Subject matter: Attorneys in professional but approachable environments
  - Treatment: Subtle desaturation with a slight blue tone
  - Composition: Should include negative space for text overlay where needed

- **Icon System**
  - Style: Outlined with 2px stroke, rounded corners
  - Colors: Deep Blue as primary, Vibrant Teal for highlights
  - Size: 32px standard display size (provide 64px masters)
  - Format: SVG for optimal scaling and loading

- **UI Graphics & Illustrations**
  - Style: Abstract, clean, modern with subtle gradients
  - Colors: Primarily using the established color palette
  - Animation: Subtle, purposeful, enhancing understanding
  - Format: SVG or WebP for optimal performance

- **Image Ratios**
  - Hero banners: 16:9
  - Feature images: 4:3
  - Testimonial avatars: 1:1 (circle crop)
  - Process diagrams: 16:9 or 3:1 horizontal flow

## Microinteraction Guidelines

- **Hover States**
  - Buttons: Scale to 103%, subtle shadow increase
  - Nav links: 2px bottom border appears (Vibrant Teal)
  - Cards: Elevation increase of 2px, slight scale to 102%

- **Click/Tap States**
  - Buttons: Scale to 98%, shadow decrease
  - Interactive elements: 5ms color darken, then return

- **Page Transitions**
  - Section reveals: Subtle fade-in (300ms) with 20px Y-axis shift
  - Content loading: Skeleton screens instead of spinners
  - Form submission: Progress animation with checkmark confirmation

## Accessibility Considerations

- All interactive elements must have visible focus states
- Color is never the sole indicator of meaning
- Text resizing supports up to 200% without loss of content
- Animations can be disabled via prefers-reduced-motion media query
- All interactive elements maintain minimum touch target size of 44px x 44px

## Implementation Notes

This style guide should be implemented as a comprehensive design system with reusable components. All specified values should be stored as CSS variables for consistent application and easier updates. A component library should be developed first, then applied consistently across the landing page.
