///|
/// Response processing for htmx (parsing, OOB, hx-select)

///|
/// Process HTTP response content
/// - Parses HTML
/// - Handles Out-Of-Band swaps (hx-swap-oob)
/// - Handles hx-select filtering
/// - Returns final content to be swapped into target
pub fn process_response(content : String, select : String?) -> String {
  // 1. Parse content into a temporary container
  let doc = @dom.document()
  let temp_div = doc.createElement("div")
  temp_div.setInnerHTML(content)

  // 2. Handle Out-Of-Band swaps
  process_oob_swaps(temp_div)

  // 3. Handle hx-select filtering
  match select {
    Some(selector) =>
      match temp_div.querySelector(selector) {
        Some(selected_el) => get_outer_html(selected_el)
        None =>
          // If selector matches nothing, return empty or full?
          // htmx default behavior is to do nothing or return empty if selector fails
          ""
      }
    None => get_inner_html(temp_div)
  }
}

///|
/// Process Out-Of-Band swaps
/// Finds elements with hx-swap-oob and swaps them into the main DOM
fn process_oob_swaps(container : @dom.Element) -> Unit {
  let oob_elements = container.querySelectorAll("[hx-swap-oob]")
  for el in oob_elements {
    let oob_val = el.getAttribute("hx-swap-oob").unwrap_or("true")
    match el.getAttribute("id") {
      Some(id) =>
        // Find target in main document
        match @dom.document().getElementById(id) {
          Some(target_el) => {
            handle_single_oob(el, target_el, oob_val)
            // Remove from response content
            el.remove()
          }
          None => @core.log(@core.any("OOB Error: Target id=\{id} not found"))
        }
      None =>
        @core.log(@core.any("OOB Error: hx-swap-oob element requires an id"))
    }
  }
}

///|
/// Handle a single OOB swap
fn handle_single_oob(
  new_el : @dom.Element,
  target_el : @dom.Element,
  oob_val : String,
) -> Unit {
  // Parse OOB value for swap style (e.g. "true", "innerHTML", "outerHTML:#foo")
  // For now, simple implementation: if "true", use outerHTML swap
  // TODO: Support complex OOB syntax (e.g. "beforeend:.target")

  // Default OOB is outerHTML replacement
  // TODO: Implement parsing for "beforeend:#id" etc.
  if oob_val != "true" {
    // Log warning for unsupported OOB syntax for now
    @core.log(
      @core.any("Warning: Unsupported OOB syntax: \{oob_val}. Using outerHTML."),
    )
  }
  let content = get_outer_html(new_el)
  target_el.setOuterHTML(content)
}

///|
/// Get innerHTML property
extern "js" fn get_inner_html(element : @dom.Element) -> String =
  #|(el) => el.innerHTML

///|
/// Get outerHTML property
extern "js" fn get_outer_html(element : @dom.Element) -> String =
  #|(el) => el.outerHTML
