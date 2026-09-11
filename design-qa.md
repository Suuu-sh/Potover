# Login — single-screen reference adaptation

final result: passed

Target: user-supplied note login screenshot, adapted to Potover rather than copied verbatim.
Central form, editorial line-art people on both sides, no login-page footer. Existing shared header and email authentication retained; no unsupported social login buttons added.

Verification: in-app browser desktop 1366×768 (document height 768), smaller laptop 1280×650 (document height 650), mobile 390×844. Both desktop checks require no vertical scroll. Light and dark captured. Source and implementation viewed in the same comparison output; reference has extra outside framing and a taller social-auth form, intentionally not reproduced. Initial trailing-slash route incorrectly retained footer; fixed and rechecked document height.

Typography and spacing: product fonts, compact labels, centered 400px panel and 48px minimum controls. Colors: Kiro semantic tokens. Image quality: custom black/white poker learners, center intentionally empty; no placeholder art. Dark uses inversion/screen blending. Mobile hides decorative artwork to prioritize form. Content/auth behavior retained. No remaining scoped P0/P1/P2 issues. Extreme zoom or unusually short windows may scroll intentionally to preserve accessibility.

Asset: public/login/poker-learners.png, built-in imagegen. Prompt: wide black-and-white editorial line illustration on clean white background, adult poker learners on left/right studying strategy notebook and discussing cards/chips, central 40% blank, no words/UI/logos, 3:1 composition.
TypeScript and 16 unit tests passed before final route-only correction; final TypeScript check repeated. No real authentication submission performed.
