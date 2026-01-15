///|
/// Variable processing for hx-vars and hx-vals attributes

///|
/// Get all expression vars (hx-vars + hx-vals combined) from an element
/// Returns a Map that can be converted to @core.Any for FFI
pub fn get_expression_vars(elt : @dom.Element?, event : @core.Any?) -> Map[String, String] {
  get_expression_vars_inner(elt, event)
}

///|
/// Convert Map[String, String] to @core.Any for FFI
extern "js" fn map_to_any(m : Map[String, String]) -> @core.Any =
  #|(m) => {
  #|  // MoonBit Map has { buf: [{_0: key, _1: value}, ...], start, end } structure
  #|  return m;  // Return the Map directly, it's already in JS format
  #|}

///|
/// Internal function to get expression vars via FFI
extern "js" fn get_expression_vars_inner(
  elt : @dom.Element?,
  event : @core.Any?,
) -> Map[String, String] =
  #|(elt, event) => {
  #|  // Unwrap MoonBit Option type for elt
  #|  const element = (elt && elt.$tag === 1) ? elt._0 : null;
  #|
  #|  // Helper to get attribute value (checks both hx-* and data-hx-*)
  #|  const getAttributeValue = (el, attr) => {
  #|    if (!el) return null;
  #|    return el.getAttribute(attr) || el.getAttribute('data-' + attr);
  #|  };
  #|
  #|  // Parse and evaluate hx-vars/hx-vals attribute value
  #|  const parseVarsValue = (elt, attrValue, evaluate) => {
  #|    let str = attrValue ? attrValue.trim() : '';
  #|    let evaluateValue = evaluate;
  #|
  #|    // Check for 'unset' keyword
  #|    if (str === 'unset') {
  #|      return null;
  #|    }
  #|
  #|    // Check for javascript: or js: prefix
  #|    if (str.indexOf('javascript:') === 0) {
  #|      str = str.slice(11);
  #|      evaluateValue = true;
  #|    } else if (str.indexOf('js:') === 0) {
  #|      str = str.slice(3);
  #|      evaluateValue = true;
  #|    }
  #|
  #|    // Wrap in braces if not already present
  #|    if (str.indexOf('{') !== 0) {
  #|      str = '{' + str + '}';
  #|    }
  #|
  #|    let varsValues;
  #|    if (evaluateValue) {
  #|      // Check if allowEval is enabled
  #|      const allowEval = window.htmx && window.htmx.config && window.htmx.config.allowEval !== false;
  #|      if (!allowEval) {
  #|        // Trigger evalDisallowedError event
  #|        const errorEvt = new CustomEvent('htmx:evalDisallowedError', {
  #|          bubbles: true,
  #|          cancelable: true,
  #|          detail: { source: 'hx-vars' }
  #|        });
  #|        elt.dispatchEvent(errorEvt);
  #|        return {};
  #|      }
  #|      try {
  #|        if (event) {
  #|          // Unwrap event Option if needed
  #|          const evt = (event && event.$tag === 1) ? event._0 : event;
  #|          varsValues = new Function('event', 'return (' + str + ')').call(elt, evt);
  #|        } else {
  #|          varsValues = new Function('return (' + str + ')').call(elt);
  #|        }
  #|      } catch (e) {
  #|        console.error('htmx.mbt: Error evaluating vars:', e);
  #|        return {};
  #|      }
  #|    } else {
  #|      try {
  #|        varsValues = JSON.parse(str);
  #|      } catch (e) {
  #|        console.error('htmx.mbt: Error parsing vars JSON:', e);
  #|        return {};
  #|      }
  #|    }
  #|
  #|    return varsValues || {};
  #|  };
  #|
  #|  // Collect values from hx-vars or hx-vals attribute on element and its parents
  #|  const getValuesForElement = (elt, attr, evalAsDefault, values, event) => {
  #|    if (values == null) {
  #|      values = {};
  #|    }
  #|    if (elt == null) {
  #|      return values;
  #|    }
  #|    const attributeValue = getAttributeValue(elt, attr);
  #|    if (attributeValue) {
  #|      let str = attributeValue.trim();
  #|      let evaluateValue = evalAsDefault;
  #|      if (str === 'unset') {
  #|        return null;
  #|      }
  #|      if (str.indexOf('javascript:') === 0) {
  #|        str = str.slice(11);
  #|        evaluateValue = true;
  #|      } else if (str.indexOf('js:') === 0) {
  #|        str = str.slice(3);
  #|        evaluateValue = true;
  #|      }
  #|      if (str.indexOf('{') !== 0) {
  #|        str = '{' + str + '}';
  #|      }
  #|      let varsValues;
  #|      if (evaluateValue) {
  #|        varsValues = parseVarsValue(elt, str, true);
  #|      } else {
  #|        varsValues = parseVarsValue(elt, str, false);
  #|      }
  #|      for (const key in varsValues) {
  #|        if (varsValues.hasOwnProperty(key)) {
  #|          if (values[key] == null) {
  #|            values[key] = varsValues[key];
  #|          }
  #|        }
  #|      }
  #|    }
  #|    // Continue to parent
  #|    const parent = elt.parentElement;
  #|    if (parent) {
  #|      return getValuesForElement(parent, attr, evalAsDefault, values, event);
  #|    }
  #|    return values;
  #|  };
  #|
  #|  // Get both hx-vars and hx-vals
  #|  let vars = {};
  #|  let vals = {};
  #|
  #|  if (element) {
  #|    vars = getValuesForElement(element, 'hx-vars', true, {}, event) || {};
  #|    vals = getValuesForElement(element, 'hx-vals', false, {}, event) || {};
  #|  }
  #|
  #|  // Merge vars and vals, with vals taking precedence
  #|  const result = { ...vars, ...vals };
  #|
  #|  // Convert to MoonBit Map format
  #|  const entries = Object.entries(result);
  #|  const buf = [];
  #|  for (const [k, v] of entries) {
  #|    buf.push({ _0: k, _1: String(v) });
  #|  }
  #|  return { buf: buf, start: 0, end: buf.length };
  #|}
