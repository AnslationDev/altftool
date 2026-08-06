// BOPS routes are non-transactional interface demonstrations. The shared demo
// guard also disables the rendered control, while this no-op keeps a direct
// programmatic invocation from opening a dialler.
export function useActionPopup() {
  const trigger = () => {};

  const Popup = () => null;

  return { trigger, Popup };
}
