---
layout: post
title:  "NPM, not Bower"
date:   2014-11-26 00:38:02
categories: building packaging
---

As we build Moondash, we'll document some of our decisions in posts 
filed with the ``building`` category. First up: how we package things.


We've decided to eschew Bower in favor of pure NPM packaging. That 
means our dependencies, such as AngularJS, are stated in the 
``dependencies`` section of Moondash's ``package.json``. One packaging 
system (npm) instead of two (npm+bower).

Many of the packages that we plan to use (AngularJS, Bootstrap, etc.) 
are published in the NPM registry. Some aren't, or are behind on 
published versions. Fortunately the ``package.json`` dependency can 
point at a URL for a tag on GitHub.

Our ``package.json`` has a ``devDependencies`` where we list all the 
internal tools (gulp, etc.) that we, the Moondash team, use when 
developing Moondash. The dependencies in the built Moondash, though, 
are listed under ``dependencies``. For example:

{% highlight json %}
  "dependencies": {
    "angular": "~1.3.0",
    "angular-ui-router": "git://github.com/angular-ui/ui-router",
    "bootstrap-sass": "^3.3.1",
    "lodash": "^2.4.1"
  }
{% endhighlight %}