---
layout: default
title: Demos
order: 2
---

# Demos

The Moondash repo has some demo "applications". Periodically we copy 
them over here and give a little writeup. Later we'll make a separate 
package that is a full-featured demo written with the same best 
practices we use to build Moondash. Maybe we'll make a Yeoman template 
as well.

## Hello

[demo](/moondash/demos/build/hello)

The smallest-possible demo. We start with an HTML file that includes 
the CSS and JS. It also declares ``ng-app="hello"`` and 
``ng-controller="HelloCtrl as ctrl"``:

{% highlight html %}
<!DOCTYPE html>
<html ng-app="hello">
<head>
  <meta charset="utf-8">
  <title>My Site</title>
  <link type="text/css" rel="stylesheet" href="../moondash.css">
</head>
<body ng-controller="HelloCtrl as ctrl">

<div class="container">
  <h1 ng-bind="ctrl.title">Hello Default</h1>

  <p>Simplest possible demo. Has an <code>app.js</code> which
    initializes a module that depends on <code>moondash</code>.</p>
</div>

<script src="../moondash-vendors.js"></script>
<script src="../moondash.js"></script>
<script src="../moondash-templates.js"></script>
<script src="app.js"></script>
</body>
</html>
{% endhighlight %}

The ``app.js`` is minimal Angular:

{% highlight javascript %}
angular.module('hello', ['moondash'])
  .controller(
  'HelloCtrl',
  function () {
    this.title = 'Hello Moondash';
  });
  {% endhighlight %}


## Hello ui-router

[demo](/moondash/demos/build/hello-ui-router)

Moondash is built around ui-router's concept of state-based routing. It
provides base states that have templates organized around named views 
that can be filled in by children. This demo shows some of these concepts.

The ``index.html`` is actually a bit smaller:
 
{% highlight html %}
<!DOCTYPE html>
<html ng-app="hello-ui-router">
<head>
  <meta charset="utf-8">
  <title>My Site</title>
  <link type="text/css" rel="stylesheet" href="../moondash.css">
</head>
<body>

<div ui-view></div>

<script src="../moondash-vendors.js"></script>
<script src="../moondash.js"></script>
<script src="../moondash-templates.js"></script>
<script src="app.js"></script>
</body>
</html>
{% endhighlight %}

The magic is in the ``<div ui-view>``. This tells the ui-router to fill
in that spot with the current ``$state``'s rendering. Let's look at our
states in ``app.js``:
 

{% highlight javascript %}
function ModuleInit($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise("/state1");
  $stateProvider
    .state("root.state1", {
             url: '/state1',
             section: {
               'title': 'State One'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'state1.partial.html'
               }
             }
           })
    .state("root.state2", {
             url: '/state2',
             section: {
               'title': 'State Two'
             },
             views: {
               'md-content@root': {
                 templateUrl: 'state2.partial.html'
               }
             }
           })
    .state("root.state3", {
             url: '/state3',
             section: {
               'title': 'State Three'
             },
             views: {
               '@': {
                 templateUrl: 'state3.partial.html'
               }
             }
           });
}

angular.module('hello-ui-router', ['moondash'])
  .config(ModuleInit);
{% endhighlight %}

Our site has 3 "states" which model pages in the site: ``/state1``, 
``/state2``, and ``state3``. Each shows important Moondash concepts:

- By nesting our states under the Moondash-provided ``root.`` parent 
state, we plug into a ready-to-go application with a layout and logic.

- Moondash's ``root`` state a sophisticated template that provides an 
existing UX, manifested by named views. ``md-content@root`` says this 
state is going to fill in the ``md-content`` named view in the ``root``
state.

- This UX also looks for extra information in your states (``section``), 
allowing them to plug into Moondash's menu system.

- ``root.state3`` shows that a state can override a parent's name view.
In this case, ``root.state3`` overrides Moondash's entire layout by 
filling in ``@`` instead of ``md-content@root``. This actually points 
at Moondash's ``layout`` abstract state which is the parent of Moondash's 
``root`` state.

Here's the small amount of markup in ``state1.partial.html`` needed for a 
state:

{% highlight html %}
<div>
  <h1>State 1</h1>
  <p>This is <code>state1</code>.</p>
</div>
{% endhighlight %}

These states in your application, as "sections", can have nested child 
states and grandchildren, providing a powerful way to organize state, 
logic, UX, and configuration up and down a sitemap.

## Layout

[demo](/moondash/demos/build/layout)
