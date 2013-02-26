/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var TwigHighlightRules = function() {
    // inspired by Liquid, PHP and JavaScript Highlight Rules

    // repeat the HTML rules (like PHP does)
    HtmlHighlightRules.call(this);

    // capture all of the twig keywords
    var tags = ("autoescape|block|do|embed|extends|filter|flush|for|from|if|import|include|macro|sandbox|set|spaceless|use|verbatim");
        tags += ("end" + tags.replace(/\|/g, "|end"));
    var filters = ("abs|batch|capitalize|convert_encoding|date|date_modify|default|escape|first|format|join|json_encode|keys|last|length|lower|merge|nl2br|number_format|raw|replace|reverse|slice|sort|split|striptags|title|trim|upper|url_encode");
    var functions = ("attribute|block|constant|cycle|date|dump|include|parent|random|range|template_from_string");
    var tests = ("constant|divisibleby|sameas|defined|empty|even|iterable|odd");
    var constants = ("null|none|true|false");

    var operators = {};
    operators.bitwise = ("b-and|b-xor|b-or");
    operators.comparison = ("in|is");
    operators.logical = ("and|or|not");

    var keywordMapper = this.createKeywordMapper({
        "keyword.control.twig": tags,
        "support.function.twig": [filters, functions, tests].join("|"),
        "keyword.operator.bitwise.twig":  operators.bitwise,
        "keyword.operator.comparison.twig": operators.comparison,
        "keyword.operator.logical.twig": operators.logical,
        "constant.language.twig": constants
    }, "identifier");

    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    // add twig start tags to the HTML start tags
    this.$rules.start.unshift({
            token : "variable.other.readwrite.local.twig",
            regex : "\\{\\{-?",
            next : "twig-start"
        }, {
            token : "meta.tag.twig",
            regex : "\\{%-?",
            next : "twig-start"
        }, {
            token : "comment.block.twig",
            regex : "\\{#-?",
            next : "comment"
        });

    // add twig closing comment to HTML comments
    this.$rules.comment.unshift({
            token : "comment.block.twig",
            regex : ".*-?#\\}",
            next : "start"
        });

    // Specific twig rules (heavily borrowed from Liquid, some from JavaScript)
    this.$rules["twig-start"] = [
        {
            token : "variable.other.readwrite.local.twig",
            regex : "-?\\}\\}",
            next : "start"
        }, {
            token : "meta.tag.twig",
            regex : "-?%\\}",
            next : "start"
        }, {
            token : "string",
            regex : "'(?=.)",
            next  : "twig-qstring"
        }, {
            token : "string",
            regex : '"(?=.)',
            next  : "twig-qqstring"
        }, {
            token : "constant.numeric", // hex
            regex : "0[xX][0-9a-fA-F]+\\b"
        }, {
            token : "constant.numeric", // float
            regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token : "constant.language.boolean",
            regex : "(?:true|false)\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator.assignment",
            regex : "=|~"
        }, {
            token : "keyword.operator.comparison",
            regex : "==|!=|<|>|>=|<=|==="
        }, {
            token : "keyword.operator.arithmetic",
            regex : "\\+|-|/|%|//|\\*|\\*\\*"
        }, {
            token : "keyword.operator.other",
            regex : "\\.\\.|\\|"
        }, {
            token : "punctuation.operator",
            regex : /\?|\:|\,|\;|\./
        }, {
            token : "paren.lparen",
            regex : /[\[\({]/
        }, {
            token : "paren.rparen",
            regex : /[\])}]/
        }, {
            token : "text",
            regex : "\\s+"
        } ];

    // Borrow quoted strings from JavaScript
    // TODO: is escapedRe appropriate for Twig?
    var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
        "u[0-9a-fA-F]{4}|" + // unicode
        "[0-2][0-7]{0,2}|" + // oct
        "3[0-6][0-7]?|" + // oct
        "37[0-7]?|" + // oct
        "[4-7][0-7]?|" + //oct
        ".)";

    this.$rules["twig-qqstring"] = [
        {
            token : "constant.language.escape",
            regex : escapedRe
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "twig-qqstring",
        }, {
            token : "string",
            regex : '"|$',
            next  : "twig-start",
        }, {
            token : "string",
            regex : '.|\\w+|\\s+',
        }
    ];

    this.$rules["twig-qstring"] = [
        {
            token : "constant.language.escape",
            regex : escapedRe
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "twig-qstring",
        }, {
            token : "string",
            regex : "'|$",
            next  : "twig-start",
        }, {
            token : "string",
            regex : '.|\\w+|\\s+',
        }
    ];
};

oop.inherits(TwigHighlightRules, TextHighlightRules);

exports.TwigHighlightRules = TwigHighlightRules;
});