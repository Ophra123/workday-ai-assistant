<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- AI calls go through Lovable AI Gateway on the server only: one-shot tools use `createServerFn` in `src/lib/ai.functions.ts`, chat streams from the `/api/chat` server route; helpers live in `src/lib/ai/*.server.ts`. Why: keeps `LOVABLE_API_KEY` and prompts out of the browser.
- Prompts and input limits live in `src/lib/ai/prompts.ts`; validation schemas in `src/lib/ai/schemas.ts` (covered by `src/test/ai-rules.test.ts`). Why: one place to change tool behavior, shared by server and tests.
- Chat history is a single conversation stored in browser localStorage, loaded in `useEffect`. Why: no database/Cloud by user requirement; avoids hydration mismatch.
- The app is dark-only; the palette lives in `:root` in `src/styles.css`. Why: single premium dark theme, no toggle.
