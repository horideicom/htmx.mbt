///|
/// Swap styles for DOM updates
pub enum SwapStyle {
  InnerHTML
  OuterHTML
  BeforeBegin
  AfterBegin
  BeforeEnd
  AfterEnd
  Delete
  Morph
  None
}

///|
/// Parse swap style from string
pub fn SwapStyle::parse(value : String) -> SwapStyle {
  match value {
    "innerHTML" => InnerHTML
    "outerHTML" => OuterHTML
    "beforebegin" => BeforeBegin
    "afterbegin" => AfterBegin
    "beforeend" => BeforeEnd
    "afterend" => AfterEnd
    "delete" => Delete
    "none" => None
    "morph" => Morph
    _ => InnerHTML // default
  }
}

///|
/// Get position string for insertAdjacentHTML
fn SwapStyle::to_position(self : SwapStyle) -> String? {
  match self {
    BeforeBegin => Some("beforebegin")
    AfterBegin => Some("afterbegin")
    BeforeEnd => Some("beforeend")
    AfterEnd => Some("afterend")
    _ => Option::None
  }
}

///|
/// Perform DOM swap operation
pub fn swap(target : @dom.Element, content : String, style : SwapStyle) -> Unit {
  match style {
    InnerHTML => target.setInnerHTML(content)
    OuterHTML => target.setOuterHTML(content)
    Morph => morph(target, content)
    Delete => target.remove()
    None => ()
    _ =>
      match style.to_position() {
        Some(pos) => target.insertAdjacentHTML(pos, content)
        None => () // Should not happen for remaining cases
      }
  }
}
