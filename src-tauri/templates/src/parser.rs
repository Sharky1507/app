#[derive(Clone, PartialEq, Debug)]
pub enum Val {
    Str(String),
    Ident(String),
}

#[derive(Clone, PartialEq, Debug)]
pub enum Token {
    Raw(String),
    Var { name: String },
    Fn { name: String, args: Vec<Val> },
    Eof,
}

// Template Syntax
//
//  ${[ my_var ]}
//  ${[ my_fn() ]}
//  ${[ my_fn(my_var) ]}
//  ${[ my_fn(my_var, "A String") ]}

// default
#[derive(Default)]
pub struct Parser {
    tokens: Vec<Token>,
    chars: Vec<char>,
    pos: usize,
    curr_text: String,
}

impl Parser {
    pub fn new(text: &str) -> Parser {
        Parser {
            chars: text.chars().collect(),
            ..Parser::default()
        }
    }

    pub fn parse(&mut self) -> Vec<Token> {
        let start_pos = self.pos;

        while self.pos < self.chars.len() {
            if self.match_str("${[") {
                let start_curr = self.pos;
                if let Some(t) = self.parse_tag() {
                    self.push_token(t);
                } else {
                    self.pos = start_curr;
                    self.curr_text += "${[";
                }
            } else {
                let ch = self.next_char();
                self.curr_text.push(ch);
            }

            if start_pos == self.pos {
                panic!("Parser stuck!");
            }
        }

        self.push_token(Token::Eof);
        self.tokens.clone()
    }

    fn parse_tag(&mut self) -> Option<Token> {
        // Parse up to first identifier
        //    ${[ my_var...
        self.skip_whitespace();
        let name = match self.parse_ident() {
            None => return None,
            Some(v) => v,
        };

        // Parse fn args if they exist
        //    ${[ my_var(a, b, c)
        let args = if self.match_str("(") {
            self.parse_fn_args()
        } else {
            None
        };

        // Parse to closing tag
        //    ${[ my_var(a, b, c) ]}
        self.skip_whitespace();
        if !self.match_str("]}") {
            return None;
        }

        Some(match args {
            Some(a) => Token::Fn { args: a, name },
            None => Token::Var { name },
        })
    }

    #[allow(dead_code)]
    fn debug_pos(&self, x: &str) {
        println!(
            r#"Position: {x} -- [{}] = {} --> "{}"#,
            self.pos,
            self.chars[self.pos],
            self.chars.iter().collect::<String>()
        );
    }

    fn parse_fn_args(&mut self) -> Option<Vec<Val>> {
        let start_pos = self.pos;

        let mut args: Vec<Val> = Vec::new();
        while self.pos < self.chars.len() {
            self.skip_whitespace();
            if let Some(v) = self.parse_ident_or_string() {
                args.push(v);
            }

            self.skip_whitespace();
            if self.match_str(")") {
                break;
            }

            self.skip_whitespace();

            // If we don't find a comma, that's bad
            if !args.is_empty() && !self.match_str(",") {
                return None;
            }

            if start_pos == self.pos {
                panic!("Parser stuck!");
            }
        }

        return Some(args);
    }

    fn parse_ident_or_string(&mut self) -> Option<Val> {
        if let Some(i) = self.parse_ident() {
            Some(Val::Ident(i))
        } else if let Some(s) = self.parse_string() {
            Some(Val::Str(s))
        } else {
            None
        }
    }

    fn parse_ident(&mut self) -> Option<String> {
        let start_pos = self.pos;

        let mut text = String::new();
        while self.pos < self.chars.len() {
            let ch = self.peek_char();
            if ch.is_alphanumeric() || ch == '_' {
                text.push(ch);
                self.pos += 1;
            } else {
                break;
            }

            if start_pos == self.pos {
                panic!("Parser stuck!");
            }
        }

        if text.is_empty() {
            return None;
        }

        return Some(text);
    }

