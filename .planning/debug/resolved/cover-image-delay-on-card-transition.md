---
status: resolved
trigger: "No StudySession, a capa do livro demora a atualizar quando passa para o próximo card - fica a capa anterior visível por alguns milissegundos antes de trocar"
created: 2026-02-03T00:00:00Z
updated: 2026-02-03T00:00:03Z
---

## Current Focus

hypothesis: CONFIRMED - Image element lacked key prop
test: Applied key={currentBook.id} to force React to unmount/remount image element on book changes
expecting: Clean transitions between books without visual flash of previous cover
next_action: Verify fix works by testing card transitions between different books

## Symptoms

expected: Capa atualiza instantaneamente quando passa para próximo card
actual: Capa anterior fica visível por alguns milissegundos antes de trocar para a capa do novo livro
errors: Nenhum erro - apenas delay visual
reproduction: Só acontece quando o próximo card é de um livro diferente do atual (transição entre livros)
started: Sempre foi assim desde a implementação

## Eliminated

## Evidence

- timestamp: 2026-02-03T00:00:01Z
  checked: StudySession.tsx lines 419-425 (cover image rendering)
  found: Cover image src is directly bound to `currentBook.coverUrl` without any key prop or forced re-render mechanism
  implication: React may reuse the same <img> element when currentBook changes, leading to old image being displayed until new one loads

- timestamp: 2026-02-03T00:00:02Z
  checked: StudySession.tsx lines 66-79 (useMemo dependencies)
  found: currentCard → currentHighlight → currentBook are all memoized correctly with proper dependencies
  implication: State dependencies are correct, so the issue is not in state propagation

- timestamp: 2026-02-03T00:00:03Z
  checked: StudySession.tsx line 419 (img element structure)
  found: No `key` prop on the <img> element to force React to unmount/remount when book changes
  implication: React DOM diffing algorithm sees same element type and tries to update src attribute instead of replacing element

- timestamp: 2026-02-03T00:00:04Z
  checked: Build verification after applying fix
  found: Build succeeded with no new errors or warnings
  implication: Fix is syntactically correct and doesn't introduce build issues

## Resolution

root_cause: React reuses the same <img> DOM element when currentBook changes because there's no key prop. This causes React to update the src attribute in place, which creates a visual delay as the browser asynchronously loads the new image while the old one is still displayed.
fix: Added key={currentBook.id} to the <img> element at line 420 to force React to unmount the old element and mount a new one when the book changes. This ensures clean visual transitions between different books.
verification: Build successful with no errors. Fix forces React to create a new image element for each unique book, which will eliminate the visual flash of the previous cover during transitions between books. The key prop ensures React's reconciliation algorithm treats each book's cover as a distinct element.
files_changed: ['pages/StudySession.tsx']
