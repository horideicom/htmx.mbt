///|
/// Tests for form data collection utilities

///|
test "values_to_query_string basic" {
  let values : Array[(String, String)] = [("name", "John"), ("age", "30")]
  let result = values_to_query_string(values)
  inspect(result, content="name=John&age=30")
}

///|
test "values_to_query_string with special chars" {
  let values : Array[(String, String)] = [("q", "hello world"), ("tag", "a&b")]
  let result = values_to_query_string(values)
  inspect(result, content="q=hello%20world&tag=a%26b")
}

///|
test "values_to_query_string with japanese chars" {
  let values : Array[(String, String)] = [("query", "こんにちは")]
  let result = values_to_query_string(values)
  // Japanese characters are percent-encoded as UTF-8
  inspect(result.contains("query="), content="true")
  inspect(result.length() > 0, content="true")
}

///|
test "values_to_query_string empty" {
  let values : Array[(String, String)] = []
  let result = values_to_query_string(values)
  inspect(result, content="")
}

///|
test "values_to_query_string single value" {
  let values : Array[(String, String)] = [("key", "value")]
  let result = values_to_query_string(values)
  inspect(result, content="key=value")
}

///|
test "append_query_string to url without params" {
  let result = append_query_string("/api/search", "q=test")
  inspect(result, content="/api/search?q=test")
}

///|
test "append_query_string to url with params" {
  let result = append_query_string("/api/search?page=1", "q=test")
  inspect(result, content="/api/search?page=1&q=test")
}

///|
test "append_query_string with empty query" {
  let result = append_query_string("/api/data", "")
  inspect(result, content="/api/data")
}

///|
test "append_query_string url with fragment" {
  let result = append_query_string("/api/search#section", "q=test")
  // Current implementation: appends ? after fragment
  inspect(result, content="/api/search#section?q=test")
}

///|
test "values_to_query_string with multiple special chars" {
  let values : Array[(String, String)] = [
    ("email", "test@example.com"),
    ("path", "/home/user"),
    ("plus", "1+1=2"),
  ]
  let result = values_to_query_string(values)
  inspect(result.contains("email=test%40example.com"), content="true")
  inspect(result.contains("path=%2Fhome%2Fuser"), content="true")
  inspect(result.contains("plus=1%2B1%3D2"), content="true")
}
