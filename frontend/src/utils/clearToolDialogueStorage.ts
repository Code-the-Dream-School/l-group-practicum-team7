export function clearToolDialogueStorage() {
  Object.keys(localStorage)
    .filter(
      (key) =>
        key === 'unlockedTools' ||
        key === 'dialogueState_v1' ||
        key === 'seenNodes' ||
        key.startsWith('tool:') ||
        key.startsWith('pulsemind:')
    )
    .forEach((key) => localStorage.removeItem(key));
}