    fn parse_string(&mut self) -> Option<String> {
        let start_pos = self.pos;
        let mut text = String::new();
        if !self.match_str("\"") {
            return None;
        }

        let mut found_closing = false;
        while self.pos < self.chars.len() {
            let ch = self.next_char();
            match ch {
                '\\' => {
                    text.push(self.next_char());
                }
                '"' => {
                    found_closing = true;
                    break;
                }
                _ => {
                    text.push(ch);
                }
            }

            if start_pos == self.pos {
                panic!("Parser stuck!");
            }
        }

        if !found_closing {
            self.pos = start_pos;
            return None;
        }

        return Some(text);
    }

    fn skip_whitespace(&mut self) {
        while self.pos < self.chars.len() {
            if self.peek_char().is_whitespace() {
                self.pos += 1;
            } else {
                break;
            }
        }
    }

    fn next_char(&mut self) -> char {
        let ch = self.peek_char();

        self.pos += 1;
        ch
    }

    fn peek_char(&self) -> char {
        let ch = self.chars[self.pos];
        ch
    }

    fn push_token(&mut self, token: Token) {
        // Push any text we've accumulated
        if !self.curr_text.is_empty() {
            let text_token = Token::Raw(self.curr_text.clone());
            self.tokens.push(text_token);
            self.curr_text.clear();
        }

        self.tokens.push(token);
    }

    fn match_str(&mut self, value: &str) -> bool {
        if self.pos + value.len() > self.chars.len() {
            return false;
        }

        let cmp = self.chars[self.pos..self.pos + value.len()]
            .iter()
            .collect::<String>();

        if cmp == value {
            // We have a match, so advance the current index
            self.pos += value.len();
            true
        } else {
            false
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::*;

    #[test]
    fn var_simple() {
        let mut p = Parser::new("${[ foo ]}");
        assert_eq!(
            p.parse(),
            vec![Token::Var { name: "foo".into() }, Token::Eof]
        );
    }

    #[test]
    fn var_multiple_names_invalid() {
        let mut p = Parser::new("${[ foo bar ]}");
        assert_eq!(
            p.parse(),
            vec![Token::Raw("${[ foo bar ]}".into()), Token::Eof]
        );
    }

    #[test]
    fn tag_string() {
        let mut p = Parser::new(r#"${[ "foo \"bar\" baz" ]}"#);
        assert_eq!(
            p.parse(),
            vec![Token::Raw(r#"${[ "foo \"bar\" baz" ]}"#.into()), Token::Eof]
        );
    }

    #[test]
    fn var_surrounded() {
        let mut p = Parser::new("Hello ${[ foo ]}!");
        assert_eq!(
            p.parse(),
            vec![
                Token::Raw("Hello ".to_string()),
                Token::Var { name: "foo".into() },
                Token::Raw("!".to_string()),
                Token::Eof,
            ]
        );
    }

    #[test]
    fn fn_simple() {
        let mut p = Parser::new("${[ foo() ]}");
        assert_eq!(
            p.parse(),
            vec![
                Token::Fn {
                    name: "foo".into(),
                    args: Vec::new(),
                },
                Token::Eof
            ]
        );
    }

    #[test]
    fn fn_ident_arg() {
        let mut p = Parser::new("${[ foo(bar) ]}");
        assert_eq!(
            p.parse(),
            vec![
                Token::Fn {
                    name: "foo".into(),
                    args: vec![Val::Ident("bar".into())],
                },
                Token::Eof
            ]
        );
    }

    #[test]
    fn fn_ident_args() {
        let mut p = Parser::new("${[ foo(bar,baz, qux ) ]}");
        assert_eq!(
            p.parse(),
            vec![
                Token::Fn {
                    name: "foo".into(),
                    args: vec![
                        Val::Ident("bar".into()),
                        Val::Ident("baz".into()),
                        Val::Ident("qux".into()),
                    ],
                },
                Token::Eof
            ]
        );
    }

    #[test]
    fn fn_mixed_args() {
        let mut p = Parser::new(r#"${[ foo(bar,"baz \"hi\"", qux ) ]}"#);
        assert_eq!(
            p.parse(),
            vec![
                Token::Fn {
                    name: "foo".into(),
                    args: vec![
                        Val::Ident("bar".into()),
                        Val::Str(r#"baz "hi""#.into()),
                        Val::Ident("qux".into()),
                    ],
                },
                Token::Eof
            ]
        );
    }
}