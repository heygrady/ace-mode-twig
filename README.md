ace-mode-twig
=============

A mode for the [Ace](http://ace.ajax.org/) JavaScript text editor for highlighting [Twig](http://twig.sensiolabs.org/) templates.

The highlighting mode borrows heavily from the [Liquid highlight mode](https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/liquid_highlight_rules.js) already bundled with Ace.

Using Twig Mode in Ace
----------------------

You need to clone the [main Ace repository](https://github.com/ajaxorg/ace). There's no need to fork it, you can simply clone it as read only. Next, you need to move the two twig mode files to the `lib/ace/mode` directory. Then you need to build Ace normally.

Building Ace
------------

*copied from the [Ace Readme](https://github.com/ajaxorg/ace/blob/master/Readme.md)*

All you need is Node.js and npm installed to package ACE. Just run `npm install` in the ace folder to install dependencies:

```bash
    npm install
    node ./Makefile.dryice.js
```

To package Ace, we use the dryice build tool developed by the Mozilla Skywriter team. Call `node Makefile.dryice.js` on the command-line to start the packing. This build script accepts the following options

```bash
-m                 minify build files with uglify-js          
-nc                namespace require and define calls with "ace"
-bm                builds the bookmarklet version
--target ./path    specify relative path for output folder (default value is "./build")
```

To generate all the files in the ace-builds repository, run `node Makefile.dryice.js full --target ../ace-builds`