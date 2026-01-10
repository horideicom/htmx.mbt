///|
/// History API integration for htmx

///|
/// Push a new URL to the browser history
pub fn push_url(url : String) -> Unit {
  let win = @dom.window()
  let history = win.history()

  // Create state object (can be used for restoring state later)
  // For now just null/empty
  let state = @core.null()

  // Title is explicitly ignored by most browsers, passing empty string
  let title = ""
  history.pushState(state, title, url~)
}

///|
/// Replace current URL in browser history
pub fn replace_url(url : String) -> Unit {
  let win = @dom.window()
  let history = win.history()
  let state = @core.null()
  history.replaceState(state, "", url~)
}
