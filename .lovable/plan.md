## Goal
Recolor the uploaded Rhythm Raga logo to match the site's purple + gold palette, keeping the exact typography, layout, Devanagari characters, and "School of Music and Arts" tagline intact.

## Approach

1. **Recolor the logo via image edit** (not regenerate) so the letterforms, spacing, and structure stay identical to the original.
   - Input: `user-uploads://WhatsApp_Image_2026-06-29_at_17.04.47.jpeg`
   - Output: `src/assets/logo-rhythmraga.png` (transparent background)
   - Palette: deep purple background (`#5B2EFF` / matches `--primary`) with warm gold wordmark (`--gold`) and clean white tagline — mirrors the site's hero gradient.
   - Preserve: "Rhytthm" latin script + "राग" Devanagari + "School of Music and Arts" tagline, exact letter shapes and proportions.

2. **Wire the logo into the Navbar** (`src/components/landing/Navbar.tsx`)
   - Replace the current "R" square badge + text lockup with the new logo image.
   - Height ~36–40px on mobile, ~44px on desktop; keeps existing anchor to `#top`.
   - Alt text: "Rhythm Raga — School of Music and Arts".

3. **Also use it in the Footer** (`src/components/landing/Footer.tsx`) so branding is consistent (same asset, larger size, on dark background).

4. **Favicon**: leave existing `/favicon.ico` unchanged for this pass (out of scope — logo review only).

## Technical Notes
- Use `imagegen--edit_image` with `transparent_background: true` so the logo drops cleanly onto both the light navbar and dark footer.
- Import as a normal image asset (`import logo from "@/assets/logo-rhythmraga.png"`) — no lovable-assets externalization needed.
- No changes to color tokens, layout, or copy elsewhere.
