---
layout: post
title:  "Browserify and CommonJS"
categories: building packaging
date:   2014-11-26 01:38:02
---

Our build system needs to promote fast first downloads, high quality, 
and modularity. We're using Browserify and its CommonJS roots for this.

In previous incarnations of the code base, we generated two piles of JS
and CSS: one for external libraries (which don't change frequently 
between releases) and one for Moondash code (which changes a lot.) We 
wanted these two piles -- ``moondash-vendor`` and ``moondash`` -- for 
several reasons:

- The ``moondash-vendor`` pile is big. We want to apply policies to 
shrink it, then give a cache value to never come back once you have 
that version.

- It takes a while (several seconds) to generate ``moondash-vendor``. 
When doing watch-based development, that is annoying.

- We might want different policies for the two piles regarding 
minification, sourcemaps, cachebusting, etc.

With Browserify, we can produce these two pile and make relations 
between them quite easily.

Second, we'd like a more modular approach to developing Moondash as 
components (and subcomponents.) Instead of having these units express 
their dependencies in a global Gulp list of files in ``node_modules``, 
we'd like to let CommonJS express a dependency chain for the components
and the subcomponents to say the depend on a library. Remove that 
component and you don't have to remember to go remove the dependency.

Equally, names don't appear by magic, just because they are shoved into
the browser. If you want something, you have to ask for it. And when 
you write a component used by another component, you have make it 
available, then ask for it.

Finally, there is the hope that we can:

- Get more isolated tests without loading a JS bundle that has the 
universe

- Tap into some of the browser-capable NPM packages traditionally 
associated with NodeJS

But all isn't sunshine and roses. This has proven difficult to get 
several aspects working in coordination:

- Some packages are fully NPM+CommonJS, some are NPM but don't export 
the package data correction and need browserify-shim, some have an 
outdated version in the NPM registry and need to be pointed at a GitHub
tag

- Browserify and browserify-shim have a number of subtleties which...

- ...don't play well when producing a vendor bundles and an application
bundle

- In some cases you ``require()`` the package to get it into your 
Angular code, in other cases the shim has already made it available and
you just use normal Angular dependency techniques

As we add more variations of packages, we'll come across more edge 
cases. As well, getting all this working, and working efficiently, with
Karma and Protractor will be a big step.
 