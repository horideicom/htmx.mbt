///|
test "parse_trigger basic" {
  let t = parse_trigger("click")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="0")
}

///|
test "parse_trigger with delay" {
  let t = parse_trigger("click delay:500ms")
  inspect(t.event_name, content="click")
  inspect(t.get_delay_ms(), content="500")
}

///|
test "parse_trigger with delay seconds" {
  let t = parse_trigger("click delay:2s")
  inspect(t.get_delay_ms(), content="2000")
}

///|
test "parse_trigger with from" {
  let t = parse_trigger("click from:body")
  inspect(t.event_name, content="click")
  inspect(t.get_from_selector(), content="Some(\"body\")")
}

///|
test "parse_trigger with filter" {
  let t = parse_trigger("click[ctrlKey]")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="1")
}

///|
test "parse_trigger complex" {
  let t = parse_trigger("keyup[key=='Enter'] delay:100ms from:body once")
  inspect(t.event_name, content="keyup")
  inspect(t.get_delay_ms(), content="100")
  inspect(t.get_from_selector(), content="Some(\"body\")")
  inspect(t.has_once(), content="true")
}

///|
test "parse_triggers multiple" {
  let triggers = parse_triggers("click, mouseover delay:500ms")
  inspect(triggers.length(), content="2")
  inspect(triggers[0].event_name, content="click")
  inspect(triggers[1].event_name, content="mouseover")
}

///|
test "parse_trigger with throttle" {
  let t = parse_trigger("click throttle:500ms")
  inspect(t.event_name, content="click")
  inspect(t.get_throttle_ms(), content="500")
}

///|
test "parse_trigger with throttle seconds" {
  let t = parse_trigger("click throttle:2s")
  inspect(t.event_name, content="click")
  inspect(t.get_throttle_ms(), content="2000")
}

///|
test "parse_trigger with queue first" {
  let t = parse_trigger("click queue:first")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="1")
}

///|
test "parse_trigger with queue last" {
  let t = parse_trigger("click queue:last")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="1")
}

///|
test "parse_trigger with queue all" {
  let t = parse_trigger("click queue:all")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="1")
}

///|
test "parse_trigger with queue none" {
  let t = parse_trigger("click queue:none")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="1")
}

///|
test "parse_trigger from document" {
  let t = parse_trigger("click from:document")
  inspect(t.event_name, content="click")
  inspect(t.get_from_selector(), content="Some(\"document\")")
}

///|
test "parse_trigger from window" {
  let t = parse_trigger("click from:window")
  inspect(t.event_name, content="click")
  inspect(t.get_from_selector(), content="Some(\"window\")")
}

///|
test "parse_trigger changed modifier" {
  let t = parse_trigger("change changed")
  inspect(t.event_name, content="change")
  inspect(t.modifiers.length(), content="1")
}

///|
test "parse_trigger consume modifier" {
  let t = parse_trigger("click consume")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="1")
}

///|
test "parse_trigger empty string defaults to click" {
  let t = parse_trigger("")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="0")
}

///|
test "parse_trigger with target modifier" {
  let t = parse_trigger("click target:#output")
  inspect(t.event_name, content="click")
  inspect(t.modifiers.length(), content="1")
}
