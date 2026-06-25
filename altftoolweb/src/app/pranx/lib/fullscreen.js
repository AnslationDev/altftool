export function openFullscreen(ref) {
  if (ref.current?.requestFullscreen) ref.current.requestFullscreen();
}
