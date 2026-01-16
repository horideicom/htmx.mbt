///|
/// Tokenizer for parsing htmx trigger specifications and conditional expressions

///|
/// Tokenize a string into an array of tokens
/// This function handles:
/// - Preserving spaces as separate tokens
/// - Recognizing operators: ( ) , . & && || == ! !=
/// - Handling quoted strings: 'asdf' ",asdf"
/// - Processing escape sequences: ",as\\"df"
pub fn tokenize_string(str : String) -> @core.Any {
  tokenize_string_js(str)
}

///|
/// JavaScript implementation of tokenize_string
/// Ported from htmx.org to maintain compatibility
extern "js" fn tokenize_string_js(str : String) -> @core.Any =
  #|(str) => {
  #|  const tokens = [];
  #|  let position = 0;
  #|  const SYMBOL_START = /[_$a-zA-Z]/;
  #|  const SYMBOL_CONT = /[_$a-zA-Z0-9]/;
  #|  const STRINGISH_START = ['"', "'", '/'];
  #|
  #|  while (position < str.length) {
  #|    const char = str.charAt(position);
  #|
  #|    // Check for symbol/identifier start
  #|    if (SYMBOL_START.test(char)) {
  #|      let startPosition = position;
  #|      while (position + 1 < str.length && SYMBOL_CONT.test(str.charAt(position + 1))) {
  #|        position++;
  #|      }
  #|      tokens.push(str.substring(startPosition, position + 1));
  #|      position++;
  #|      continue;
  #|    }
  #|
  #|    // Check for quoted string
  #|    if (STRINGISH_START.indexOf(char) !== -1) {
  #|      const startChar = char;
  #|      let startPosition = position;
  #|      position++;
  #|      while (position < str.length && str.charAt(position) !== startChar) {
  #|        if (str.charAt(position) === '\\') {
  #|          position++; // Skip escaped character
  #|        }
  #|        position++;
  #|      }
  #|      // Include closing quote
  #|      if (position < str.length) {
  #|        position++;
  #|      }
  #|      tokens.push(str.substring(startPosition, position));
  #|      continue;
  #|    }
  #|
  #|    // Note: We don't combine multi-character operators here
  #|    // htmx tokenizer treats &&, ||, ==, != as individual characters
  #|    // This allows the conditional generator to handle them properly
  #|
  #|    // Single character (spaces, operators, etc.)
  #|    tokens.push(char);
  #|    position++;
  #|  }
  #|
  #|  return tokens;
  #|}
