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

- Crocs offer upgrades use `src/lib/crocs-selection.ts` to preserve the first model and size and append only the second pair; catalog prices remain the checkout source of truth.
- Business-rule tests live beside catalog helpers and run with `bun test` to validate prices and selection serialization without adding a test dependency.
